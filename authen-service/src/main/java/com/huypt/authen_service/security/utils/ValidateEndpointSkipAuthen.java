package com.huypt.authen_service.security.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huypt.authen_service.client.UserServiceFeignClient;
import com.huypt.authen_service.dtos.response.Resource;
import com.huypt.authen_service.security.config.IgnoreUrlsConfig;
import com.huypt.authen_service.utils.Constant;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Component
public class ValidateEndpointSkipAuthen {
    private final IgnoreUrlsConfig ignoreUrlsConfig;
    private final UserServiceFeignClient userServiceFeignClient;
    private final ObjectMapper mapper;

    /*
        ----> IF enpoint has request method OPTIONS or IgnoreUrls or PermitAll Endpoint -> Return null (Skip authen)
     */
    public Map<String, String> validatePermitAllEnpointds(HttpServletRequest request) {
        AntPathMatcher antPathMatcher = new AntPathMatcher();
        String urlAuthen = request.getHeader(Constant.X_AUTHEN_URL);
        String methodAuthen = request.getHeader(Constant.X_AUTHEN_METHOD);

        for (String ignoreUrl : ignoreUrlsConfig.getUrls()) {
            if (antPathMatcher.match(ignoreUrl, urlAuthen)) {
                return Map.of(ValidateEndpoints.HAS_PERMIT_ALL_ENPOINT.getMessage(), "Skip authen!");
            }
        }

        if (ObjectUtils.isEmpty(urlAuthen)) {
            return Map.of(ValidateEndpoints.REQUEST_NOT_ENOUGH.getMessage(),
                    "Authentication failed. Please send the request header and include the URL in it (X-Authen-Url)!");
        }

        if (ObjectUtils.isEmpty(methodAuthen)) {
            return Map.of(ValidateEndpoints.REQUEST_NOT_ENOUGH.getMessage(),
                    "Authentication failed. Please send the request header and include the method in it (X-Authen-Method)!");
        }

        if (request.getMethod().equals(HttpMethod.OPTIONS.toString())) {
            return Map.of(ValidateEndpoints.HAS_PERMIT_ALL_ENPOINT.getMessage(), "Skip authen!");
        }



        JsonNode jsonNode = userServiceFeignClient.findListResourceByPermitAllRole().get("data").get("authens");
        List<Resource> permitAllEndpoints = mapper.convertValue(jsonNode, new TypeReference<>() {});
        for(Resource permitAllEndpoint: permitAllEndpoints){
            if (antPathMatcher.match(permitAllEndpoint.getUri(), urlAuthen) && permitAllEndpoint.getMethod().equals(methodAuthen)) {
                return Map.of(ValidateEndpoints.HAS_PERMIT_ALL_ENPOINT.getMessage(), "Skip authen!");
            }
        }

        return Map.of(ValidateEndpoints.REQUEST_MUST_BE_AUTHEN.getMessage(), "Request auth!");
    }
}
