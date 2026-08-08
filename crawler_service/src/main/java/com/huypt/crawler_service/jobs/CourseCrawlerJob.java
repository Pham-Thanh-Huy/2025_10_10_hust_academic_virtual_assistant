package com.huypt.crawler_service.jobs;

import com.huypt.crawler_service.dtos.CrawlResult;
import com.huypt.crawler_service.services.CrawlerJobLogService;
import com.huypt.crawler_service.services.HustCourse;
import lombok.RequiredArgsConstructor;
import org.jobrunr.jobs.annotations.Job;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourseCrawlerJob {

    private final HustCourse hustCourse;
    private final CrawlerJobLogService jobLogService;

    @Job(
            name = "Crawl danh sách học phần HUST",
            retries = 3
    )
    public void execute(String crawlerJobLogId) {
        jobLogService.markRunning(crawlerJobLogId);

        try {
            CrawlResult result =
                    hustCourse.crawlData(crawlerJobLogId);

            jobLogService.markSuccess(
                    crawlerJobLogId,
                    result.totalRecords(),
                    result.savedRecords()
            );
        } catch (Exception e) {
            jobLogService.markFailed(crawlerJobLogId, e);

            // Bắt buộc throw lại để JobRunr đánh dấu FAILED và retry.
            throw e;
        }
    }
}