package com.huypt.crawler_service.services;

import com.google.common.collect.Table;
import com.huypt.crawler_service.dtos.BaseResponse;
import com.huypt.crawler_service.dtos.StatusEnum;
import com.huypt.crawler_service.models.Course;
import com.huypt.crawler_service.repositories.CourseRepository;
import com.huypt.crawler_service.utils.SeleniumConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.bytebuddy.implementation.bytecode.Throw;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 26/10/2025
 * Crawl list course in http://sis.hust.edu.vn/
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HustCourse {

    private final String BASE_URL = "http://sis.hust.edu.vn/ModuleProgram/CourseLists.aspx";
    private final CourseRepository courseRepository;

    public BaseResponse<String> crawlData() {
        List<Course> courses = new ArrayList<>();
        WebDriver driver = SeleniumConfig.initWebDriver(false);
        driver.get(BASE_URL);
        try {

            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));
            int index = 0;
            while (true) {
                System.out.printf("-------------------------Trang (%s)%n", index + 1);
                // Nếu = 0 thì là trang đầu tiên nên lấy luôn table
                if (index == 0) {
                    List<Course> data = extractTableData(wait);
                    if (!ObjectUtils.isEmpty(data)) {
                        courses.addAll(data);
                    }
                }

                // bắt đầu từ trang 2 tới các trang tiếp theo
                if (index != 0) {
                    if (paging(driver, index)) {
                        List<Course> data = extractTableData(wait);
                        if (!ObjectUtils.isEmpty(data)) {
                            courses.addAll(data);
                        }
                    } else break;
                }

                index++;
            }

            if (!ObjectUtils.isEmpty(courses)) {
                saveOrUpdate(courses);
            }

            log.info("Crawl completed!");
            driver.quit();
            return BaseResponse.success("Lấy và cập nhật dữ liệu thành công");
        } catch (Exception e) {
            // if catch -> still check and save all course has crawled
            saveOrUpdate(courses);

            log.info(e.getMessage());
            driver.quit();
            return BaseResponse.internalServerError();
        }
    }


    public List<Course> extractTableData(WebDriverWait wait) {
        List<Course> courses = new ArrayList<>();
        try {
            int rowSize = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(
                    By.xpath("//table[@id='MainContent_gvCoursesGrid_DXMainTable']/tbody/tr[@class='dxgvDataRow_SisTheme']")
            )).size();

            for (int i = 1; i <= rowSize; i++) {
                Thread.sleep(1000);
                List<WebElement> columns = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.xpath(String.format("//table[@id='MainContent_gvCoursesGrid_DXMainTable']/tbody/tr[@class='dxgvDataRow_SisTheme'][%d]/td", i))
                ));

                /*
                 * 0 ---> button click detail course and get course name by english (Tên tiếng anh của học phần)
                 * 1 ---> Mã học phần
                 * 2 ---> Tên học phần
                 * 3 ---> Thời lượng
                 * 4 ---> Số tín chỉ
                 * 5 ---> TC học phí
                 * 6 ---> Trọng số
                 */

                // Đợi loading div biến mất
                wait.until(ExpectedConditions.invisibilityOfElementLocated(
                        By.id("MainContent_gvCoursesGrid_LD")
                ));
                Thread.sleep(800);
                columns.get(0).click();
                Thread.sleep(800);
                // phải get lại columns vì các phần tử column bị thay đổi sau khi click
                columns = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(
                        By.xpath(String.format("//table[@id='MainContent_gvCoursesGrid_DXMainTable']/tbody/tr[@class='dxgvDataRow_SisTheme'][%d]/td", i))
                ));

                String englishCourseName = wait.until(ExpectedConditions.presenceOfElementLocated(
                        By.xpath("//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Tên tiếng anh')]/b[2]")
                )).getText();

                // Viện quản lý
                String instituteManage = wait.until(ExpectedConditions.presenceOfElementLocated(
                        By.xpath("//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Viện quản lý')]/b[4]")
                )).getText();

                //Học phần điều kiện
                String courseCondition = wait.until(ExpectedConditions.presenceOfElementLocated(
                        By.xpath("//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Học phần điều kiện')]/b[1]")
                )).getText();

                String courseCode = columns.get(1).getText();      // * 1 ---> Mã học phần
                String courseName = columns.get(2).getText();       // * 2 ---> Tên học phần
                String courseDuration = columns.get(3).getText();   // * 3 ---> Thời lượng
                String courseCredit = columns.get(4).getText();     // * 4 ---> Số tín chỉ
                String creditFee = columns.get(5).getText();       // * 5 ---> TC học phí
                String courseWeight = columns.get(6).getText();       // * 6 ---> Trọng số

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

                System.out.printf(
                        """
                                 ----------------------------------------------------
                                 Tên học phần: %s
                                 Tên tiếng anh của học phần: %s
                                 Mã học phần: %s
                                 Thời lượng: %s
                                 Số tín chỉ: %s
                                 Tín chỉ học phí: %s
                                 Trọng số: %s
                                 Viện quản lý: %s
                                 Học phần điều kiện: %s
                                 ----------------------------------------------------
                                %n"""
                        , courseName, englishCourseName, courseCode, courseDuration, courseCredit, creditFee, courseWeight, instituteManage, courseCondition);

            }
            return courses;
        } catch (Exception e) {
            log.error("[ERROR-EXTRACT-TABLE-DATA]: {}", e.getMessage());
            return null;
        }
    }

    public Boolean paging(WebDriver driver, int index) {
        if (index > 1) {
            if (!driver.findElements(By.xpath("//b[@class='dxp-button dxp-disabledButton']")).isEmpty()) {
                System.out.println("Trang cuối");
                return false;
            }
        }

        List<WebElement> elements = (driver.findElements(By.xpath(
                "//*[@id='MainContent_gvCoursesGrid_DXPagerBottom']/b[@class='dxp-button']/img[@alt='Next']"
        )));
        elements.get(0).click();
        return true;
    }


    // ---> Check exist and add or update to db
    public void saveOrUpdate(List<Course> courses) {
        try {
            List<Course> courseExist = courseRepository.findAll();

             /*
                - check exist by contains has use method equals and hash code (custom method equals cannot check id)
                - After checking (filter), if course does not exist but course code in this course still exist,
                  the course has edited any field (name, code or etc...)
                - ---> Update this course all field
             */
            List<Course> newCourse = courses.stream().
                    filter(course -> !courseExist.contains(course))
                    .map(
                            course -> {
                                Course c = courseRepository.existsByCode(course.getCode());
                                if (!ObjectUtils.isEmpty(c)) {
                                    c.setName(course.getName());
                                    c.setEnglishName(course.getEnglishName());
                                    c.setDuration(course.getDuration());
                                    c.setCredits(course.getCredits());
                                    c.setCreditFee(course.getCreditFee());
                                    c.setWeight(course.getWeight());
                                    c.setListCourseCondition(course.getListCourseCondition());
                                    c.setInstituteManage(course.getInstituteManage());
                                    return c;
                                }
                                return course;
                            }
                    )
                    .toList();

            courseRepository.saveAll(newCourse);
        } catch (Exception e) {
            log.info("[ERROR-SAVE-TO-DB]: {}]", e.getMessage());
        }
    }

}
