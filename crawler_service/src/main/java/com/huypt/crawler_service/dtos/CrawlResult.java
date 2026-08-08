package com.huypt.crawler_service.dtos;

public record CrawlResult(
        int totalRecords,
        int savedRecords
) {
}
