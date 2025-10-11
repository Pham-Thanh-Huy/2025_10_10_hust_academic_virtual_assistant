package com.huypt.user_service.dtos.request;

import com.huypt.user_service.exception.custom.NotNullOrEmptyString;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginRequest {
    @NotNullOrEmptyString(message = "username required and cannot null!")
    private String username;
    @NotNullOrEmptyString(message = "password required and cannot null!")
    private String password;
}
