<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'brand' => fake()->randomElement(['Toyota', 'Honda', 'BMW', 'Mercedes', 'Hyundai', 'Kia']),
            'model' => fake()->randomElement(['Camry', 'Civic', 'X5', 'C-Class', 'Elantra', 'Sportage']),
            'year' => fake()->numberBetween(2015, 2025),
            'current_mileage' => fake()->numberBetween(1000, 200000),
            'plate_number' => strtoupper(fake()->bothify('??? ####')),
            'color' => fake()->safeColorName(),
        ];
    }
}
