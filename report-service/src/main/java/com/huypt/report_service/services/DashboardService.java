package com.huypt.report_service.services;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.dtos.responses.SummaryResponse;
import com.huypt.report_service.repositories.mongo.ChatMessageRepository;
import com.huypt.report_service.repositories.mongo.ChatSessionRepository;
import com.huypt.report_service.repositories.mysql.CourseRepository;
import com.huypt.report_service.repositories.mysql.ProfileRepository;
import com.huypt.report_service.repositories.mysql.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;


    public BaseResponse<SummaryResponse> statisticSummary(){
        try{
            Long totalUser = userRepository.countByRole("USER");
            Long totalCourse = userRepository.count();
//            Long total
            
        } catch (Exception e) {
            log.error("[ERROR-WHEN-STATISTIC-SUMMARY] {}", e.getMessage());
            return BaseResponse.makeInternalServerError(e.getMessage());
        }
    }
}
