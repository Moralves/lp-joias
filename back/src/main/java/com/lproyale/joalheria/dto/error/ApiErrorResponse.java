package com.lproyale.joalheria.dto.error;

import java.time.LocalDateTime;

/**
 * Payload padronizado de erro retornado pelo GlobalExceptionHandler.
 * Mantém o campo {@code message} na raiz para exibição direta nos toasts do front-end.
 */
public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(LocalDateTime.now(), status, error, message, path);
    }
}

