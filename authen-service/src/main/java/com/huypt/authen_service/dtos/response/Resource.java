package com.huypt.authen_service.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Resource{
    private Long id;
    private String uri;
    private String method;
    private String name;
}
