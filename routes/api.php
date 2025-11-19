<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// API routes only - no Inertia/SSR rendering
// All user-facing routes are handled by React SPA (client-side routing)
// Frontend accesses these endpoints via fetch/axios using apiUrl() helper

// Health check endpoint (public, no auth required)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'message' => 'Laravel API is running'
    ]);
});

Route::middleware('api')->group(function () {
    // Protected routes (require Sanctum authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // Example protected endpoints:
        // Route::get('/dashboard', [DashboardController::class, 'index']);
        // Route::post('/logout', [LogoutController::class, 'logout']);
        // Route::put('/profile', [ProfileController::class, 'update']);
    });

    // Public API routes (no authentication required)
    // Example: Route::get('/posts', [PostController::class, 'index']);
    // Example: Route::post('/register', [RegisterController::class, 'register']);
});

