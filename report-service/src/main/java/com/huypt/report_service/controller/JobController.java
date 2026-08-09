package com.huypt.report_service.controller;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.dtos.enums.CrawlerJobStatus;
import com.huypt.report_service.dtos.enums.CrawlerJobTrigger;
import com.huypt.report_service.dtos.responses.JobSummaryResponse;
import com.huypt.report_service.entities.mongo.CrawlerJobLog;
import com.huypt.report_service.services.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<BaseResponse<Page<CrawlerJobLog>>> getJobs(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer hour,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String jobName,
            @RequestParam(required = false) CrawlerJobStatus status,
            @RequestParam(required = false) CrawlerJobTrigger trigger
    ) {
        BaseResponse<Page<CrawlerJobLog>> response = jobService.getJobs(
                page, size, startDate, endDate, hour, month, year, jobName, status, trigger
        );

        return new ResponseEntity<>(
                response,
                HttpStatusCode.valueOf(response.getMessage().getStatus())
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<BaseResponse<JobSummaryResponse>> getJobSummary() {
        BaseResponse<JobSummaryResponse> response = jobService.getJobSummary();

        return new ResponseEntity<>(
                response,
                HttpStatusCode.valueOf(response.getMessage().getStatus())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<CrawlerJobLog>> getJobDetail(@PathVariable String id) {
        BaseResponse<CrawlerJobLog> response = jobService.getJobDetail(id);

        return new ResponseEntity<>(
                response,
                HttpStatusCode.valueOf(response.getMessage().getStatus())
        );
    }
}