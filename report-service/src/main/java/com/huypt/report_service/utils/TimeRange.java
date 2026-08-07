package com.huypt.report_service.utils;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TimeRange {
    private LocalDateTime start;
    private LocalDateTime end;
}