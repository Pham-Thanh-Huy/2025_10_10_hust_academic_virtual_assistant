package com.huypt.report_service.dtos.responses;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentQuestionResponse {
    private String messageId;
    private String sessionId;
    private String sessionTitle;
    private String message;
    private String answer;
    private String model;
    private String username;
    private String firstName;
    private String lastName;

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime chatAt;
}
