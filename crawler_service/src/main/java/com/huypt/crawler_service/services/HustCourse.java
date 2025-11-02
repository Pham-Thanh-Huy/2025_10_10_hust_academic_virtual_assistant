package com.huypt.crawler_service.services;

import com.google.common.collect.Table;
import com.huypt.crawler_service.dtos.BaseResponse;
import com.huypt.crawler_service.dtos.StatusEnum;
import com.huypt.crawler_service.utils.SeleniumConfig;
import lombok.extern.slf4j.Slf4j;
import net.bytebuddy.implementation.bytecode.Throw;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

/**
 * 26/10/2025
 * Crawl list course in http://sis.hust.edu.vn/
 */
@Slf4j
@Service
public class HustCourse {

    private final String BASE_URL = "http://sis.hust.edu.vn/ModuleProgram/CourseLists.aspx";

    public BaseResponse<String> crawlData() {
        WebDriver driver = SeleniumConfig.initWebDriver(true);
        driver.get(BASE_URL);
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));
            int index = 0;
            while (true) {
                // Nếu = 0 thì là trang đầu tiên nên lấy luôn table
                if (index == 0) {
                    extractTableData(wait);
                }

                // bắt đầu từ trang 2 tới các trang tiếp theo
                if (index != 0) {
                    if (paging(driver, index)) {
                        extractTableData(wait);
                    } else break;
                }

                index++;
            }

            return BaseResponse.success("Lấy và cập nhật dữ liệu thành công");
        } catch (Exception e) {
            log.info(e.getMessage());
            driver.quit();
            return BaseResponse.internalServerError();
        }
    }


    public void extractTableData(WebDriverWait wait) {
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

                System.out.println(String.format(
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
                                """
                        , courseName, englishCourseName, courseCode, courseDuration, courseCredit, creditFee, courseWeight, instituteManage, courseCondition));

            }
        } catch (Exception e) {
            log.error("[ERROR-EXTRACT-TABLE-DATA]: {}", e.getMessage());
        }
    }

    public Boolean paging(WebDriver driver, int index) {
        if (index != 2) {
            if (driver.findElements(By.xpath("//b[@class='dxp-button dxp-disabledButton']")).isEmpty()) {
                return false;
            }
        }

        List<WebElement> elements = (driver.findElements(By.xpath(
                "//*[@id='MainContent_gvCoursesGrid_DXPagerBottom']/b[@class='dxp-button']/img[@alt='Next']"
        )));
        elements.get(0).click();
        return true;
    }


}
