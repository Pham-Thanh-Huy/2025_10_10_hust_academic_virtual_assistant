package com.huypt.report_service.controller;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.entities.mysql.User;
import com.huypt.report_service.services.UserService;
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

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/report-list")
    public ResponseEntity<BaseResponse<Page<User>>> listChatResponse(@RequestParam(required = false) String username,
                                                                     @RequestParam(required = false) String fullName,
                                                                     @RequestParam(required = false) Integer age,
                                                                     @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate start,
                                                                     @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate end,
                                                                     Pageable pageable) {
        BaseResponse<Page<User>> response = userService.listUser(username, fullName, age, start, end, pageable);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }
}
