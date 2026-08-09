package com.huypt.crawler_service.services;

import com.huypt.crawler_service.dtos.CrawlResult;
import com.huypt.crawler_service.models.Course;
import com.huypt.crawler_service.repositories.CourseRepository;
import com.huypt.crawler_service.utils.SeleniumConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HustCourse {

    private static final String BASE_URL = "http://sis.hust.edu.vn/ModuleProgram/CourseLists.aspx";
    private static final Duration WAIT_TIMEOUT = Duration.ofSeconds(30);
    private static final long PAGE_DELAY = 500;

    private static final By LOADING = By.id("MainContent_gvCoursesGrid_LD");
    private static final By COURSE_ROWS = By.xpath("//table[@id='MainContent_gvCoursesGrid_DXMainTable']/tbody/tr[@class='dxgvDataRow_SisTheme']");
    private static final By DISABLED_NEXT = By.xpath("//*[@id='MainContent_gvCoursesGrid_DXPagerBottom']/b[contains(@class,'dxp-disabledButton')]/img[@alt='Next']");
    private static final By NEXT_BUTTON = By.xpath("//*[@id='MainContent_gvCoursesGrid_DXPagerBottom']/*[contains(@class,'dxp-button')]/img[@alt='Next']");

    private static final String ENGLISH_NAME_XPATH = "//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Tên tiếng anh')]/b[2]";
    private static final String INSTITUTE_XPATH = "//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Viện quản lý')]/b[4]";
    private static final String CONDITION_XPATH = "//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Học phần điều kiện')]/b[1]";

    private final CourseRepository courseRepository;
    private final CrawlerJobLogService jobLogService;

    public CrawlResult crawlData(String crawlerJobLogId) {
        WebDriver driver = null;

        try {
            addJobLog(crawlerJobLogId, "Đang khởi tạo Selenium WebDriver");

            driver = SeleniumConfig.initWebDriver(false);
            WebDriverWait wait = new WebDriverWait(driver, WAIT_TIMEOUT);

            driver.get(BASE_URL);
            waitForLoading(wait);
            addJobLog(crawlerJobLogId, "Đã truy cập trang danh sách học phần HUST");

            List<Course> courses = crawlAllPages(driver, wait, crawlerJobLogId);

            addJobLog(crawlerJobLogId, "Hoàn thành crawl, bắt đầu lưu dữ liệu");
            int savedRecords = saveOrUpdate(courses);

            String successMessage = String.format(
                    "Hoàn thành crawler: %d học phần, %d học phần được thêm/cập nhật",
                    courses.size(),
                    savedRecords
            );

            log.info(successMessage);
            addJobLog(crawlerJobLogId, successMessage);

            return new CrawlResult(courses.size(), savedRecords);
        } catch (Exception e) {
            String errorMessage = getRootCauseMessage(e);
            log.error("Crawler học phần thất bại: {}", errorMessage, e);
            addJobLog(crawlerJobLogId, "Job thất bại: " + errorMessage);
            throw new IllegalStateException("Không thể crawl dữ liệu học phần HUST: " + errorMessage, e);
        } finally {
            closeDriver(driver, crawlerJobLogId);
        }
    }

    private List<Course> crawlAllPages(WebDriver driver, WebDriverWait wait, String crawlerJobLogId) {
        List<Course> courses = new ArrayList<>();
        int pageNumber = 1;

        while (true) {
            log.info("Bắt đầu crawl trang {}", pageNumber);
            addJobLog(crawlerJobLogId, "Bắt đầu xử lý trang " + pageNumber);

            List<Course> pageCourses = extractTableData(wait);
            courses.addAll(pageCourses);

            log.info("Đã xử lý trang {}, số học phần trang này={}, tổng={}", pageNumber, pageCourses.size(), courses.size());
            jobLogService.updateProgress(crawlerJobLogId, pageNumber, courses.size());

            if (!goToNextPage(driver, wait)) {
                log.info("Đã đến trang cuối cùng");
                addJobLog(crawlerJobLogId, "Đã đến trang cuối cùng");
                break;
            }

            pageNumber++;
        }

        return courses;
    }

    private List<Course> extractTableData(WebDriverWait wait) {
        waitForLoading(wait);

        List<WebElement> rows = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(COURSE_ROWS));
        List<Course> courses = new ArrayList<>(rows.size());

        log.info("Trang hiện tại có {} học phần", rows.size());

        for (int rowIndex = 1; rowIndex <= rows.size(); rowIndex++) {
            List<WebElement> columns = getColumns(wait, rowIndex);

            if (columns.size() < 7) {
                throw new IllegalStateException("Dòng " + rowIndex + " chỉ có " + columns.size() + "/7 cột dữ liệu");
            }

            waitForLoading(wait);
            sleep(PAGE_DELAY);
            columns.get(0).click();

            waitForLoading(wait);
            sleep(PAGE_DELAY);

            columns = getColumns(wait, rowIndex);

            String courseCode = getColumnText(columns, 1);
            String courseName = getColumnText(columns, 2);

            Course course = Course.builder()
                    .code(courseCode)
                    .name(courseName)
                    .englishName(getTextOrEmpty(wait, ENGLISH_NAME_XPATH))
                    .duration(getColumnText(columns, 3))
                    .credits(getColumnText(columns, 4))
                    .creditFee(getColumnText(columns, 5))
                    .weight(getColumnText(columns, 6))
                    .listCourseCondition(getTextOrEmpty(wait, CONDITION_XPATH))
                    .instituteManage(getTextOrEmpty(wait, INSTITUTE_XPATH))
                    .build();

            courses.add(course);
            log.debug("Đã crawl học phần {} - {}", courseCode, courseName);
        }

        return courses;
    }

    private boolean goToNextPage(WebDriver driver, WebDriverWait wait) {
        if (!driver.findElements(DISABLED_NEXT).isEmpty()) {
            return false;
        }

        List<WebElement> nextButtons = driver.findElements(NEXT_BUTTON);

        if (nextButtons.isEmpty()) {
            throw new IllegalStateException("Không tìm thấy nút chuyển sang trang tiếp theo");
        }

        nextButtons.get(0).click();
        waitForLoading(wait);
        sleep(PAGE_DELAY);

        return true;
    }

    private int saveOrUpdate(List<Course> crawledCourses) {
        if (crawledCourses.isEmpty()) {
            log.info("Không có dữ liệu học phần để lưu");
            return 0;
        }

        List<Course> uniqueCourses = removeDuplicateCourses(crawledCourses);

        Map<String, Course> existingCourseMap = courseRepository.findAll().stream()
                .filter(course -> hasText(course.getCode()))
                .collect(Collectors.toMap(
                        Course::getCode,
                        Function.identity(),
                        (first, second) -> first,
                        LinkedHashMap::new
                ));

        List<Course> changedCourses = new ArrayList<>();

        for (Course crawledCourse : uniqueCourses) {
            Course existingCourse = existingCourseMap.get(crawledCourse.getCode());

            if (existingCourse == null) {
                crawledCourse.setId(null);
                changedCourses.add(crawledCourse);
                log.info("Thêm mới học phần: {} - {}", crawledCourse.getCode(), crawledCourse.getName());
                continue;
            }

            if (hasChanges(existingCourse, crawledCourse)) {
                updateCourse(existingCourse, crawledCourse);
                changedCourses.add(existingCourse);
                log.info("Cập nhật học phần: {} - {}", crawledCourse.getCode(), crawledCourse.getName());
            }
        }

        if (changedCourses.isEmpty()) {
            log.info("Dữ liệu học phần không có thay đổi");
            return 0;
        }

        courseRepository.saveAll(changedCourses);
        log.info("Đã thêm mới/cập nhật {} học phần", changedCourses.size());

        return changedCourses.size();
    }

    private List<Course> removeDuplicateCourses(List<Course> courses) {
        Map<String, Course> uniqueCourses = courses.stream()
                .filter(course -> hasText(course.getCode()))
                .collect(Collectors.toMap(
                        Course::getCode,
                        Function.identity(),
                        (first, second) -> second,
                        LinkedHashMap::new
                ));

        int duplicateCount = courses.size() - uniqueCourses.size();

        if (duplicateCount > 0) {
            log.warn("Đã loại bỏ {} học phần bị trùng mã", duplicateCount);
        }

        return new ArrayList<>(uniqueCourses.values());
    }

    private boolean hasChanges(Course existing, Course crawled) {
        return !Objects.equals(existing.getName(), crawled.getName())
                || !Objects.equals(existing.getEnglishName(), crawled.getEnglishName())
                || !Objects.equals(existing.getDuration(), crawled.getDuration())
                || !Objects.equals(existing.getCredits(), crawled.getCredits())
                || !Objects.equals(existing.getCreditFee(), crawled.getCreditFee())
                || !Objects.equals(existing.getWeight(), crawled.getWeight())
                || !Objects.equals(existing.getListCourseCondition(), crawled.getListCourseCondition())
                || !Objects.equals(existing.getInstituteManage(), crawled.getInstituteManage());
    }

    private void updateCourse(Course existing, Course crawled) {
        existing.setName(crawled.getName());
        existing.setEnglishName(crawled.getEnglishName());
        existing.setDuration(crawled.getDuration());
        existing.setCredits(crawled.getCredits());
        existing.setCreditFee(crawled.getCreditFee());
        existing.setWeight(crawled.getWeight());
        existing.setListCourseCondition(crawled.getListCourseCondition());
        existing.setInstituteManage(crawled.getInstituteManage());
    }

    private List<WebElement> getColumns(WebDriverWait wait, int rowIndex) {
        String xpath = "//table[@id='MainContent_gvCoursesGrid_DXMainTable']/tbody/tr[@class='dxgvDataRow_SisTheme'][%d]/td".formatted(rowIndex);
        return wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(By.xpath(xpath)));
    }

    private String getColumnText(List<WebElement> columns, int index) {
        return columns.get(index).getText().trim();
    }

    private String getTextOrEmpty(WebDriverWait wait, String xpath) {
        try {
            return wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath(xpath))).getText().trim();
        } catch (Exception e) {
            log.warn("Không lấy được dữ liệu tại XPath {}: {}", xpath, e.getMessage());
            return "";
        }
    }

    private void waitForLoading(WebDriverWait wait) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(LOADING));
    }

    private void addJobLog(String crawlerJobLogId, String message) {
        try {
            jobLogService.addLog(crawlerJobLogId, message);
        } catch (Exception e) {
            log.warn("Không thể ghi log crawler job: {}", e.getMessage());
        }
    }

    private String getRootCauseMessage(Throwable throwable) {
        Throwable rootCause = throwable;

        while (rootCause.getCause() != null) {
            rootCause = rootCause.getCause();
        }

        String message = rootCause.getMessage();
        return message == null || message.isBlank() ? rootCause.getClass().getSimpleName() : message;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private void closeDriver(WebDriver driver, String crawlerJobLogId) {
        if (driver == null) {
            return;
        }

        try {
            driver.quit();
            addJobLog(crawlerJobLogId, "Đã đóng Selenium WebDriver");
        } catch (Exception e) {
            log.warn("Không thể đóng Selenium WebDriver: {}", e.getMessage());
        }
    }

    private void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Crawler thread đã bị gián đoạn", e);
        }
    }
}