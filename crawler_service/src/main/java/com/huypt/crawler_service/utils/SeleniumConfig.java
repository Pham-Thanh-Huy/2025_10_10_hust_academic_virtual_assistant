package com.huypt.crawler_service.utils;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.File;
import java.util.Objects;

@Slf4j
@RequiredArgsConstructor
public class SeleniumConfig {


    public static WebDriver initWebDriver() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        return new ChromeDriver(options);
    }


    // if device has proxy and cannot automation chrome driver
    public static WebDriver initWebDriver(Boolean proxies) {
        if (proxies == false) {
            return initWebDriver();
        }
        try {
            System.setProperty("webdriver.chrome.driver", "/home/huypt84/Downloads/chromedriver-linux64/chromedriver");
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--start-maximized");

            // GET FILE PROXY
            options.addExtensions(
                    FileUtil.getResourceFile("proxy.zip")
            );
            return new ChromeDriver(options);
        } catch (Exception e) {
            log.error("[ERROR-INIT-WEBDRIVER-HAS-PROXY] {}", e.getMessage());
            return null;
        }

    }

}
