package com.huypt.user_service.controllers.external;

import com.huypt.user_service.controllers.BaseController;
import com.huypt.user_service.dtos.CommonResponse;
import com.huypt.user_service.dtos.response.UserResponse;
import com.huypt.user_service.services.UserService;
import com.huypt.user_service.utils.Constant;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(Constant.API_UTIL.API_V1)
public class UserController extends BaseController {
    private final UserService userService;

    @Operation(summary = "API lấy người dùng theo ID")
    @ApiResponse(description = "Trả ra người dùng")
    @GetMapping("/get-user/{userId}")
    public ResponseEntity<CommonResponse<UserResponse>> getUser(@PathVariable Long userId){
        CommonResponse<UserResponse> response = userService.getUser(userId);
        return baseControllerResponse(response);
    }
}
