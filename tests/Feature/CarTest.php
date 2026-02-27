<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_list_cars(): void
    {
        Car::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/cars?no_paginate=1');

        $response->assertOk();
    }

    public function test_user_can_create_car(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/cars', [
                'brand' => 'Toyota',
                'model' => 'Camry',
                'year' => 2023,
                'current_mileage' => 15000,
                'plate_number' => 'ABC 1234',
                'color' => 'White',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['brand' => 'Toyota']);

        $this->assertDatabaseHas('cars', ['brand' => 'Toyota', 'model' => 'Camry']);
    }

    public function test_user_can_update_car(): void
    {
        $car = Car::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/cars/{$car->id}", [
                'brand' => 'Honda',
                'model' => 'Civic',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('cars', ['id' => $car->id, 'brand' => 'Honda']);
    }

    public function test_user_can_delete_car(): void
    {
        $car = Car::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/cars/{$car->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('cars', ['id' => $car->id]);
    }

    public function test_user_cannot_access_other_users_car(): void
    {
        $otherUser = User::factory()->create();
        $car = Car::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/cars/{$car->id}");

        $response->assertStatus(404);
    }

    public function test_car_creation_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/cars', []);

        $response->assertStatus(422);
    }

    public function test_user_can_search_cars(): void
    {
        Car::factory()->create(['user_id' => $this->user->id, 'brand' => 'Toyota', 'model' => 'Camry']);
        Car::factory()->create(['user_id' => $this->user->id, 'brand' => 'Honda', 'model' => 'Civic']);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/cars?search=Toyota&no_paginate=1');

        $response->assertOk();
    }
}
