package com.huypt.user_service.controllers.internal;

import com.huypt.user_service.controllers.BaseController;
import com.huypt.user_service.dtos.CommonResponse;
import com.huypt.user_service.dtos.response.UserResponse;
import com.huypt.user_service.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class UserInternalController extends BaseController {
    private final UserService userService;

    @Operation(summary = "Lấy người dùng theo username")
    @GetMapping("/get-user-by-username")
    public ResponseEntity<CommonResponse<UserResponse>> getUserbyUsername(@RequestParam(name = "username", required = false)
                                                                              String username){
        CommonResponse<UserResponse> response = userService.getUserByUsername(username);
        return baseControllerResponse(response);
    }
}
