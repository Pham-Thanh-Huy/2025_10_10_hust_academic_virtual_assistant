package com.huypt.cloud_gateway.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application")
@AllArgsConstructor
@Data
public class ApplicationProperties {
    private Service service;

    @Data
    @AllArgsConstructor
    public static class Service {
        private AuthenService authenService;

        @Data
        @AllArgsConstructor
        public static class AuthenService {
            private String url;
            private String name;
        }
    }
}
