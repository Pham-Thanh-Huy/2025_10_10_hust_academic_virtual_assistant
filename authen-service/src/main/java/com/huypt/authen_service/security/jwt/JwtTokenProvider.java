package com.huypt.authen_service.security.jwt;

import com.huypt.authen_service.config.ApplicationProperties;
import com.huypt.authen_service.utils.Constant;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    private final ApplicationProperties config;

    public Map<String, Map<String, Boolean>> valiateToken(String token){
        try{

            Jwts.parser().verifyWith(Keys.hmacShaKeyFor(config.getTokenAuthen().getSecretKey().getBytes(StandardCharsets.UTF_8)))
                    .build().parseClaimsJws(token);
            return Map.of(Constant.VALIDATE_TOKEN, Map.of("Success!", Boolean.TRUE));
        }catch (MalformedJwtException ex){
            return Map.of(Constant.VALIDATE_TOKEN, Map.of("Invalid token!", Boolean.FALSE));
        }catch (ExpiredJwtException ex){
            return Map.of(Constant.VALIDATE_TOKEN, Map.of("Token expired!", Boolean.FALSE));
        }catch (Exception ex){
            log.warn("[PARSE-JWT-TOKEN] {}",ex.getMessage());
            return Map.of(Constant.VALIDATE_TOKEN, Map.of("Invalid token!", Boolean.FALSE));
        }
    }


    public String parseTokenToUsername(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(config.getTokenAuthen().getSecretKey().getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Object user = claims.get("username");
            return user != null ? String.valueOf(user): null;

        } catch (Exception e) {
            log.error("[ERROR-TO-PARSE-TOKEN-JWT] {}", e.getMessage());
            return null;
        }
    }


}
