package com.huypt.crawler_service.controllers;

import com.huypt.crawler_service.dtos.enums.CrawlerJobTrigger;
import com.huypt.crawler_service.models.CrawlerJobLog;
import com.huypt.crawler_service.repositories.CrawlerJobLogRepository;
import com.huypt.crawler_service.services.CourseCrawlerJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/crawler-jobs")
@RequiredArgsConstructor
public class CrawlerJobController {

    private final CourseCrawlerJobService jobService;
    private final CrawlerJobLogRepository repository;

    @PostMapping("/course/trigger")
    public ResponseEntity<CrawlerJobLog> triggerCourseCrawler() {
        CrawlerJobLog jobLog =
                jobService.trigger(CrawlerJobTrigger.MANUAL);

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(jobLog);
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<CrawlerJobLog> stopJob(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(
                jobService.stop(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable String id
    ) {
        jobService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<CrawlerJobLog>> getJobs() {
        return ResponseEntity.ok(
                repository.findAllByOrderByQueuedAtDesc()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrawlerJobLog> getJob(
            @PathVariable String id
    ) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
}