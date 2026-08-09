package com.huypt.report_service.services;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.dtos.enums.CrawlerJobStatus;
import com.huypt.report_service.dtos.enums.CrawlerJobTrigger;
import com.huypt.report_service.dtos.responses.JobSummaryResponse;
import com.huypt.report_service.entities.mongo.CrawlerJobLog;
import com.huypt.report_service.repositories.mongo.CrawlerJobLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;
    private static final int MAX_SIZE = 100;
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final MongoTemplate mongoTemplate;
    private final CrawlerJobLogRepository crawlerJobLogRepository;

    public BaseResponse<Page<CrawlerJobLog>> getJobs(
            Integer page, Integer size, LocalDate startDate, LocalDate endDate,
            Integer hour, Integer month, Integer year, String jobName,
            CrawlerJobStatus status, CrawlerJobTrigger trigger
    ) {
        try {
            int pageNumber = page == null ? DEFAULT_PAGE : page;
            int pageSize = size == null ? DEFAULT_SIZE : size;

            String validationMessage = validateFilters(
                    pageNumber, pageSize, startDate, endDate, hour, month, year
            );

            if (validationMessage != null) {
                return BaseResponse.makeBadRequestResponse(validationMessage);
            }

            Pageable pageable = PageRequest.of(
                    pageNumber,
                    pageSize,
                    Sort.by(Sort.Direction.DESC, "queuedAt")
            );

            Query query = createQuery(
                    startDate, endDate, hour, month, year, jobName, status, trigger
            );

            long totalElements = mongoTemplate.count(query, CrawlerJobLog.class);
            query.with(pageable);

            List<CrawlerJobLog> jobs = mongoTemplate.find(query, CrawlerJobLog.class);
            Page<CrawlerJobLog> result = new PageImpl<>(jobs, pageable, totalElements);

            return BaseResponse.makeSuccessResponse(
                    result,
                    "Lấy danh sách crawler job thành công"
            );
        } catch (Exception exception) {
            log.error("Không thể lấy danh sách crawler job: {}", exception.getMessage(), exception);

            return BaseResponse.makeInternalServerError(
                    "Không thể lấy danh sách crawler job: " + getErrorMessage(exception)
            );
        }
    }

    public BaseResponse<CrawlerJobLog> getJobDetail(String id) {
        try {
            if (!StringUtils.hasText(id)) {
                return BaseResponse.makeBadRequestResponse("ID crawler job không được để trống");
            }

            return crawlerJobLogRepository.findById(id)
                    .map(job -> BaseResponse.makeSuccessResponse(
                            job,
                            "Lấy chi tiết crawler job thành công"
                    ))
                    .orElseGet(() -> BaseResponse.makeNotFoundResponse(
                            null,
                            "Không tìm thấy crawler job với ID: " + id
                    ));
        } catch (Exception exception) {
            log.error("Không thể lấy chi tiết crawler job {}: {}", id, exception.getMessage(), exception);

            return BaseResponse.makeInternalServerError(
                    "Không thể lấy chi tiết crawler job: " + getErrorMessage(exception)
            );
        }
    }

    public BaseResponse<JobSummaryResponse> getJobSummary() {
        try {
            JobSummaryResponse summary = JobSummaryResponse.builder()
                    .totalJobs(mongoTemplate.count(new Query(), CrawlerJobLog.class))
                    .totalSuccess(countByStatus(CrawlerJobStatus.SUCCESS))
                    .totalRunning(countByStatus(CrawlerJobStatus.RUNNING))
                    .totalFailed(countByStatus(CrawlerJobStatus.FAILED))
                    .totalQueued(countByStatus(CrawlerJobStatus.QUEUED))
                    .totalCancelled(countByStatus(CrawlerJobStatus.CANCELLED))
                    .build();

            return BaseResponse.makeSuccessResponse(
                    summary,
                    "Lấy thống kê crawler job thành công"
            );
        } catch (Exception exception) {
            log.error("Không thể thống kê crawler job: {}", exception.getMessage(), exception);

            return BaseResponse.makeInternalServerError(
                    "Không thể thống kê crawler job: " + getErrorMessage(exception)
            );
        }
    }

    private long countByStatus(CrawlerJobStatus status) {
        Query query = new Query(Criteria.where("status").is(status));
        return mongoTemplate.count(query, CrawlerJobLog.class);
    }

    private Query createQuery(
            LocalDate startDate, LocalDate endDate, Integer hour, Integer month,
            Integer year, String jobName, CrawlerJobStatus status, CrawlerJobTrigger trigger
    ) {
        Query query = new Query();
        List<Criteria> filters = new ArrayList<>();

        if (StringUtils.hasText(jobName)) {
            filters.add(Criteria.where("jobName").regex(Pattern.quote(jobName.trim()), "i"));
        }

        if (status != null) {
            filters.add(Criteria.where("status").is(status));
        }

        if (trigger != null) {
            filters.add(Criteria.where("trigger").is(trigger));
        }

        TimeRange timeRange = createTimeRange(startDate, endDate, hour, month, year);

        if (timeRange != null) {
            filters.add(Criteria.where("queuedAt").gte(timeRange.start()).lt(timeRange.end()));
        }

        if (!filters.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(filters.toArray(new Criteria[0])));
        }

        return query;
    }

    private TimeRange createTimeRange(
            LocalDate startDate, LocalDate endDate, Integer hour, Integer month, Integer year
    ) {
        if (startDate != null && endDate != null) {
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.plusDays(1).atStartOfDay();

            return toInstantRange(start, end);
        }

        if (month != null) {
            int selectedYear = year == null ? LocalDate.now(VIETNAM_ZONE).getYear() : year;
            LocalDateTime start = YearMonth.of(selectedYear, month).atDay(1).atStartOfDay();

            return toInstantRange(start, start.plusMonths(1));
        }

        if (year != null) {
            LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
            return toInstantRange(start, start.plusYears(1));
        }

        if (hour != null) {
            LocalDateTime start = LocalDate.now(VIETNAM_ZONE).atTime(hour, 0);
            return toInstantRange(start, start.plusHours(1));
        }

        return null;
    }

    private TimeRange toInstantRange(LocalDateTime start, LocalDateTime end) {
        return new TimeRange(
                start.atZone(VIETNAM_ZONE).toInstant(),
                end.atZone(VIETNAM_ZONE).toInstant()
        );
    }

    private String validateFilters(
            int page, int size, LocalDate startDate, LocalDate endDate,
            Integer hour, Integer month, Integer year
    ) {
        if (page < 0) {
            return "Trang phải lớn hơn hoặc bằng 0";
        }

        if (size < 1 || size > MAX_SIZE) {
            return "Kích thước trang phải nằm trong khoảng từ 1 đến " + MAX_SIZE;
        }

        if ((startDate == null) != (endDate == null)) {
            return "Phải truyền đồng thời startDate và endDate";
        }

        if (startDate != null && startDate.isAfter(endDate)) {
            return "Ngày bắt đầu không được lớn hơn ngày kết thúc";
        }

        if (hour != null && (hour < 0 || hour > 23)) {
            return "Giờ phải nằm trong khoảng từ 0 đến 23";
        }

        if (month != null && (month < 1 || month > 12)) {
            return "Tháng phải nằm trong khoảng từ 1 đến 12";
        }

        if (year != null && (year < 2000 || year > 2100)) {
            return "Năm phải nằm trong khoảng từ 2000 đến 2100";
        }

        if (startDate != null && (hour != null || month != null || year != null)) {
            return "Không được dùng khoảng ngày cùng với hour, month hoặc year";
        }

        if (hour != null && (month != null || year != null)) {
            return "Không được dùng hour cùng với month hoặc year";
        }

        return null;
    }

    private String getErrorMessage(Throwable throwable) {
        Throwable rootCause = throwable;

        while (rootCause.getCause() != null) {
            rootCause = rootCause.getCause();
        }

        return StringUtils.hasText(rootCause.getMessage())
                ? rootCause.getMessage()
                : rootCause.getClass().getSimpleName();
    }

    private record TimeRange(Instant start, Instant end) {
    }
}