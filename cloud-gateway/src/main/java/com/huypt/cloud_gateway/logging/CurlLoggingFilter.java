package com.huypt.cloud_gateway.logging;

import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import reactor.core.publisher.Mono;

public class CurlLoggingFilter {

    /*
       --> Log curl Request to Authen-Service to debug if have error
     */
    public static ExchangeFilterFunction curlAuthenLogging() {
        return ExchangeFilterFunction.ofRequestProcessor(request -> {
            StringBuilder curl = new StringBuilder("curl -X ");
            curl.append(request.method());
            curl.append(" '").append(request.url()).append("'");

            request.headers().forEach((name, values) -> values.forEach(value -> {
                curl.append(" -H '").append(name).append(": ").append(value).append("'");
            }));

            // Nếu có body, thì log luôn body ở đây (tuỳ thêm nâng cấp)
            System.out.println("[CURL] " + curl.toString());

            return Mono.just(request);
        });
    }
}
