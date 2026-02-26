<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\ServiceRecordController;
use App\Http\Controllers\Api\ServiceTypeController;
use App\Http\Controllers\Api\ReminderController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Cars
    Route::apiResource('cars', CarController::class);
    
    // Service Types
    Route::get('service-types', [ServiceTypeController::class, 'index']);
    
    // Service Records
    Route::apiResource('service-records', ServiceRecordController::class);
    Route::get('cars/{car}/services', [ServiceRecordController::class, 'getCarServices']);
    
    // Reminders
    Route::middleware('auth:sanctum')->group(function () {
    // ... الروتس الموجودة
    
    // Reminders
    Route::get('reminders', [ReminderController::class, 'index']);
    Route::get('reminders/overdue', [ReminderController::class, 'overdue']);
    Route::put('reminders/{id}', [ReminderController::class, 'update']); // إضافة جديدة
    });
    
    // Stats
    Route::get('cars/{car}/stats', [CarController::class, 'stats']);
});