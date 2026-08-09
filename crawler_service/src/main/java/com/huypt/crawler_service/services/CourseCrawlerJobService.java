package com.huypt.crawler_service.services;

import com.huypt.crawler_service.dtos.enums.CrawlerJobStatus;
import com.huypt.crawler_service.dtos.enums.CrawlerJobTrigger;
import com.huypt.crawler_service.jobs.CourseCrawlerJob;
import com.huypt.crawler_service.models.CrawlerJobLog;
import com.huypt.crawler_service.repositories.CrawlerJobLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jobrunr.jobs.JobId;
import org.jobrunr.scheduling.JobScheduler;
import org.jobrunr.storage.JobNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseCrawlerJobService {

    private static final String JOB_NAME = "COURSE_CRAWLER";

    private final JobScheduler jobScheduler;
    private final CourseCrawlerJob courseCrawlerJob;
    private final CrawlerJobLogService jobLogService;
    private final CrawlerJobLogRepository repository;

    public CrawlerJobLog trigger(CrawlerJobTrigger trigger) {
        CrawlerJobLog jobLog = jobLogService.create(JOB_NAME, trigger);

        JobId jobRunrId = jobScheduler.enqueue(
                () -> courseCrawlerJob.execute(jobLog.getId())
        );

        jobLogService.attachJobRunrId(jobLog.getId(), jobRunrId.toString());
        jobLog.setJobRunrId(jobRunrId.toString());

        return jobLog;
    }

    public CrawlerJobLog stop(String id) {
        CrawlerJobLog jobLog = getById(id);

        if (!isActive(jobLog)) {
            throw new IllegalStateException(
                    "Chỉ có thể dừng job đang chờ hoặc đang chạy"
            );
        }

        /*
         * Đánh dấu CANCELLED trước để crawler không thể
         * cập nhật ngược lại thành SUCCESS hoặc FAILED.
         */
        CrawlerJobLog cancelledJob = jobLogService.markCancelled(
                id,
                "Job đã được người dùng dừng"
        );

        deleteJobRunrJob(jobLog);

        return cancelledJob;
    }

    public void delete(String id) {
        CrawlerJobLog jobLog = getById(id);

        /*
         * Chỉ yêu cầu JobRunr dừng nếu job còn QUEUED hoặc RUNNING.
         */
        if (isActive(jobLog)) {
            jobLogService.markCancelled(
                    id,
                    "Job đã bị dừng để xóa hoàn toàn"
            );

            deleteJobRunrJob(jobLog);
        }

        /*
         * SUCCESS, FAILED và CANCELLED sẽ đi thẳng tới đây,
         * không gọi JobRunr vì job đã kết thúc.
         */
        repository.deleteById(id);
    }

    private boolean isActive(CrawlerJobLog jobLog) {
        return jobLog.getStatus() == CrawlerJobStatus.QUEUED
                || jobLog.getStatus() == CrawlerJobStatus.RUNNING;
    }

    private void deleteJobRunrJob(CrawlerJobLog jobLog) {
        if (jobLog.getJobRunrId() == null || jobLog.getJobRunrId().isBlank()) {
            return;
        }

        try {
            UUID jobId = UUID.fromString(jobLog.getJobRunrId());
            jobScheduler.delete(new JobId(jobId));
        } catch (JobNotFoundException exception) {
            /*
             * Có thể JobRunr vừa kết thúc hoặc đã dọn job
             * trước khi request dừng được xử lý.
             */
            log.warn(
                    "JobRunr {} không còn tồn tại, bỏ qua thao tác dừng",
                    jobLog.getJobRunrId()
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "JobRunr ID không hợp lệ: " + jobLog.getJobRunrId(),
                    exception
            );
        }
    }

    private CrawlerJobLog getById(String id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy crawler job: " + id
                        )
                );
    }
}