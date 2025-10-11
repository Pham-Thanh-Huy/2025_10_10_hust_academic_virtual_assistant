package com.huypt.user_service.exception;

import com.huypt.user_service.dtos.CommonResponse;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ValidateException extends Exception{

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResponse<Map<String, Object>>> validate(MethodArgumentNotValidException ex){
        Map<String, Object> exception = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(
                error -> {
                    exception.put(error.getField(), error.getDefaultMessage());
                }
        );
        CommonResponse<Map<String, Object>> response = CommonResponse.badRequest(exception, "Validate error!");
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(response.getMessage().getStatus()));
    }
}