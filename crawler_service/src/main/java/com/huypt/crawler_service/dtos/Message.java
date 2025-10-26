package com.huypt.crawler_service.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Message {
    private String message;
    private Integer status;


    public static Message initEnumMessage(StatusEnum statusEnum) {
        return new Message(statusEnum.getMessage(), statusEnum.getStatus());
    }
}
