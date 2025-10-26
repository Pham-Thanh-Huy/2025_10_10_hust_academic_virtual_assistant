package com.huypt.crawler_service;

import com.huypt.crawler_service.dtos.BaseResponse;
import com.huypt.crawler_service.services.HustCourse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LineRunner implements CommandLineRunner {
    private final HustCourse hustCourse;

    @Override
    public void run(String... args) throws Exception {
        BaseResponse<String> a = hustCourse.crawlData();
    }
}
