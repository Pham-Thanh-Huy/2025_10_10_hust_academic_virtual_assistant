package com.huypt.crawler_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseResponse<T> {
    private T data;
    private Message message;


    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(data, Message.initEnumMessage(StatusEnum.SUCCESS));
    }

    public static <T> BaseResponse<T> success() {
        return new BaseResponse<>(null, Message.initEnumMessage(StatusEnum.SUCCESS));
    }

    public static <T> BaseResponse<T> badRequest(T data) {
        return new BaseResponse<>(data, Message.initEnumMessage(StatusEnum.SUCCESS));
    }

    public static <T> BaseResponse<T> badRequest() {
        return new BaseResponse<>(null, Message.initEnumMessage(StatusEnum.SUCCESS));
    }

    public static <T> BaseResponse<T> internalServerError(T data) {
        return new BaseResponse<>(data, Message.initEnumMessage(StatusEnum.SUCCESS));
    }

    public static <T> BaseResponse<T> internalServerError() {
        return new BaseResponse<>(null, Message.initEnumMessage(StatusEnum.SUCCESS));
    }
}
