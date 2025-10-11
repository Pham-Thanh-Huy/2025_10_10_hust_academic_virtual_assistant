package com.huypt.user_service.controllers.external;

import com.huypt.user_service.controllers.BaseController;
import com.huypt.user_service.dtos.CommonResponse;
import com.huypt.user_service.dtos.request.CreateOrUpdateUserRequest;
import com.huypt.user_service.dtos.request.LoginRequest;
import com.huypt.user_service.dtos.response.UserResponse;
import com.huypt.user_service.services.AuthenService;
import com.huypt.user_service.utils.Constant;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(Constant.API_UTIL.API_V1)
@RequiredArgsConstructor
public class AuthenController extends BaseController {
    private final AuthenService authenService;

    @Operation(summary = "API Đăng ký tài khoản")
    @PostMapping("/register")
    public ResponseEntity<CommonResponse<UserResponse>> register(@RequestBody @Valid CreateOrUpdateUserRequest
                                                                                   createOrUpdateRequest) {
        CommonResponse<UserResponse> response = authenService.register(createOrUpdateRequest);
        return baseControllerResponse(response);
    }

    @Operation(summary = "API Đăng nhập")
    @PostMapping("/login")
    public ResponseEntity<CommonResponse<Map<String, Object>>> login(@RequestBody @Valid LoginRequest loginRequest){
        CommonResponse<Map<String, Object>> response = authenService.login(loginRequest);
        return baseControllerResponse(response);
    }
}
