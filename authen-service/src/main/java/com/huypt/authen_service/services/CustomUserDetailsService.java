package com.huypt.authen_service.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huypt.authen_service.client.UserServiceFeignClient;
import com.huypt.authen_service.domain.CustomUserDetail;
import com.huypt.authen_service.dtos.response.Resource;
import com.huypt.authen_service.dtos.response.UserAuthen;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserServiceFeignClient userFeignClient;
    private final ObjectMapper mapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try{
            JsonNode userNode = userFeignClient.getUserByUsername(username).get("data");
            UserAuthen user = mapper.convertValue(userNode, UserAuthen.class);
            if (ObjectUtils.isEmpty(user)){
                return null;
            }

            JsonNode resourceNode = userFeignClient.getListResourceByUserId(user.getId()).get("data");
            List<Resource> resources = mapper.convertValue(resourceNode, new TypeReference<List<Resource>>() {});
            if (ObjectUtils.isEmpty(resources)){
                return null;
            }
            return new CustomUserDetail(user, resources);
        }catch (Exception e){
            log.error("[ERROR-TO-LOAD-USER-DETAIL-BY-USERNAME] {}", e.getMessage());
            return null;
        }
    }
}
