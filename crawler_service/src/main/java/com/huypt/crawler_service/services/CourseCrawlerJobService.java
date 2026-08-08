package com.huypt.crawler_service.services;

import com.huypt.crawler_service.dtos.enums.CrawlerJobTrigger;
import com.huypt.crawler_service.jobs.CourseCrawlerJob;
import com.huypt.crawler_service.models.CrawlerJobLog;
import lombok.RequiredArgsConstructor;
import org.jobrunr.jobs.JobId;
import org.jobrunr.scheduling.JobScheduler;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseCrawlerJobService {

    private static final String JOB_NAME = "COURSE_CRAWLER";

    private final JobScheduler jobScheduler;
    private final CourseCrawlerJob courseCrawlerJob;
    private final CrawlerJobLogService jobLogService;

    public CrawlerJobLog trigger(CrawlerJobTrigger trigger) {
        /*
         * Không kiểm tra job đang RUNNING hoặc QUEUED.
         *
         * Nếu chỉ có một worker, JobRunr sẽ tự xếp các job vào queue
         * và chạy lần lượt, không chạy song song.
         */
        CrawlerJobLog jobLog =
                jobLogService.create(JOB_NAME, trigger);

        JobId jobRunrId = jobScheduler.enqueue(
                () -> courseCrawlerJob.execute(jobLog.getId())
        );

        jobLogService.attachJobRunrId(
                jobLog.getId(),
                jobRunrId.toString()
        );

        jobLog.setJobRunrId(jobRunrId.toString());

        return jobLog;
    }
}