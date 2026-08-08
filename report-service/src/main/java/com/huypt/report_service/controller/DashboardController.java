package com.huypt.report_service.controller;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.dtos.responses.ChartResponse;
import com.huypt.report_service.dtos.responses.RecentQuestionResponse;
import com.huypt.report_service.dtos.responses.SummaryResponse;
import com.huypt.report_service.entities.mongo.ChatMessage;
import com.huypt.report_service.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/statistic/summary")
    public ResponseEntity<BaseResponse<SummaryResponse>> statisticSummary(){
        BaseResponse<SummaryResponse> response = dashboardService.statisticSummary();
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }

    @GetMapping("/statistic/chart")
    public ResponseEntity<BaseResponse<List<ChartResponse>>> statisticChart(@RequestParam String type){
        BaseResponse<List<ChartResponse>> response = dashboardService.statisticChart(type);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }


    @GetMapping("/recent-questions")
    public ResponseEntity<BaseResponse<List<RecentQuestionResponse>>> someRecentQuestion() {
        BaseResponse<List<RecentQuestionResponse>> response = dashboardService.someRecentQuestion();
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }



}
