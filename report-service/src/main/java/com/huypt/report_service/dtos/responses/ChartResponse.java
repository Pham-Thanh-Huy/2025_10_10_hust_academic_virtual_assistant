package com.huypt.report_service.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChartResponse {
    private String field;
    private Long value;
}
