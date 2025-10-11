package com.huypt.authen_service.security.utils;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ValidateEndpoints {
    HAS_PERMIT_ALL_ENPOINT("Has permit all endpoint!"),
    REQUEST_NOT_ENOUGH("Request not enough!"), // ----> IF NOT HAVE X-Authen-Url or X-Authen-Method in request header
    REQUEST_MUST_BE_AUTHEN("Request must be authen!");
    private final String message;
}
