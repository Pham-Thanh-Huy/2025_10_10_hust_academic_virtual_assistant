package com.huypt.authen_service.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Academy app (authen-service)",
                version = "1.0",
                description = "Api title "
        )
)
public class SwaggerConfig {

}
