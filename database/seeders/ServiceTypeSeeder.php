<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceType;

class ServiceTypeSeeder extends Seeder
{
    public function run()
    {
        $serviceTypes = [
            [
                'name' => 'Oil Change',
                'category' => 'Engine',
                'recommended_interval_km' => 5000,
                'recommended_interval_days' => 180,
                'description' => 'Regular oil and filter change'
            ],
            [
                'name' => 'Brake Pads',
                'category' => 'Brakes',
                'recommended_interval_km' => 40000,
                'description' => 'Replace brake pads'
            ],
            [
                'name' => 'Tire Rotation',
                'category' => 'Tires',
                'recommended_interval_km' => 10000,
                'description' => 'Rotate tires for even wear'
            ],
            [
                'name' => 'Air Filter',
                'category' => 'Engine',
                'recommended_interval_km' => 15000,
                'description' => 'Replace engine air filter'
            ],
            [
                'name' => 'Battery Check',
                'category' => 'Electrical',
                'recommended_interval_days' => 365,
                'description' => 'Check battery health and terminals'
            ],
            [
                'name' => 'Coolant Flush',
                'category' => 'Engine',
                'recommended_interval_km' => 50000,
                'description' => 'Flush and replace coolant'
            ],
            [
                'name' => 'Transmission Service',
                'category' => 'Transmission',
                'recommended_interval_km' => 60000,
                'description' => 'Check and change transmission fluid'
            ],
            [
                'name' => 'Wheel Alignment',
                'category' => 'Tires',
                'recommended_interval_km' => 20000,
                'description' => 'Check and adjust wheel alignment'
            ],
        ];

        foreach ($serviceTypes as $type) {
            ServiceType::create($type);
        }
    }
}