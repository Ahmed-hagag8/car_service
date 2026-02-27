<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\ServiceRecordController;
use App\Http\Controllers\Api\ServiceTypeController;
use App\Http\Controllers\Api\ReminderController;
use App\Http\Controllers\Api\PasswordResetController;

// Public routes with rate limiting
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('throttle:3,5')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
});

// Password reset (public, rate limited)
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/password', [AuthController::class, 'changePassword']);

    // Cars
    Route::apiResource('cars', CarController::class);
    Route::get('cars/{car}/stats', [CarController::class, 'stats']);

    // Service Types
    Route::get('service-types', [ServiceTypeController::class, 'index']);

    // Service Records
    Route::apiResource('service-records', ServiceRecordController::class);
    Route::get('cars/{car}/services', [ServiceRecordController::class, 'getCarServices']);

    // Reminders
    Route::get('reminders', [ReminderController::class, 'index']);
    Route::get('reminders/overdue', [ReminderController::class, 'overdue']);
    Route::put('reminders/{id}', [ReminderController::class, 'update']);
});