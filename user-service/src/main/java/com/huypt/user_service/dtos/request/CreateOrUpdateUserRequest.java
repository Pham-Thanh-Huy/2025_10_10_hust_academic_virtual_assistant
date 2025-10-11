package com.huypt.user_service.dtos.request;

import com.huypt.user_service.exception.custom.NotNullOrEmptyString;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Builder
@Data
public class CreateOrUpdateUserRequest {
    @NotNullOrEmptyString(message = "username required and not null!")
    private String username;

    @NotNullOrEmptyString(message = "password required and not null!")
    private String password;


    @NotNullOrEmptyString(message = "firstName required and not null!")
    private String firstName;

    @NotNullOrEmptyString(message = "lastName required and not null!")
    private String lastName;

    @NotNull(message = "age required!")
    @Min(value = 1, message = "age must be greater than or equal to 1")
    @Max(value = 100, message = "age must be less than or equal to 100")
    private Integer age;

    @NotNullOrEmptyString(message = "Date of birth is required!")
    @Pattern(
            regexp = "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$",
            message = "Birth-Of-Date input type: yyyy-MM-dd (Month 01-12 And Day 01-30)!"
    )
    private String birthOfDate;
}
