package com.huypt.report_service.controller;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.dtos.responses.ChatResponse;
import com.huypt.report_service.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @GetMapping("/report-list")
    public ResponseEntity<BaseResponse<Page<ChatResponse>>> listChatResponse(@RequestParam(required = false) String username,
                                                                             @RequestParam(required = false) String model,
                                                                             @RequestParam(required = false) String status,
                                                                             @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy HH:mm:ss") LocalDateTime start,
                                                                             @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy HH:mm:ss") LocalDateTime end,
                                                                             Pageable pageable) {
        BaseResponse<Page<ChatResponse>> response = chatService.listChat(username, model, status, start, end, pageable);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }

    @GetMapping("/report-detail")
    public ResponseEntity<BaseResponse<ChatResponse>> getDetail(@RequestParam String id){
        BaseResponse<ChatResponse> response = chatService.getDetail(id);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }
}
