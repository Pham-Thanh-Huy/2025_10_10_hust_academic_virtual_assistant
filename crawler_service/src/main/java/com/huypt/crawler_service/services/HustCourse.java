package com.huypt.crawler_service.services;

import com.huypt.crawler_service.dtos.CrawlResult;
import com.huypt.crawler_service.models.Course;
import com.huypt.crawler_service.repositories.CourseRepository;
import com.huypt.crawler_service.utils.SeleniumConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
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
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HustCourse {

    private static final String BASE_URL = "http://sis.hust.edu.vn/ModuleProgram/CourseLists.aspx";
    private static final Duration WAIT_TIMEOUT = Duration.ofSeconds(30);
    private static final long PAGE_DELAY = 500;
    private static final int MAX_RETRY = 10;
    private static final long RETRY_DELAY = 5_000;

    private static final By LOADING = By.id("MainContent_gvCoursesGrid_LD");
    private static final By COURSE_ROWS = By.xpath("//table[@id='MainContent_gvCoursesGrid_DXMainTable']/tbody/tr[@class='dxgvDataRow_SisTheme']");
    private static final By DISABLED_NEXT = By.xpath("//*[@id='MainContent_gvCoursesGrid_DXPagerBottom']/b[contains(@class,'dxp-disabledButton')]/img[@alt='Next']");
    private static final By NEXT_BUTTON = By.xpath("//*[@id='MainContent_gvCoursesGrid_DXPagerBottom']/*[contains(@class,'dxp-button')]/img[@alt='Next']");
    private static final By ENGLISH_NAME = By.xpath("//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Tên tiếng anh')]/b[2]");
    private static final By INSTITUTE = By.xpath("//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Viện quản lý')]/b[4]");
    private static final By CONDITION = By.xpath("//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Học phần điều kiện')]/b[1]");

    private final CourseRepository courseRepository;
    private final CrawlerJobLogService jobLogService;

    public CrawlResult crawlData(String crawlerJobLogId) {
        WebDriver driver = null;

        try {
            addJobLog(crawlerJobLogId, "Đang khởi tạo Selenium WebDriver");
            driver = SeleniumConfig.initWebDriver(false);
            WebDriverWait wait = new WebDriverWait(driver, WAIT_TIMEOUT);

            driver.get(BASE_URL);
            retryAction("Chờ trang danh sách học phần tải xong", () -> waitForLoading(wait));
            addJobLog(crawlerJobLogId, "Đã truy cập trang danh sách học phần HUST");

            List<Course> courses = crawlAllPages(driver, wait, crawlerJobLogId);

            addJobLog(crawlerJobLogId, "Hoàn thành crawl, bắt đầu lưu dữ liệu");
            int savedRecords = saveOrUpdate(courses);

            String successMessage = String.format("Hoàn thành crawler: %d học phần, %d học phần được thêm/cập nhật", courses.size(), savedRecords);
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

            List<Course> pageCourses = extractTableData(wait, pageNumber);
            courses.addAll(pageCourses);

            log.info("Đã xử lý trang {}, số học phần trang này={}, tổng={}", pageNumber, pageCourses.size(), courses.size());
            jobLogService.updateProgress(crawlerJobLogId, pageNumber, courses.size());

            if (!goToNextPage(driver, wait, pageNumber)) {
                log.info("Đã đến trang cuối cùng");
                addJobLog(crawlerJobLogId, "Đã đến trang cuối cùng");
                break;
            }

            pageNumber++;
        }

        return courses;
    }

    private List<Course> extractTableData(WebDriverWait wait, int pageNumber) {
        retryAction("Chờ trang " + pageNumber + " tải xong", () -> waitForLoading(wait));

        List<WebElement> rows = retryGet("Lấy danh sách học phần trang " + pageNumber, () -> {
            List<WebElement> elements = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(COURSE_ROWS));
            if (elements.isEmpty()) throw new NoSuchElementException("Không tìm thấy học phần nào tại trang " + pageNumber);
            return elements;
        });

        int rowCount = rows.size();
        List<Course> courses = new ArrayList<>(rowCount);
        log.info("Trang {} có {} học phần", pageNumber, rowCount);

        for (int rowIndex = 1; rowIndex <= rowCount; rowIndex++) {
            Course course = extractCourse(wait, pageNumber, rowIndex);
            courses.add(course);
            log.info("Đã crawl học phần {} - {}", course.getCode(), course.getName());
        }

        return courses;
    }

    private Course extractCourse(WebDriverWait wait, int pageNumber, int rowIndex) {
        String rowName = "dòng " + rowIndex + " trang " + pageNumber;

        retryAction("Mở chi tiết " + rowName, () -> {
            waitForLoading(wait);
            List<WebElement> columns = getColumns(wait, rowIndex);
            validateColumns(columns, pageNumber, rowIndex);
            wait.until(ExpectedConditions.elementToBeClickable(columns.get(0))).click();
            waitForLoading(wait);
            sleep(PAGE_DELAY);
        });

        String courseCode = getRequiredColumnText(wait, rowIndex, 1, "mã học phần " + rowName);
        String courseName = getRequiredColumnText(wait, rowIndex, 2, "tên học phần " + courseCode);

        return Course.builder()
                .code(courseCode)
                .name(courseName)
                .englishName(getOptionalText(wait, ENGLISH_NAME, "tên tiếng Anh học phần " + courseCode))
                .duration(getOptionalColumnText(wait, rowIndex, 3, "thời lượng học phần " + courseCode))
                .credits(getOptionalColumnText(wait, rowIndex, 4, "số tín chỉ học phần " + courseCode))
                .creditFee(getOptionalColumnText(wait, rowIndex, 5, "hệ số học phí học phần " + courseCode))
                .weight(getOptionalColumnText(wait, rowIndex, 6, "trọng số học phần " + courseCode))
                .listCourseCondition(getOptionalText(wait, CONDITION, "học phần điều kiện của " + courseCode))
                .instituteManage(getOptionalText(wait, INSTITUTE, "viện quản lý học phần " + courseCode))
                .isSync(false)
                .build();
    }

    private boolean goToNextPage(WebDriver driver, WebDriverWait wait, int currentPage) {
        return retryGet("Chuyển từ trang " + currentPage + " sang trang " + (currentPage + 1), () -> {
            waitForLoading(wait);

            if (!driver.findElements(DISABLED_NEXT).isEmpty()) return false;

            WebElement nextButton = wait.until(ExpectedConditions.elementToBeClickable(NEXT_BUTTON));
            nextButton.click();
            waitForLoading(wait);
            sleep(PAGE_DELAY);

            return true;
        });
    }

    private List<WebElement> getColumns(WebDriverWait wait, int rowIndex) {
        By locator = By.xpath("//table[@id='MainContent_gvCoursesGrid_DXMainTable']/tbody/tr[@class='dxgvDataRow_SisTheme'][" + rowIndex + "]/td");
        return wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(locator));
    }

    private String getRequiredColumnText(WebDriverWait wait, int rowIndex, int columnIndex, String elementName) {
        return retryGet("Lấy " + elementName, () -> {
            List<WebElement> columns = getColumns(wait, rowIndex);
            if (columns.size() <= columnIndex) throw new NoSuchElementException("Không tồn tại cột " + columnIndex);

            String value = columns.get(columnIndex).getText().trim();
            if (value.isBlank()) throw new NoSuchElementException(elementName + " đang trống");

            return value;
        });
    }

    private String getOptionalColumnText(WebDriverWait wait, int rowIndex, int columnIndex, String elementName) {
        try {
            return retryGet("Lấy " + elementName, () -> {
                List<WebElement> columns = getColumns(wait, rowIndex);
                if (columns.size() <= columnIndex) throw new NoSuchElementException("Không tồn tại cột " + columnIndex);
                return columns.get(columnIndex).getText().trim();
            });
        } catch (Exception e) {
            log.warn("Không lấy được {} sau {} lần: {}", elementName, MAX_RETRY, getRootCauseMessage(e));
            return "";
        }
    }

    private String getOptionalText(WebDriverWait wait, By locator, String elementName) {
        try {
            return retryGet("Lấy " + elementName, () -> wait.until(ExpectedConditions.presenceOfElementLocated(locator)).getText().trim());
        } catch (Exception e) {
            log.warn("Không lấy được {} sau {} lần: {}", elementName, MAX_RETRY, getRootCauseMessage(e));
            return "";
        }
    }

    private void validateColumns(List<WebElement> columns, int pageNumber, int rowIndex) {
        if (columns.size() < 7) throw new NoSuchElementException("Dòng " + rowIndex + " trang " + pageNumber + " chỉ có " + columns.size() + "/7 cột dữ liệu");
    }

    private <T> T retryGet(String actionName, Supplier<T> action) {
        Exception lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRY; attempt++) {
            try {
                T result = action.get();
                if (attempt > 1) log.info("{} thành công ở lần thử {}/{}", actionName, attempt, MAX_RETRY);
                return result;
            } catch (Exception e) {
                lastException = e;
                log.warn("{} thất bại ở lần thử {}/{}: {}", actionName, attempt, MAX_RETRY, getRootCauseMessage(e));

                if (attempt < MAX_RETRY) {
                    log.info("Nghỉ {} giây trước khi thử lại", RETRY_DELAY / 1_000);
                    sleep(RETRY_DELAY);
                }
            }
        }

        throw new IllegalStateException(actionName + " thất bại sau " + MAX_RETRY + " lần thử", lastException);
    }

    private void retryAction(String actionName, Runnable action) {
        retryGet(actionName, () -> {
            action.run();
            return true;
        });
    }

    private int saveOrUpdate(List<Course> crawledCourses) {
        if (crawledCourses.isEmpty()) {
            log.info("Không có dữ liệu học phần để lưu");
            return 0;
        }

        List<Course> uniqueCourses = removeDuplicateCourses(crawledCourses);

        Map<String, Course> existingCourseMap = courseRepository.findAll().stream()
                .filter(course -> hasText(course.getCode()))
                .collect(Collectors.toMap(Course::getCode, Function.identity(), (first, second) -> first, LinkedHashMap::new));

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
                .collect(Collectors.toMap(Course::getCode, Function.identity(), (first, second) -> second, LinkedHashMap::new));

        int duplicateCount = courses.size() - uniqueCourses.size();
        if (duplicateCount > 0) log.warn("Đã loại bỏ {} học phần bị trùng mã", duplicateCount);

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
        existing.setIsSync(false);
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
        while (rootCause.getCause() != null) rootCause = rootCause.getCause();

        String message = rootCause.getMessage();
        return message == null || message.isBlank() ? rootCause.getClass().getSimpleName() : message;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private void closeDriver(WebDriver driver, String crawlerJobLogId) {
        if (driver == null) return;

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