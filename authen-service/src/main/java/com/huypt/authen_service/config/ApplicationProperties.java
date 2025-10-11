package com.huypt.authen_service.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(
        prefix = "application",
        ignoreInvalidFields = true
)
@Data
@AllArgsConstructor
public class ApplicationProperties {
    private TokenAuthen tokenAuthen;
    private Service service;

    @Data
    @AllArgsConstructor
    public static class TokenAuthen{
        private String secretKey;
        private String bearer;
        private Long expiration;
    }

    @Data
    @AllArgsConstructor
    public static class Service {
        private UserService userService;

        @Data
        @AllArgsConstructor
        public static class UserService{
            private String url;
            private String name;
        }
    }
}
