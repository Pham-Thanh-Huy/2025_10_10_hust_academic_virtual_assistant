package com.huypt.report_service.entities.mongo;

import com.huypt.report_service.dtos.enums.CrawlerJobStatus;
import com.huypt.report_service.dtos.enums.CrawlerJobTrigger;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "CrawlerJobLog")
public class CrawlerJobLog {

    @Id
    private String id;

    @Indexed
    private String jobRunrId;

    @Indexed
    private String jobName;

    @Indexed
    private CrawlerJobStatus status;

    private CrawlerJobTrigger trigger;

    private Instant queuedAt;

    private Instant startedAt;

    private Instant finishedAt;

    private Long durationMs;

    private Integer totalRecords;

    private Integer savedRecords;

    private Integer currentPage;

    private String errorMessage;

    @Builder.Default
    private List<String> logs = new ArrayList<>();
}
