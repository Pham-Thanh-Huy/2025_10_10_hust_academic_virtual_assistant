package com.huypt.user_service.controllers;

import com.huypt.user_service.dtos.CommonResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public abstract class BaseController{
    public <T> ResponseEntity<CommonResponse<T>> baseControllerResponse(CommonResponse<T> response){
        return new ResponseEntity<>(response, HttpStatus.valueOf(response.getMessage().getStatus()));
    }
}
