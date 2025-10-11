package com.huypt.user_service.exception.custom;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NotNullOrEmptyStringValidator.class)
public @interface NotNullOrEmptyString {
    String message() default "Value cannot be 'null' as a string and must not be empty or null";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
