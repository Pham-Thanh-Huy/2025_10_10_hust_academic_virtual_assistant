package com.huypt.user_service.dtos.status;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ResponseStatus {
    SUCCESS("Success!", 200),
    BAD_REQUEST("Bad request!", 400),
    UNAUTHORIZED("Unauthorized!", 401),
    FORBIDDEN("Forbidden!", 403),
    NOT_FOUND("Not found!", 404),
    CONFLICT("Conflict!", 409),
    INTERNAL_SERVER_ERROR("Internal server error!", 500),
    SERVICE_UNAVAILABLE("Service unavailable!", 503);

    private final String message;
    private final int status;
}
