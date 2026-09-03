<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'Operation successful.', int $statusCode = 200, array $meta = []): JsonResponse
    {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if (!empty($meta)) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $statusCode);
    }

    public static function error(string $message = 'An error occurred.', int $statusCode = 400, mixed $errors = null): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $statusCode);
    }

    public static function forbidden(string $message = 'You do not have permission to perform this action.'): JsonResponse
    {
        return self::error($message, 403);
    }

    public static function notFound(string $message = 'Resource not found.'): JsonResponse
    {
        return self::error($message, 404);
    }

    public static function unauthorized(string $message = 'Unauthenticated.'): JsonResponse
    {
        return self::error($message, 401);
    }
}
