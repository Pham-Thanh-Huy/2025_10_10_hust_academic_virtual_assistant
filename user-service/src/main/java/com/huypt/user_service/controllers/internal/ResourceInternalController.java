package com.huypt.user_service.controllers.internal;

import com.huypt.user_service.controllers.BaseController;
import com.huypt.user_service.dtos.CommonResponse;
import com.huypt.user_service.dtos.response.ResourceResponse;
import com.huypt.user_service.services.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
public class ResourceInternalController extends BaseController {
    private final ResourceService resourceService;

    @Operation(summary = "API lấy danh sách endpoint theo người dùng",
            description = "Lấy danh sách endpoint mà nguời dùng có thể đưọc truy cập")
    @GetMapping("/get-resource-by-user-id")
    public ResponseEntity<CommonResponse<List<ResourceResponse>>> getListResourceByUserId(@RequestParam(value = "userId") Long userId) {
        CommonResponse<List<ResourceResponse>> response = resourceService.getListResourceByUserId(userId);
        return baseControllerResponse(response);
    }

    @Operation(summary = "Lấy toàn bộ endpoint")
    @GetMapping("/get-all-resource")
    public ResponseEntity<CommonResponse<List<ResourceResponse>>> getAllResource() {
        CommonResponse<List<ResourceResponse>> response = resourceService.getAllResource();
        return baseControllerResponse(response);
    }
}
