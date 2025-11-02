package com.huypt.crawler_service.utils;

import org.springframework.core.io.ClassPathResource;

import java.io.File;
import java.io.IOException;

/**
 * 01/11/2025
 * File utils will process file
 */
public class FileUtil {

    /*
        // Get file in resource spring app
     */
    public static File getResourceFile(String filename) throws IOException {
        ClassPathResource resource = new ClassPathResource(filename);
        return resource.getFile();
    }
}
