package com.apiplatform.api_platform.request.exception;

public class ApiRequestNotFoundException extends RuntimeException {

    public ApiRequestNotFoundException(String message) {
        super(message);
    }
}
