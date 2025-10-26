package com.huypt.crawler_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum StatusEnum {
    SUCCESS("success!", 200),
    BAD_REQUEST("bad request", 400),
    INTERNAL_SERVER_ERROR("internal_server_error!", 500);

    private final String message;
    private final Integer status;
}
