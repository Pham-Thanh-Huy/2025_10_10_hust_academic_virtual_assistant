package com.huypt.report_service.repositories.mongo;

import com.huypt.report_service.dtos.enums.CrawlerJobStatus;
import com.huypt.report_service.entities.mongo.CrawlerJobLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;

public interface CrawlerJobLogRepository
        extends MongoRepository<CrawlerJobLog, String> {

    List<CrawlerJobLog> findAllByOrderByQueuedAtDesc();

    boolean existsByJobNameAndStatusIn(
            String jobName,
            Collection<CrawlerJobStatus> statuses
    );
}