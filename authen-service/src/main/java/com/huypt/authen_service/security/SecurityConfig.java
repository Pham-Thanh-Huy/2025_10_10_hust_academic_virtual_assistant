package com.huypt.authen_service.security;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.huypt.authen_service.config.ApplicationProperties;
import com.huypt.authen_service.security.config.IgnoreUrlsConfig;
import com.huypt.authen_service.security.dynamic.DynamicSecurityFilter;
import com.huypt.authen_service.security.jwt.JwtTokenProvider;
import com.huypt.authen_service.security.utils.HttpServletResponseCustom;
import com.huypt.authen_service.security.utils.ValidateEndpointSkipAuthen;
import com.huypt.authen_service.services.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.FilterSecurityInterceptor;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.SecurityContextHolderFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final ValidateEndpointSkipAuthen validateEndpointSkipAuthen;
    private final HttpServletResponseCustom servletResponseCustom;
   /*
    - TokenSecurity Config và DynamicSecurityFilter phải inject kiểu này bởi vì không đặt đưọc @Component
    - Việc đặt component sẽ dẫn đến Spring Đăng kí luôn lớp filter và sẽ bị gọi luôn trước khi filter được gọi qua security
    */

//    --------------- INJECT BEAN TO TOKEN SECURITY CONFIG--------------------
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final ApplicationProperties config;
    public TokenSecurityConfig tokenSecurityConfig() {
        return new TokenSecurityConfig(servletResponseCustom, config, jwtTokenProvider, customUserDetailsService, validateEndpointSkipAuthen);
    }
//     --------------- INJECT BEAN TO DYNAMIC SECURITY FILTER--------------------
    private final HttpServletResponseCustom httpServletResponseCustom;
    public DynamicSecurityFilter dynamicSecurityFilter(){
        return new DynamicSecurityFilter(httpServletResponseCustom, validateEndpointSkipAuthen, httpServletResponseCustom);
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain config(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(
                        (auth) ->
                                auth.anyRequest().permitAll() // -----> AUTO PERMIT ALL BECASUSE NOT CHECK AUTH IN HERE CHECK AUTH BY DYNAMIC SECURITY
                ).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(tokenSecurityConfig(), UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(dynamicSecurityFilter(), TokenSecurityConfig.class);
        return http.build();
    }
}
