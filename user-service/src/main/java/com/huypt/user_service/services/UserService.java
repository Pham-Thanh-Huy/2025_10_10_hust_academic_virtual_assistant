package com.huypt.user_service.services;

import com.huypt.user_service.dtos.CommonResponse;
import com.huypt.user_service.dtos.response.UserResponse;
import com.huypt.user_service.models.Role;
import com.huypt.user_service.models.User;
import com.huypt.user_service.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;

    public CommonResponse<UserResponse> getUser(Long userId){
        try{
            User user = userRepository.findById(userId).orElse(null);
            if(ObjectUtils.isEmpty(user)){
                return CommonResponse.notFound(null, String.format("User not exist by id: %d", userId));
            }

            UserResponse response = UserResponse.builder()
                    .username(user.getUsername())
                    .firstName(user.getProfile().getFirstName())
                    .lastName(user.getProfile().getLastName())
                    .age(user.getProfile().getAge())
                    .birthOfDate(user.getProfile().getBirthOfDate())
                    .roleName(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                    .build();
            return CommonResponse.success(response, null);
        }catch (Exception e){
            log.error("[ERROR-TO-GET-USER] {}", e.getMessage());
            return CommonResponse.internalServerError(null, null);
        }
    }



    // -------------------------- INTERNAL API ---------------------------------
    public CommonResponse<UserResponse> getUserByUsername(String username){
        try{
            User user = userRepository.findByUsername(username).orElse(null);
            if(ObjectUtils.isEmpty(user)){
                return CommonResponse.notFound(null, String.format("User not exist by username: %s", username));
            }

            UserResponse response = UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .firstName(user.getProfile().getFirstName())
                    .lastName(user.getProfile().getLastName())
                    .age(user.getProfile().getAge())
                    .birthOfDate(user.getProfile().getBirthOfDate())
                    .roleName(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                    .password(user.getPassword())
                    .build();
            return CommonResponse.success(response, null);
        } catch (Exception e) {
            log.error("[ERROR-TO-GET-USER-BY-USERNAME] {}", e.getMessage());
            return CommonResponse.internalServerError(null, null);
        }
    }
}
