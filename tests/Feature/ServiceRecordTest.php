<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\ServiceRecord;
use App\Models\ServiceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceRecordTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Car $car;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->car = Car::factory()->create(['user_id' => $this->user->id]);

        // Seed service types for tests
        ServiceType::create(['name' => 'Oil Change', 'interval_months' => 6, 'interval_km' => 10000]);
    }

    public function test_user_can_list_service_records(): void
    {
        ServiceRecord::factory()->count(3)->create(['car_id' => $this->car->id, 'service_type_id' => 1]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/service-records?no_paginate=1');

        $response->assertOk();
    }

    public function test_user_can_create_service_record(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/service-records', [
                'car_id' => $this->car->id,
                'service_type_id' => 1,
                'service_date' => '2025-06-15',
                'mileage_at_service' => 50000,
                'cost' => 150.00,
                'notes' => 'Regular oil change',
                'service_provider' => 'Quick Lube',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('service_records', ['cost' => 150.00]);
    }

    public function test_user_can_delete_service_record(): void
    {
        $record = ServiceRecord::factory()->create([
            'car_id' => $this->car->id,
            'service_type_id' => 1,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/service-records/{$record->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('service_records', ['id' => $record->id]);
    }

    public function test_user_cannot_access_other_users_records(): void
    {
        $otherUser = User::factory()->create();
        $otherCar = Car::factory()->create(['user_id' => $otherUser->id]);
        $record = ServiceRecord::factory()->create([
            'car_id' => $otherCar->id,
            'service_type_id' => 1,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/service-records/{$record->id}");

        $response->assertStatus(404);
    }

    public function test_create_service_record_validates_data(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/service-records', []);

        $response->assertStatus(422);
    }
}
