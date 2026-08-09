package com.huypt.crawler_service.services;

import com.huypt.crawler_service.dtos.enums.CrawlerJobStatus;
import com.huypt.crawler_service.dtos.enums.CrawlerJobTrigger;
import com.huypt.crawler_service.models.CrawlerJobLog;
import com.huypt.crawler_service.repositories.CrawlerJobLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.huypt.crawler_service.exceptions.JobCancelledException;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CrawlerJobLogService {

    private final CrawlerJobLogRepository repository;

    public CrawlerJobLog create(
            String jobName,
            CrawlerJobTrigger trigger
    ) {
        CrawlerJobLog jobLog = CrawlerJobLog.builder()
                .jobName(jobName)
                .trigger(trigger)
                .status(CrawlerJobStatus.QUEUED)
                .queuedAt(Instant.now())
                .totalRecords(0)
                .savedRecords(0)
                .currentPage(0)
                .logs(new ArrayList<>())
                .build();

        jobLog.getLogs().add(
                "Job đã được đưa vào hàng đợi"
        );

        return repository.save(jobLog);
    }

    public void attachJobRunrId(
            String id,
            String jobRunrId
    ) {
        CrawlerJobLog jobLog = getById(id);
        jobLog.setJobRunrId(jobRunrId);
        repository.save(jobLog);
    }

    public void markRunning(String id) {
        CrawlerJobLog jobLog = getById(id);

        if (jobLog.getStatus() == CrawlerJobStatus.CANCELLED) {
            throw new JobCancelledException(
                    "Job đã bị hủy trước khi bắt đầu"
            );
        }

        jobLog.setStatus(CrawlerJobStatus.RUNNING);
        jobLog.setStartedAt(Instant.now());
        jobLog.getLogs().add("Bắt đầu chạy crawler");

        repository.save(jobLog);
    }

    public void updateProgress(
            String id,
            int currentPage,
            int totalRecords
    ) {
        CrawlerJobLog jobLog = getById(id);
        ensureNotCancelled(jobLog);

        jobLog.setCurrentPage(currentPage);
        jobLog.setTotalRecords(totalRecords);
        jobLog.getLogs().add(
                "Đã xử lý trang " + currentPage
                        + ", tổng số học phần: "
                        + totalRecords
        );

        repository.save(jobLog);
    }

    public void addLog(String id, String message) {
        CrawlerJobLog jobLog = getById(id);
        ensureNotCancelled(jobLog);

        jobLog.getLogs().add(message);
        repository.save(jobLog);
    }

    public void markSuccess(
            String id,
            int total,
            int saved
    ) {
        CrawlerJobLog jobLog = getById(id);

        /*
         * Không cho job đã bị hủy chuyển ngược thành SUCCESS.
         */
        if (jobLog.getStatus() == CrawlerJobStatus.CANCELLED) {
            return;
        }

        Instant finishedAt = Instant.now();

        jobLog.setStatus(CrawlerJobStatus.SUCCESS);
        jobLog.setFinishedAt(finishedAt);
        jobLog.setTotalRecords(total);
        jobLog.setSavedRecords(saved);
        jobLog.setDurationMs(
                calculateDuration(
                        jobLog.getStartedAt(),
                        finishedAt
                )
        );
        jobLog.getLogs().add(
                "Crawler hoàn thành. Thu thập: "
                        + total
                        + ", cập nhật: "
                        + saved
        );

        repository.save(jobLog);
    }

    public void markFailed(
            String id,
            Throwable throwable
    ) {
        CrawlerJobLog jobLog = repository.findById(id)
                .orElse(null);

        /*
         * Log có thể đã bị endpoint DELETE xóa.
         * Khi đó thread cũ không được tạo lại hoặc báo lỗi tiếp.
         */
        if (jobLog == null
                || jobLog.getStatus()
                == CrawlerJobStatus.CANCELLED) {
            return;
        }

        Instant finishedAt = Instant.now();

        jobLog.setStatus(CrawlerJobStatus.FAILED);
        jobLog.setFinishedAt(finishedAt);
        jobLog.setDurationMs(
                calculateDuration(
                        jobLog.getStartedAt(),
                        finishedAt
                )
        );
        jobLog.setErrorMessage(
                throwable.getMessage()
        );
        jobLog.getLogs().add(
                "Job thất bại: "
                        + throwable.getMessage()
        );

        repository.save(jobLog);
    }

    public CrawlerJobLog markCancelled(
            String id,
            String reason
    ) {
        CrawlerJobLog jobLog = getById(id);
        Instant finishedAt = Instant.now();

        jobLog.setStatus(CrawlerJobStatus.CANCELLED);
        jobLog.setFinishedAt(finishedAt);
        jobLog.setDurationMs(
                calculateDuration(
                        jobLog.getStartedAt(),
                        finishedAt
                )
        );
        jobLog.setErrorMessage(null);
        jobLog.getLogs().add(reason);

        return repository.save(jobLog);
    }

    public boolean isCancelled(String id) {
        return repository.findById(id)
                .map(job ->
                        job.getStatus()
                                == CrawlerJobStatus.CANCELLED
                )
                /*
                 * Không còn log nghĩa là endpoint DELETE
                 * đã xóa job, crawler cũng phải dừng.
                 */
                .orElse(true);
    }

    public void throwIfCancelled(String id) {
        if (Thread.currentThread().isInterrupted()) {
            throw new JobCancelledException(
                    "Thread crawler đã nhận tín hiệu dừng"
            );
        }

        if (isCancelled(id)) {
            throw new JobCancelledException(
                    "Crawler job đã bị hủy"
            );
        }
    }

    private void ensureNotCancelled(
            CrawlerJobLog jobLog
    ) {
        if (jobLog.getStatus()
                == CrawlerJobStatus.CANCELLED) {
            throw new JobCancelledException(
                    "Crawler job đã bị hủy"
            );
        }
    }

    private long calculateDuration(
            Instant start,
            Instant finish
    ) {
        if (start == null) {
            return 0;
        }

        return Duration.between(
                start,
                finish
        ).toMillis();
    }

    private CrawlerJobLog getById(String id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy crawler job: "
                                        + id
                        )
                );
    }
}