package com.huypt.user_service.services;

import com.huypt.user_service.dtos.CommonResponse;
import com.huypt.user_service.dtos.request.CreateOrUpdateUserRequest;
import com.huypt.user_service.dtos.request.LoginRequest;
import com.huypt.user_service.dtos.request.RoleResourceRequest;
import com.huypt.user_service.dtos.response.MethodResourceResponse;
import com.huypt.user_service.dtos.response.ResourceResponse;
import com.huypt.user_service.dtos.response.RoleResourceResponse;
import com.huypt.user_service.dtos.response.UserResponse;
import com.huypt.user_service.dtos.status.ResponseStatus;
import com.huypt.user_service.models.Profile;
import com.huypt.user_service.models.Resource;
import com.huypt.user_service.models.Role;
import com.huypt.user_service.models.User;
import com.huypt.user_service.repositories.ResourceRepository;
import com.huypt.user_service.repositories.RoleRepository;
import com.huypt.user_service.repositories.UserRepository;
import com.huypt.user_service.jwt.JwtTokenProvider;
import com.huypt.user_service.utils.Constant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


/*
  ------07/06/2025------
  ------Create Authen Service------
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ResourceRepository resourceRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public CommonResponse<UserResponse> register(CreateOrUpdateUserRequest request) {
        try {
            User userExistByUsername = userRepository.findByUsername(request.getUsername()).orElse(null);
            if (!ObjectUtils.isEmpty(userExistByUsername)) {
                return CommonResponse.badRequest(null, Constant.USERNAME_EXISTED);
            }

            Role role = roleRepository.findByName(Constant.USER).orElseGet(() -> Role.builder().name(Constant.USER.toUpperCase()).build());
            System.out.println(role.toString());
            // ----> FORMAT DATE
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate birthOfDate = LocalDate.parse(request.getBirthOfDate(), timeFormatter);

            User user = User.builder()
                    .username(request.getUsername())
                    .password(bCryptPasswordEncoder.encode(request.getPassword()))
                    .build();
            user.setRelationProfile(Profile.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .birthOfDate(birthOfDate)
                    .age(request.getAge())
                    .build());

            user.setRelationRole(Collections.singletonList(role));
            User userSave = userRepository.save(user);

            UserResponse response = UserResponse.builder()
                    .username(userSave.getUsername())
                    .firstName(userSave.getProfile().getFirstName())
                    .lastName(userSave.getProfile().getLastName())
                    .age(userSave.getProfile().getAge())
                    .birthOfDate(userSave.getProfile().getBirthOfDate())
                    .roleName(userSave.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                    .build();
            return CommonResponse.success(response, "Thêm user thành công!");
        } catch (Exception e) {
            log.error("[ERROR-TO-REGISTER] {}", e.getMessage());
            return CommonResponse.internalServerError(null, null);
        }
    }

    public CommonResponse<Map<String, Object>> login(LoginRequest request) {
        try {
            User userExistByUsername = userRepository.findByUsername(request.getUsername()).orElse(null);
            if (ObjectUtils.isEmpty(userExistByUsername)) {
                return CommonResponse.badRequest(null, Constant.USERNAME_OR_PASSWORD_IS_NOT_CORRECT);
            }

            if (!bCryptPasswordEncoder.matches(request.getPassword(), userExistByUsername.getPassword())) {
                return CommonResponse.badRequest(null, Constant.USERNAME_OR_PASSWORD_IS_NOT_CORRECT);
            }
            String token = jwtTokenProvider.generateToken(request.getUsername());
            Map<String, Object> response = Map.of("token", token);

            return CommonResponse.success(response, "Login success!");
        } catch (Exception e) {
            log.error("[ERROR-TO-LOGIN] {}", e.getMessage());
            return CommonResponse.internalServerError(null, null);
        }
    }



    /*
        -------> LIST API INTERNAL
     */

    public CommonResponse<RoleResourceResponse> findListResourceByListRole(RoleResourceRequest request) {
        try {
            request.setRole(request.getRole().stream().map(String::toUpperCase).toList());
            List<Resource> resources = resourceRepository.findAllByRoles(request.getRole());
            List<RoleResourceResponse.Authen> authens = resources.stream()
                    .map(resource -> new RoleResourceResponse.Authen(resource.getUri(),
                            resource.getRoles().stream().map(Role::getName).collect(Collectors.toList()))) // MAP LIST<ROLE> TO LIST<STRING>
                    .collect(Collectors.toList());
            RoleResourceResponse roleResourceResponse = RoleResourceResponse.builder()
                    .authens(authens)
                    .build();
            return CommonResponse.success(roleResourceResponse, null);
        } catch (Exception e) {
            log.error("[INTERNAL][ERROR-FIND-LIST-RESOURCE-BY-LIST-ROLE] {}", e.getMessage());
            return CommonResponse.internalServerError(null, null);
        }
    }

    public CommonResponse<MethodResourceResponse> findListResourceByPermitAllRole() {
        try {
            List<Resource> resources = resourceRepository.findPermitAllResource();
            List<MethodResourceResponse.Authen> authens = resources.stream().map(resource -> new MethodResourceResponse.Authen(resource.getUri(),
                            resource.getMethod().toString())) // MAP LIST<ROLE> TO LIST<STRING>
                    .collect(Collectors.toList());
            MethodResourceResponse permitAll = MethodResourceResponse.builder().authens(authens).build();
            return CommonResponse.success(permitAll, null);
        } catch (Exception e) {
            log.error("[INTERNAL][ERROR-FIND-LIST-RESOURCE-BY-LIST-ROLE] {}", e.getMessage());
            return CommonResponse.internalServerError(null, null);
        }
    }

}
