package com.huypt.authen_service.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class UserAuthen {
    private Long id;

    private String username;

    private String password;

    private String firstName;

    private String lastName;

    private int age;

    private LocalDate birthOfDate;

    private List<String> roleName;

}
