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
        WebDriver driver = SeleniumConfig.initWebDriver();
        driver.get(BASE_URL);
        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));
            extractTableData(wait);

            return BaseResponse.success("Lấy và cập nhật dữ liệu thành công");
        } catch (Exception e) {
            log.info(e.getMessage());
            driver.quit();
            return BaseResponse.internalServerError();
        }
    }


    public void extractTableData(WebDriverWait wait) {
        try {
            WebElement table = wait.until(ExpectedConditions.presenceOfElementLocated(
                    By.xpath("//table[@id='MainContent_gvCoursesGrid_DXMainTable']/tbody")
            ));

            List<WebElement> rows = table.findElements(
                    By.xpath("./tr[@class='dxgvDataRow_SisTheme']")
            );

            for (WebElement row : rows) {
                List<WebElement> columns = row.findElements(By.xpath("./td"));

                /*
                 * 1 ---> button click detail course and get course name by english (Tên tiếng anh của học phần)
                 * 2 ---> Mã học phần
                 * 3 ---> Tên học phần
                 * 4 ---> Thời lượng
                 * 5 ---> Số tín chỉ
                 * 6 ---> TC học phí
                 * 7 ---> Trọng số
                 */
                Integer columnIndex = 1;
                for (WebElement column : columns) {
                    switch (columnIndex) {
                        case 1:
                            column.click();
                            // Get (Tên tiếng anh của học phần)
                            WebElement englishCourseName = wait.until(ExpectedConditions.presenceOfElementLocated(
                                    By.xpath("//tr[@class='dxgvDetailRow_SisTheme']//td[contains(., 'Tên tiếng anh')]/b[2]")
                            ));
                            System.out.println("Tên học phần bằng tiếng anh" + englishCourseName.getText());
                            columnIndex++;
                            break;
                        case 2:
                            column.getText();
                            columnIndex++;
                            break;
                        case 3:
                            column.getText();
                            columnIndex++;
                            break;
                        case 4:
                            column.getText();
                            columnIndex++;
                            break;
                        case 5:
                            column.getText();
                            columnIndex++;
                            break;
                        case 6:
                            column.getText();
                            columnIndex++;
                            break;
                        case 7:
                            column.getText();
                            columnIndex++;
                            break;
                    }

                }

            }

        } catch (Exception e) {
            log.error("[ERROR-EXTRACT-TABLE-DATA]: {}", e.getMessage());
        }
    }


}
