package com.huypt.crawler_service.repositories;

import com.huypt.crawler_service.dtos.enums.CrawlerJobStatus;
import com.huypt.crawler_service.models.CrawlerJobLog;
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