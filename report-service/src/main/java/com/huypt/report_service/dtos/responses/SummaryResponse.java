package com.huypt.report_service.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SummaryResponse {
    private Long totalUser;
    private Long totalQuestion;
    private Long totalCourse;
    private Long totalQuestionToday;
    private Long totalQuestionThisWeek;
    private Long totalQuestionThisMonth;

}
