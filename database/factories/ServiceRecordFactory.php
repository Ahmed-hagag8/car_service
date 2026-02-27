<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\ServiceType;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'car_id' => Car::factory(),
            'service_type_id' => 1,
            'service_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'mileage_at_service' => fake()->numberBetween(5000, 150000),
            'cost' => fake()->randomFloat(2, 50, 2000),
            'notes' => fake()->optional()->sentence(),
            'service_provider' => fake()->optional()->company(),
        ];
    }
}
