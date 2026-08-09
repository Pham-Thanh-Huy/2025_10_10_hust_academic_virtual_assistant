package com.huypt.crawler_service.utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

@Slf4j
@RequiredArgsConstructor
public class SeleniumConfig {

    private static ChromeOptions getChromeOptions() {
        ChromeOptions options = new ChromeOptions();

        options.addArguments(
                "--headless",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-extensions",
                "--disable-background-networking",
                "--disable-default-apps",
                "--disable-sync",
                "--disable-translate",
                "--mute-audio",
                "--no-first-run",
                "--window-size=1280,720"
        );

        return options;
    }

    public static WebDriver initWebDriver() {
        return new ChromeDriver(getChromeOptions());
    }

    public static WebDriver initWebDriver(Boolean proxies) {
        if (!Boolean.TRUE.equals(proxies)) {
            return initWebDriver();
        }

        try {
            return new ChromeDriver(getChromeOptions());
        } catch (Exception e) {
            log.error("[ERROR-INIT-WEBDRIVER-HAS-PROXY]", e);
            return null;
        }
    }
}