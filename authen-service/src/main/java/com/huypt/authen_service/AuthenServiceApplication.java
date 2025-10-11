package com.huypt.authen_service;

import com.huypt.authen_service.config.ApplicationProperties;
import com.huypt.authen_service.security.config.IgnoreUrlsConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@SpringBootApplication
@EnableConfigurationProperties({ApplicationProperties.class, IgnoreUrlsConfig.class})
@EnableFeignClients(basePackages = "com.huypt.authen_service.client")
public class AuthenServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthenServiceApplication.class, args);
	}

}
