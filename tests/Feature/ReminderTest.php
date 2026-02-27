<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\Reminder;
use App\Models\ServiceType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReminderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Car $car;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->car = Car::factory()->create(['user_id' => $this->user->id]);
        ServiceType::create(['name' => 'Oil Change', 'interval_months' => 6, 'interval_km' => 10000]);
    }

    public function test_user_can_list_reminders(): void
    {
        Reminder::factory()->count(2)->create([
            'car_id' => $this->car->id,
            'service_type_id' => 1,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/reminders?no_paginate=1');

        $response->assertOk();
    }

    public function test_user_can_update_reminder_status(): void
    {
        $reminder = Reminder::factory()->create([
            'car_id' => $this->car->id,
            'service_type_id' => 1,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/reminders/{$reminder->id}", [
                'status' => 'completed',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('reminders', ['id' => $reminder->id, 'status' => 'completed']);
    }

    public function test_user_can_dismiss_reminder(): void
    {
        $reminder = Reminder::factory()->create([
            'car_id' => $this->car->id,
            'service_type_id' => 1,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/reminders/{$reminder->id}", [
                'status' => 'dismissed',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('reminders', ['id' => $reminder->id, 'status' => 'dismissed']);
    }

    public function test_user_cannot_update_other_users_reminder(): void
    {
        $otherUser = User::factory()->create();
        $otherCar = Car::factory()->create(['user_id' => $otherUser->id]);
        $reminder = Reminder::factory()->create([
            'car_id' => $otherCar->id,
            'service_type_id' => 1,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/reminders/{$reminder->id}", [
                'status' => 'completed',
            ]);

        $response->assertStatus(404);
    }

    public function test_overdue_reminders_endpoint(): void
    {
        Reminder::factory()->create([
            'car_id' => $this->car->id,
            'service_type_id' => 1,
            'due_date' => now()->subDays(5)->format('Y-m-d'),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/reminders/overdue?no_paginate=1');

        $response->assertOk();
    }
}
