package com.huypt.report_service.services;

import com.huypt.report_service.dtos.BaseResponse;
import com.huypt.report_service.entities.mysql.User;
import com.huypt.report_service.repositories.mysql.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public BaseResponse<Page<User>> listUser(String username, String fullName, Integer age, LocalDate start, LocalDate end, Pageable pageable) {
        try {
            Page<User> users = userRepository.filter(username, fullName, age, start, end, pageable);
            return BaseResponse.makeSuccessResponse(users);
        } catch (Exception e) {
            return BaseResponse.makeInternalServerError(e.getMessage());
        }
    }
}
