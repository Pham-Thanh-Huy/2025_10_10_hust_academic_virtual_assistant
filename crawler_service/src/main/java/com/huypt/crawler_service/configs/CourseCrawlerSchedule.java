package com.huypt.crawler_service.configs;

import com.huypt.crawler_service.dtos.enums.CrawlerJobTrigger;
import com.huypt.crawler_service.services.CourseCrawlerJobService;
import lombok.RequiredArgsConstructor;
import org.jobrunr.scheduling.JobScheduler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.ZoneId;

@Component
@RequiredArgsConstructor
public class CourseCrawlerSchedule {

    private static final String RECURRING_JOB_ID =
            "daily-course-crawler";

    private final JobScheduler jobScheduler;
    private final CourseCrawlerJobService courseCrawlerJobService;

    @Value("${crawler.course.cron}")
    private String cron;

    @Value("${crawler.course.zone-id}")
    private String zoneId;

    @EventListener(ApplicationReadyEvent.class)
    public void registerRecurringJob() {
        jobScheduler.scheduleRecurrently(
                RECURRING_JOB_ID,
                cron,
                ZoneId.of(zoneId),
                () -> courseCrawlerJobService.trigger(
                        CrawlerJobTrigger.SCHEDULED
                )
        );
    }
}