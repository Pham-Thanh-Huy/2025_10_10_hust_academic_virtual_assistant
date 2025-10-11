package com.huypt.authen_service.client;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "${application.service.user-service.name}",
        url = "${application.service.user-service.url}")
@Component
public interface UserServiceFeignClient {

    @GetMapping("/internal/get-user-by-username")
    JsonNode getUserByUsername(@RequestParam String username);

    @GetMapping("/internal/get-resource-by-user-id")
    JsonNode getListResourceByUserId(@RequestParam(name = "userId") Long userId);


    @GetMapping("/internal/get-all-resource")
    JsonNode getAllResource();

    @GetMapping("/internal/get-resource/by-permit-all-role")
    JsonNode findListResourceByPermitAllRole();
}
