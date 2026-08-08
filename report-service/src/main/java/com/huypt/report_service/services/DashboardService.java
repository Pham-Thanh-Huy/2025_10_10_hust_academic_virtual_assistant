package com.huypt.report_service.services;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.dtos.responses.ChartResponse;
import com.huypt.report_service.dtos.responses.RecentQuestionResponse;
import com.huypt.report_service.dtos.responses.SummaryResponse;
import com.huypt.report_service.entities.mongo.ChatMessage;
import com.huypt.report_service.entities.mongo.ChatSession;
import com.huypt.report_service.entities.mysql.Profile;
import com.huypt.report_service.entities.mysql.User;
import com.huypt.report_service.repositories.mongo.ChatMessageRepository;
import com.huypt.report_service.repositories.mongo.ChatSessionRepository;
import com.huypt.report_service.repositories.mysql.CourseRepository;
import com.huypt.report_service.repositories.mysql.ProfileRepository;
import com.huypt.report_service.repositories.mysql.UserRepository;
import com.huypt.report_service.utils.TimeRange;
import com.huypt.report_service.utils.TimeUtils;
import com.netflix.spectator.api.Statistic;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;
    private static final ZoneId VIETNAM_ZONE =
            ZoneId.of("Asia/Ho_Chi_Minh");



    public BaseResponse<SummaryResponse> statisticSummary(){
        try{
            Long totalUser = userRepository.countByRole("USER");
            Long totalCourse = courseRepository.count();
            Long totalQuestion = chatMessageRepository.count();

            TimeRange today = TimeUtils.today();
            TimeRange thisWeek = TimeUtils.thisWeek();
            TimeRange thisMonth = TimeUtils.thisMonth();

            Long totalQuestionToday = chatMessageRepository.countByChatAtBetween(today.getStart(), today.getEnd());
            Long totalQuestionThisWeek = chatMessageRepository.countByChatAtBetween(thisWeek.getStart(), thisWeek.getEnd());
            Long totalQuestionThisMonth = chatMessageRepository.countByChatAtBetween(thisMonth.getStart(), thisMonth.getEnd());


            SummaryResponse summaryResponse = SummaryResponse.builder()
                    .totalUser(totalUser)
                    .totalCourse(totalCourse)
                    .totalQuestion(totalQuestion)
                    .totalQuestionToday(totalQuestionToday)
                    .totalQuestionThisWeek(totalQuestionThisWeek)
                    .totalQuestionThisMonth(totalQuestionThisMonth)
                    .build();
            return BaseResponse.makeSuccessResponse(summaryResponse);
        } catch (Exception e) {
            log.error("[ERROR-WHEN-STATISTIC-SUMMARY] {}", e.getMessage());
            return BaseResponse.makeInternalServerError(e.getMessage());
        }
    }


    public BaseResponse<List<ChartResponse>> statisticChart(String type){
        try{
            List<ChartResponse> responses;

            switch (type){
                case "7-days":
                    responses = statisticCharSevenDays();
                    break;
                case "12-months":
                    responses = statisticCharTwelveMonths();
                    break;
                case "24-hours":
                    responses = statisticChart24Hours();
                    break;
                default:
                    return BaseResponse.makeBadRequestResponse("Type phải là '7-days' hoặc '12-months' hoặc '24-hours'");
            }

            return BaseResponse.makeSuccessResponse(responses);
        } catch (Exception e) {
            log.error("[ERROR-WHEN-STATISTIC-CHART] {}", e.getMessage());
            return BaseResponse.makeInternalServerError(e.getMessage());
        }
    }


    private List<ChartResponse> statisticCharSevenDays() throws Exception{
        TimeRange weeks = TimeUtils.thisWeek();
        List<ChatMessage> messages = chatMessageRepository.findByChatAtBetween(weeks.getStart(), weeks.getEnd());

        Map<DayOfWeek, Long> totals = messages.stream()
                .collect(Collectors
                        .groupingBy(m -> m.getChatAt().toLocalDate().getDayOfWeek(),
                                Collectors.counting()));

        return List.of(
                new ChartResponse("Thứ 2", totals.getOrDefault(DayOfWeek.MONDAY, 0L)),
                new ChartResponse("Thứ 3", totals.getOrDefault(DayOfWeek.TUESDAY, 0L)),
                new ChartResponse("Thứ 4", totals.getOrDefault(DayOfWeek.WEDNESDAY, 0L)),
                new ChartResponse("Thứ 5", totals.getOrDefault(DayOfWeek.THURSDAY, 0L)),
                new ChartResponse("Thứ 6", totals.getOrDefault(DayOfWeek.FRIDAY, 0L)),
                new ChartResponse("Thứ 7", totals.getOrDefault(DayOfWeek.SATURDAY, 0L)),
                new ChartResponse("Chủ nhật", totals.getOrDefault(DayOfWeek.SUNDAY, 0L))
        );
    }

    private List<ChartResponse> statisticCharTwelveMonths() throws Exception{
        TimeRange years = TimeUtils.thisYear();
        List<ChatMessage> messages = chatMessageRepository.findByChatAtBetween(years.getStart(), years.getEnd());

        Map<Integer, Long> totals = messages.stream()
                .collect(Collectors.groupingBy(m -> m.getChatAt().toLocalDate().getMonthValue(),
                        Collectors.counting()));

        return IntStream.rangeClosed(1, 12)
                .mapToObj(index -> new ChartResponse(String.format("Tháng %s", index),
                        totals.getOrDefault(index, 0L))).collect(Collectors.toList());
    }

    private List<ChartResponse> statisticChart24Hours() {
        TimeRange days = TimeUtils.today();

        List<ChatMessage> messages =
                chatMessageRepository.findByChatAtBetween(
                        days.getStart(),
                        days.getEnd()
                );

        Map<Integer, Long> totals = messages.stream()
                .collect(Collectors.groupingBy(
                        message -> message.getChatAt()
                                .atZone(ZoneId.systemDefault())
                                .withZoneSameInstant(VIETNAM_ZONE)
                                .getHour(),
                        Collectors.counting()
                ));

        return IntStream.range(0, 24)
                .mapToObj(hour -> new ChartResponse(
                        String.format("%02d:00", hour),
                        totals.getOrDefault(hour, 0L)
                ))
                .toList();
    }


    public BaseResponse<List<RecentQuestionResponse>> someRecentQuestion() {
        try {
            List<ChatMessage> messages = chatMessageRepository.findTop4ByOrderByChatAtDesc();

            Set<String> sessionIds = messages.stream()
                    .map(ChatMessage::getSessionId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, ChatSession> sessionMap = chatSessionRepository.findAllById(sessionIds).stream()
                    .collect(Collectors.toMap(ChatSession::getId, Function.identity()));

            Set<String> usernames = sessionMap.values().stream()
                    .map(ChatSession::getUsername)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, User> userMap = userRepository.findByUsernameIn(usernames).stream()
                    .collect(Collectors.toMap(User::getUsername, Function.identity()));

            List<RecentQuestionResponse> responses = messages.stream().map(message -> {
                ChatSession session = sessionMap.get(message.getSessionId());
                User user = session == null ? null : userMap.get(session.getUsername());
                Profile profile = user == null ? null : user.getProfile();

                return RecentQuestionResponse.builder()
                        .messageId(message.getId())
                        .sessionId(message.getSessionId())
                        .sessionTitle(session != null ? session.getTitle() : null)
                        .message(message.getMessage())
                        .answer(message.getAnswer())
                        .model(message.getModel())
                        .chatAt(message.getChatAt())
                        .username(session != null ? session.getUsername() : null)
                        .firstName(profile != null ? profile.getFirstName() : null)
                        .lastName(profile != null ? profile.getLastName() : null)
                        .build();
            }).toList();

            return BaseResponse.makeSuccessResponse(responses, "Lấy danh sách câu hỏi gần nhất thành công");
        } catch (Exception e) {
            log.error("[ERROR-WHEN-LIST-RECENT-MESSAGE]", e);
            return BaseResponse.makeInternalServerError(e.getMessage());
        }
    }


}
