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
import org.springframework.util.CollectionUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HustCourse {

    private static final String BASE_URL =
            "http://sis.hust.edu.vn/ModuleProgram/CourseLists.aspx";

    private final CourseRepository courseRepository;
    private final CrawlerJobLogService jobLogService;

    /**
     * Thực hiện crawl toàn bộ danh sách học phần.
     *
     * @param crawlerJobLogId ID document CrawlerJobLog trong MongoDB
     * @return số lượng học phần đã crawl và số lượng được thêm/cập nhật
     */
    public CrawlResult crawlData(String crawlerJobLogId) {
        List<Course> courses = new ArrayList<>();
        WebDriver driver = null;

        try {
            jobLogService.addLog(
                    crawlerJobLogId,
                    "Đang khởi tạo Selenium WebDriver"
            );

            driver = SeleniumConfig.initWebDriver(false);
            driver.get(BASE_URL);

            jobLogService.addLog(
                    crawlerJobLogId,
                    "Đã truy cập trang danh sách học phần HUST"
            );

            WebDriverWait wait =
                    new WebDriverWait(driver, Duration.ofSeconds(30));

            int pageIndex = 0;

            while (true) {
                int pageNumber = pageIndex + 1;

                log.info("Đang crawl trang {}", pageNumber);

                jobLogService.addLog(
                        crawlerJobLogId,
                        "Bắt đầu xử lý trang " + pageNumber
                );

                /*
                 * Trang đầu tiên đã được hiển thị ngay sau khi mở URL,
                 * vì vậy không cần bấm nút Next.
                 */
                if (pageIndex == 0) {
                    List<Course> extractedCourses =
                            extractTableData(wait);

                    addCourses(courses, extractedCourses);
                } else {
                    boolean hasNextPage = paging(driver, pageIndex);

                    if (!hasNextPage) {
                        jobLogService.addLog(
                                crawlerJobLogId,
                                "Đã đến trang cuối cùng"
                        );
                        break;
                    }

                    List<Course> extractedCourses =
                            extractTableData(wait);

                    addCourses(courses, extractedCourses);
                }

                jobLogService.updateProgress(
                        crawlerJobLogId,
                        pageNumber,
                        courses.size()
                );

                pageIndex++;
            }

            jobLogService.addLog(
                    crawlerJobLogId,
                    "Hoàn thành crawl, bắt đầu lưu dữ liệu"
            );

            int savedRecords = saveOrUpdate(courses);

            log.info(
                    "Crawl hoàn thành, tổng số={}, thêm/cập nhật={}",
                    courses.size(),
                    savedRecords
            );

            return new CrawlResult(
                    courses.size(),
                    savedRecords
            );
        } catch (Exception e) {
            log.error("Course crawler failed", e);

            /*
             * Nếu crawler lỗi giữa chừng thì vẫn lưu những học phần
             * đã lấy được trước thời điểm xảy ra lỗi.
             */
            if (!courses.isEmpty()) {
                try {
                    int savedRecords = saveOrUpdate(courses);

                    jobLogService.addLog(
                            crawlerJobLogId,
                            "Crawler bị lỗi nhưng đã lưu "
                                    + savedRecords
                                    + " bản ghi thu thập được trước đó"
                    );
                } catch (Exception saveException) {
                    log.error(
                            "Không thể lưu dữ liệu crawl tạm thời",
                            saveException
                    );
                }
            }

            /*
             * Bắt buộc throw exception để JobRunr nhận biết job thất bại
             * và thực hiện retry.
             */
            throw new IllegalStateException(
                    "Không thể crawl dữ liệu học phần HUST",
                    e
            );
        } finally {
            closeDriver(driver, crawlerJobLogId);
        }
    }

    /**
     * Lấy dữ liệu học phần trong trang hiện tại.
     */
    private List<Course> extractTableData(WebDriverWait wait) {
        List<Course> courses = new ArrayList<>();

        try {
            wait.until(
                    ExpectedConditions.invisibilityOfElementLocated(
                            By.id("MainContent_gvCoursesGrid_LD")
                    )
            );

            List<WebElement> rows =
                    wait.until(
                            ExpectedConditions
                                    .presenceOfAllElementsLocatedBy(
                                            By.xpath(
                                                    "//table[@id='MainContent_gvCoursesGrid_DXMainTable']"
                                                            + "/tbody/tr[@class='dxgvDataRow_SisTheme']"
                                            )
                                    )
                    );

            int rowSize = rows.size();

            log.info(
                    "Trang hiện tại có {} học phần",
                    rowSize
            );

            for (int rowIndex = 1;
                 rowIndex <= rowSize;
                 rowIndex++) {

                /*
                 * Lấy lại danh sách column ở mỗi vòng vì DOM của trang
                 * thay đổi sau khi mở chi tiết học phần.
                 */
                List<WebElement> columns =
                        getColumns(wait, rowIndex);

                if (columns.size() < 7) {
                    throw new IllegalStateException(
                            "Dòng " + rowIndex
                                    + " không có đủ 7 cột dữ liệu"
                    );
                }

                /*
                 * 0: Nút mở chi tiết
                 * 1: Mã học phần
                 * 2: Tên học phần
                 * 3: Thời lượng
                 * 4: Số tín chỉ
                 * 5: Tín chỉ học phí
                 * 6: Trọng số
                 */
                wait.until(
                        ExpectedConditions.invisibilityOfElementLocated(
                                By.id("MainContent_gvCoursesGrid_LD")
                        )
                );

                sleep(500);

                columns.get(0).click();

                wait.until(
                        ExpectedConditions.invisibilityOfElementLocated(
                                By.id("MainContent_gvCoursesGrid_LD")
                        )
                );

                sleep(500);

                /*
                 * Sau khi click mở chi tiết, DOM đã thay đổi nên phải
                 * lấy lại danh sách column.
                 */
                columns = getColumns(wait, rowIndex);

                String englishCourseName =
                        getTextOrEmpty(
                                wait,
                                "//tr[@class='dxgvDetailRow_SisTheme']"
                                        + "//td[contains(., 'Tên tiếng anh')]/b[2]"
                        );

                String instituteManage =
                        getTextOrEmpty(
                                wait,
                                "//tr[@class='dxgvDetailRow_SisTheme']"
                                        + "//td[contains(., 'Viện quản lý')]/b[4]"
                        );

                String courseCondition =
                        getTextOrEmpty(
                                wait,
                                "//tr[@class='dxgvDetailRow_SisTheme']"
                                        + "//td[contains(., 'Học phần điều kiện')]/b[1]"
                        );

                String courseCode =
                        columns.get(1).getText().trim();

                String courseName =
                        columns.get(2).getText().trim();

                String courseDuration =
                        columns.get(3).getText().trim();

                String courseCredit =
                        columns.get(4).getText().trim();

                String creditFee =
                        columns.get(5).getText().trim();

                String courseWeight =
                        columns.get(6).getText().trim();

                Course course = Course.builder()
                        .name(courseName)
                        .englishName(englishCourseName)
                        .code(courseCode)
                        .duration(courseDuration)
                        .credits(courseCredit)
                        .creditFee(creditFee)
                        .weight(courseWeight)
                        .listCourseCondition(courseCondition)
                        .instituteManage(instituteManage)
                        .build();

                courses.add(course);

                log.info(
                        "Đã crawl học phần {} - {}",
                        courseCode,
                        courseName
                );
            }

            return courses;
        } catch (Exception e) {
            log.error(
                    "[ERROR-EXTRACT-TABLE-DATA]",
                    e
            );

            throw new IllegalStateException(
                    "Không thể lấy dữ liệu bảng học phần",
                    e
            );
        }
    }

    /**
     * Chuyển sang trang tiếp theo.
     *
     * @return true nếu chuyển trang thành công, false nếu đã tới trang cuối
     */
    private boolean paging(
            WebDriver driver,
            int pageIndex
    ) {
        try {
            /*
             * Khi nút Next bị disabled nghĩa là đang ở trang cuối.
             */
            List<WebElement> disabledNextButtons =
                    driver.findElements(
                            By.xpath(
                                    "//*[@id='MainContent_gvCoursesGrid_DXPagerBottom']"
                                            + "/b[contains(@class,'dxp-disabledButton')]"
                                            + "/img[@alt='Next']"
                            )
                    );

            if (!disabledNextButtons.isEmpty()) {
                log.info("Đã đến trang cuối");
                return false;
            }

            List<WebElement> nextButtons =
                    driver.findElements(
                            By.xpath(
                                    "//*[@id='MainContent_gvCoursesGrid_DXPagerBottom']"
                                            + "/*[contains(@class,'dxp-button')]"
                                            + "/img[@alt='Next']"
                            )
                    );

            if (nextButtons.isEmpty()) {
                log.info(
                        "Không tìm thấy nút Next tại pageIndex={}",
                        pageIndex
                );
                return false;
            }

            nextButtons.get(0).click();

            /*
             * Chờ loading của trang xuất hiện rồi biến mất.
             */
            WebDriverWait wait =
                    new WebDriverWait(
                            driver,
                            Duration.ofSeconds(30)
                    );

            wait.until(
                    ExpectedConditions.invisibilityOfElementLocated(
                            By.id("MainContent_gvCoursesGrid_LD")
                    )
            );

            sleep(500);

            return true;
        } catch (Exception e) {
            log.error(
                    "Không thể chuyển sang trang tiếp theo",
                    e
            );

            throw new IllegalStateException(
                    "Không thể chuyển sang trang tiếp theo",
                    e
            );
        }
    }

    /**
     * Thêm dữ liệu crawl được vào danh sách tổng.
     */
    private void addCourses(
            List<Course> courses,
            List<Course> extractedCourses
    ) {
        if (!CollectionUtils.isEmpty(extractedCourses)) {
            courses.addAll(extractedCourses);
        }
    }

    /**
     * Thêm mới hoặc cập nhật học phần dựa theo course code.
     *
     * @return số lượng bản ghi thực sự được thêm hoặc cập nhật
     */
    private int saveOrUpdate(List<Course> courses) {
        if (CollectionUtils.isEmpty(courses)) {
            log.info("Không có dữ liệu học phần để lưu");
            return 0;
        }

        try {
            /*
             * Chuyển dữ liệu hiện tại trong MongoDB thành Map:
             *
             * key   = courseCode
             * value = Course
             *
             * Nhờ vậy không cần query MongoDB từng học phần.
             */
            Map<String, Course> existingCourseMap =
                    courseRepository.findAll()
                            .stream()
                            .collect(
                                    Collectors.toMap(
                                            Course::getCode,
                                            Function.identity(),
                                            (first, second) -> first
                                    )
                            );

            List<Course> changedCourses =
                    courses.stream()
                            .map(crawledCourse -> {
                                Course existingCourse =
                                        existingCourseMap.get(
                                                crawledCourse.getCode()
                                        );

                                /*
                                 * Chưa tồn tại course code:
                                 * trả về course mới để insert.
                                 */
                                if (existingCourse == null) {
                                    log.info(
                                            "Thêm mới học phần: {} - {}",
                                            crawledCourse.getCode(),
                                            crawledCourse.getName()
                                    );

                                    return crawledCourse;
                                }

                                /*
                                 * Cùng course code và mọi dữ liệu giống nhau:
                                 * trả về null để không update.
                                 */
                                if (!hasChanges(
                                        existingCourse,
                                        crawledCourse
                                )) {
                                    return null;
                                }

                                log.info(
                                        "Cập nhật học phần: {} - {}",
                                        crawledCourse.getCode(),
                                        crawledCourse.getName()
                                );

                                /*
                                 * Có ít nhất một trường thay đổi:
                                 * cập nhật object đang tồn tại để giữ nguyên ID.
                                 */
                                updateCourse(
                                        existingCourse,
                                        crawledCourse
                                );

                                return existingCourse;
                            })
                            .filter(Objects::nonNull)
                            .toList();

            if (changedCourses.isEmpty()) {
                log.info("Dữ liệu học phần không có thay đổi");
                return 0;
            }

            courseRepository.saveAll(changedCourses);

            log.info(
                    "Đã thêm mới/cập nhật {} học phần",
                    changedCourses.size()
            );

            return changedCourses.size();
        } catch (Exception e) {
            log.error("[ERROR-SAVE-TO-DB]", e);

            throw new IllegalStateException(
                    "Không thể lưu dữ liệu học phần vào MongoDB",
                    e
            );
        }
    }

    private boolean hasChanges(
            Course existingCourse,
            Course crawledCourse
    ) {
        return !Objects.equals(
                existingCourse.getName(),
                crawledCourse.getName()
        ) || !Objects.equals(
                existingCourse.getEnglishName(),
                crawledCourse.getEnglishName()
        ) || !Objects.equals(
                existingCourse.getDuration(),
                crawledCourse.getDuration()
        ) || !Objects.equals(
                existingCourse.getCredits(),
                crawledCourse.getCredits()
        ) || !Objects.equals(
                existingCourse.getCreditFee(),
                crawledCourse.getCreditFee()
        ) || !Objects.equals(
                existingCourse.getWeight(),
                crawledCourse.getWeight()
        ) || !Objects.equals(
                existingCourse.getListCourseCondition(),
                crawledCourse.getListCourseCondition()
        ) || !Objects.equals(
                existingCourse.getInstituteManage(),
                crawledCourse.getInstituteManage()
        );
    }

    private void updateCourse(
            Course existingCourse,
            Course crawledCourse
    ) {
        existingCourse.setName(
                crawledCourse.getName()
        );

        existingCourse.setEnglishName(
                crawledCourse.getEnglishName()
        );

        existingCourse.setDuration(
                crawledCourse.getDuration()
        );

        existingCourse.setCredits(
                crawledCourse.getCredits()
        );

        existingCourse.setCreditFee(
                crawledCourse.getCreditFee()
        );

        existingCourse.setWeight(
                crawledCourse.getWeight()
        );

        existingCourse.setListCourseCondition(
                crawledCourse.getListCourseCondition()
        );

        existingCourse.setInstituteManage(
                crawledCourse.getInstituteManage()
        );
    }

    /**
     * Lấy lại danh sách cột của một dòng.
     */
    private List<WebElement> getColumns(
            WebDriverWait wait,
            int rowIndex
    ) {
        return wait.until(
                ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.xpath(
                                String.format(
                                        "//table[@id='MainContent_gvCoursesGrid_DXMainTable']"
                                                + "/tbody/tr[@class='dxgvDataRow_SisTheme'][%d]/td",
                                        rowIndex
                                )
                        )
                )
        );
    }

    /**
     * Lấy text của element.
     *
     * Nếu trường dữ liệu chi tiết không tồn tại thì trả chuỗi rỗng,
     * không làm hỏng toàn bộ job crawler.
     */
    private String getTextOrEmpty(
            WebDriverWait wait,
            String xpath
    ) {
        try {
            WebElement element =
                    wait.until(
                            ExpectedConditions.presenceOfElementLocated(
                                    By.xpath(xpath)
                            )
                    );

            return element.getText().trim();
        } catch (Exception e) {
            log.warn(
                    "Không lấy được dữ liệu từ xpath: {}",
                    xpath
            );

            return "";
        }
    }

    /**
     * Đóng Selenium WebDriver an toàn.
     */
    private void closeDriver(
            WebDriver driver,
            String crawlerJobLogId
    ) {
        if (driver == null) {
            return;
        }

        try {
            driver.quit();

            jobLogService.addLog(
                    crawlerJobLogId,
                    "Đã đóng Selenium WebDriver"
            );
        } catch (Exception e) {
            log.warn(
                    "Không thể đóng Selenium WebDriver",
                    e
            );
        }
    }

    /**
     * Sleep và giữ lại trạng thái interrupt của thread.
     */
    private void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Crawler thread đã bị interrupt",
                    e
            );
        }
    }
}