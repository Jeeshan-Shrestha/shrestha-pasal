package com.pasal.shop.common;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.pasal.shop.common.Exceptions.BadRequestException;
import com.pasal.shop.common.Exceptions.ConflictException;
import com.pasal.shop.common.Exceptions.NotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    public record ErrorResponse(Instant timestamp, int status, String error, String message,
            Map<String, String> fieldErrors) {
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<ErrorResponse> notFound(NotFoundException e) {
        return build(HttpStatus.NOT_FOUND, e.getMessage(), null);
    }

    @ExceptionHandler(BadRequestException.class)
    ResponseEntity<ErrorResponse> badRequest(BadRequestException e) {
        return build(HttpStatus.BAD_REQUEST, e.getMessage(), null);
    }

    @ExceptionHandler(ConflictException.class)
    ResponseEntity<ErrorResponse> conflict(ConflictException e) {
        return build(HttpStatus.CONFLICT, e.getMessage(), null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ErrorResponse> badCredentials(BadCredentialsException e) {
        return build(HttpStatus.UNAUTHORIZED, e.getMessage(), null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErrorResponse> denied(AccessDeniedException e) {
        return build(HttpStatus.FORBIDDEN, "You do not have permission to do that", null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e) {
        Map<String, String> fields = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(f -> fields.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return build(HttpStatus.BAD_REQUEST, "Validation failed", fields);
    }

    @ExceptionHandler({ HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            PropertyReferenceException.class })
    ResponseEntity<ErrorResponse> malformed(Exception e) {
        return build(HttpStatus.BAD_REQUEST, "Malformed request or invalid parameter", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorResponse> integrity(DataIntegrityViolationException e) {
        log.warn("Data integrity violation", e);
        return build(HttpStatus.CONFLICT, "The request conflicts with existing data", null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> other(Exception e) {
        log.error("Unhandled exception", e);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", null);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, Map<String, String> fields) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(Instant.now(), status.value(), status.getReasonPhrase(), message, fields));
    }
}
