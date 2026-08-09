package com.huypt.report_service.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSummaryResponse {

    private long totalJobs;

    private long totalSuccess;

    private long totalRunning;

    private long totalFailed;

    private long totalQueued;

    private long totalCancelled;
}