package com.huypt.user_service.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MethodResourceResponse {
    private List<Authen> authens;

    @Data
    @AllArgsConstructor
    public static class Authen {
        public String uri;
        public String method;
    }
}