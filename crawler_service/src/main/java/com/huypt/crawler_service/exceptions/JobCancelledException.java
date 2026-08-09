package com.huypt.crawler_service.exceptions;

public class JobCancelledException extends RuntimeException {

    public JobCancelledException(String message) {
        super(message);
    }
}