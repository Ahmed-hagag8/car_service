<?php

namespace Database\Factories;

use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReminderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'car_id' => Car::factory(),
            'service_type_id' => 1,
            'due_date' => fake()->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
            'due_mileage' => fake()->optional()->numberBetween(10000, 200000),
            'status' => 'pending',
        ];
    }
}
