package com.catrental.dto.ai;

public record AiResult<T>(boolean available, T data, String error) {
    public static <T> AiResult<T> ok(T data) {
        return new AiResult<>(true, data, null);
    }

    public static <T> AiResult<T> unavailable(String error) {
        return new AiResult<>(false, null, error);
    }
}
