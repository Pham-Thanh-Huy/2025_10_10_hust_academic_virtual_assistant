package com.huypt.authen_service.security;

import com.huypt.authen_service.config.ApplicationProperties;
import com.huypt.authen_service.dtos.status.ResponseStatus;
import com.huypt.authen_service.security.jwt.JwtTokenProvider;
import com.huypt.authen_service.security.utils.HttpServletResponseCustom;
import com.huypt.authen_service.security.utils.ValidateEndpointSkipAuthen;
import com.huypt.authen_service.security.utils.ValidateEndpoints;
import com.huypt.authen_service.services.CustomUserDetailsService;
import com.huypt.authen_service.utils.Constant;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.ObjectUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;


@RequiredArgsConstructor
public class TokenSecurityConfig extends OncePerRequestFilter{
    private final HttpServletResponseCustom servletResponseCustom;
    private final ApplicationProperties config;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final ValidateEndpointSkipAuthen validateEndpointSkipAuthen;

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NotNull HttpServletResponse response, @NotNull FilterChain filterChain)
            throws ServletException, IOException {
        // -----> CHECK IF PERMIT ALL ENDPOINT OR IGNORE ENDPOINT OR METHOD OPTIONS ----> SKIP AUTHEN
        Map<String, String> endpointSkipAuthen = validateEndpointSkipAuthen.validatePermitAllEnpointds(request);
        for(Map.Entry<String, String> entry : endpointSkipAuthen.entrySet()){
            String key = entry.getKey();
            if(key.equals(ValidateEndpoints.REQUEST_NOT_ENOUGH.getMessage())){
                servletResponseCustom.custom(response, entry.getValue(), ResponseStatus.UNAUTHORIZED.getStatus());
                return;
            }

            if(key.equals(ValidateEndpoints.HAS_PERMIT_ALL_ENPOINT.getMessage())){
                filterChain.doFilter(request, response);
                return;
            }

        }

        String authToken = request.getHeader("Authorization");
        if (ObjectUtils.isEmpty(authToken) || !authToken.startsWith(config.getTokenAuthen().getBearer())) {
            servletResponseCustom.custom(response, "Token authentication required!", ResponseStatus.UNAUTHORIZED.getStatus());
            return;
        }
        String token = authToken.substring(config.getTokenAuthen().getBearer().length()).strip();

        Map<String, Map<String, Boolean>> validateToken = tokenProvider.valiateToken(token);
        Map<String, Boolean> validateMap = validateToken.get(Constant.VALIDATE_TOKEN);
        String message = validateMap.keySet().iterator().next(); // ----> GET MESSAGE FIRST BECASUSE MAP IN VALIDATE RETURN ONE VALUE!
        if (validateMap.get(message) == Boolean.FALSE) {
            servletResponseCustom.custom(response, message, ResponseStatus.UNAUTHORIZED.getStatus());
            return;
        }
        String username = tokenProvider.parseTokenToUsername(token);
        if (ObjectUtils.isEmpty(username)) {
            servletResponseCustom.custom(response, "Token incorrect!", ResponseStatus.UNAUTHORIZED.getStatus());
            return;
        }

        // LOAD USER BY USERNAME
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
        if (ObjectUtils.isEmpty(userDetails)) {
            servletResponseCustom.custom(response, "Token incorrect!", ResponseStatus.UNAUTHORIZED.getStatus());
            return;
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }


}
