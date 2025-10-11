package com.huypt.authen_service.dtos.status;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Message {
    public String message;
    public int status;
}
