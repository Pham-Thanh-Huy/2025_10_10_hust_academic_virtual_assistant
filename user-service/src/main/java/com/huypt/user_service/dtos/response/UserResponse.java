package com.huypt.user_service.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {

    private Long id;

    private String username;

    private String password;

    private String firstName;

    private String lastName;

    private int age;

    private LocalDate birthOfDate;

    private List<String> roleName;
}
