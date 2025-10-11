package com.huypt.user_service.dtos;

import com.huypt.user_service.dtos.status.Message;
import com.huypt.user_service.dtos.status.ResponseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.util.ObjectUtils;

@Data
@AllArgsConstructor
public class CommonResponse<T> {
    private T data;
    private Message message;

    public static <T> CommonResponse<T> success(T data, String message) {
        String msg = ObjectUtils.isEmpty(message) ? ResponseStatus.SUCCESS.getMessage() : message;
        return new CommonResponse<>(data, new Message(msg, ResponseStatus.SUCCESS.getStatus()));
    }

    public static <T> CommonResponse<T> badRequest(T data, String message) {
        String msg = ObjectUtils.isEmpty(message) ? ResponseStatus.BAD_REQUEST.getMessage() : message;
        return new CommonResponse<>(data, new Message(msg, ResponseStatus.BAD_REQUEST.getStatus()));
    }

    public static <T> CommonResponse<T> unauthorized(T data, String message) {
        String msg = ObjectUtils.isEmpty(message) ? ResponseStatus.UNAUTHORIZED.getMessage() : message;
        return new CommonResponse<>(data, new Message(msg, ResponseStatus.UNAUTHORIZED.getStatus()));
    }

    public static <T> CommonResponse<T> forbidden(T data, String message) {
        String msg = ObjectUtils.isEmpty(message) ? ResponseStatus.FORBIDDEN.getMessage() : message;
        return new CommonResponse<>(data, new Message(msg, ResponseStatus.FORBIDDEN.getStatus()));
    }

    public static <T> CommonResponse<T> notFound(T data, String message) {
        String msg = ObjectUtils.isEmpty(message) ? ResponseStatus.NOT_FOUND.getMessage() : message;
        return new CommonResponse<>(data, new Message(msg, ResponseStatus.NOT_FOUND.getStatus()));
    }

    public static <T> CommonResponse<T> conflict(T data, String message) {
        String msg = ObjectUtils.isEmpty(message) ? ResponseStatus.CONFLICT.getMessage() : message;
        return new CommonResponse<>(data, new Message(msg, ResponseStatus.CONFLICT.getStatus()));
    }

    public static <T> CommonResponse<T> internalServerError(T data, String message) {
        String msg = ObjectUtils.isEmpty(message) ? ResponseStatus.INTERNAL_SERVER_ERROR.getMessage() : message;
        return new CommonResponse<>(data, new Message(msg, ResponseStatus.INTERNAL_SERVER_ERROR.getStatus()));
    }

    public static <T> CommonResponse<T> serviceUnavailable(T data, String message) {
        String msg = ObjectUtils.isEmpty(message) ? ResponseStatus.SERVICE_UNAVAILABLE.getMessage() : message;
        return new CommonResponse<>(data, new Message(msg, ResponseStatus.SERVICE_UNAVAILABLE.getStatus()));
    }

}
