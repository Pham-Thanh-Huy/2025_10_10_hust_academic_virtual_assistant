package com.huypt.user_service.jwt;

import com.huypt.user_service.config.ApplicationProperties;
import com.huypt.user_service.models.User;
import com.huypt.user_service.repositories.UserRepository;
import com.huypt.user_service.utils.Constant;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    private final ApplicationProperties config;
    private final UserRepository userRepository;


    public String generateToken(String username){
        User user = userRepository.getByUsername(username);

        return Jwts.builder()
                .issuedAt(new Date(System.currentTimeMillis()))
                .claim("username", user.getUsername())
                .expiration(new Date(System.currentTimeMillis() + config.getTokenAuthen().getExpiration()))
                .signWith(Keys.hmacShaKeyFor(config.getTokenAuthen().getSecretKey().getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    public Map<String, Map<String, Boolean>> valiateToken(String token){
        try{
            Jwts.parser().verifyWith(Keys.hmacShaKeyFor(config.getTokenAuthen().getSecretKey().getBytes(StandardCharsets.UTF_8)))
                    .build().parseClaimsJws(token);
            return Map.of(Constant.VALIDATE_TOKEN, Map.of("Success!", Boolean.TRUE));
        }catch (MalformedJwtException ex){
            return Map.of(Constant.VALIDATE_TOKEN, Map.of("Invalid token!", Boolean.FALSE));
        }catch (ExpiredJwtException ex){
            return Map.of(Constant.VALIDATE_TOKEN, Map.of("Token expired!", Boolean.FALSE));
        }
    }


}
