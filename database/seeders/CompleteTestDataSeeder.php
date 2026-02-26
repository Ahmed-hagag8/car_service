<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Car;
use App\Models\ServiceType;
use App\Models\ServiceRecord;
use App\Models\Reminder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class CompleteTestDataSeeder extends Seeder
{
    public function run()
    {
        // 1. إنشاء/جلب المستخدم
        $user = User::firstOrCreate(
            ['email' => 'ahmed@test.com'],
            [
                'name' => 'Ahmed',
                'password' => Hash::make('password123')
            ]
        );

        echo "User created: {$user->email}\n";

        // 2. مسح البيانات القديمة للمستخدم ده
        Reminder::whereIn('car_id', $user->cars->pluck('id'))->delete();
        ServiceRecord::whereIn('car_id', $user->cars->pluck('id'))->delete();
        $user->cars()->delete();

        // 3. إنشاء عربيات
        $car1 = Car::create([
            'user_id' => $user->id,
            'brand' => 'Toyota',
            'model' => 'Camry',
            'year' => 2020,
            'current_mileage' => 50000,
            'plate_number' => 'ABC123',
            'color' => 'Silver'
        ]);

        $car2 = Car::create([
            'user_id' => $user->id,
            'brand' => 'Honda',
            'model' => 'Accord',
            'year' => 2019,
            'current_mileage' => 60000,
            'plate_number' => 'XYZ789',
            'color' => 'Black'
        ]);

        echo "Cars created\n";

        // 4. جلب أنواع الخدمات
        $oilChange = ServiceType::where('name', 'Oil Change')->first();
        $brakes = ServiceType::where('name', 'Brake Pads')->first();
        $tireRotation = ServiceType::where('name', 'Tire Rotation')->first();

        // 5. إنشاء Service Records مع Reminders

        // Oil Change - قادم (بعد 30 يوم)
        if ($oilChange) {
            $serviceDate = Carbon::now()->subDays(150);
            $nextDueDate = Carbon::now()->addDays(30);
            
            ServiceRecord::create([
                'car_id' => $car1->id,
                'service_type_id' => $oilChange->id,
                'service_date' => $serviceDate->format('Y-m-d'),
                'mileage_at_service' => 45000,
                'cost' => 50.00,
                'service_provider' => 'Quick Lube',
                'notes' => 'Regular oil change',
                'next_due_date' => $nextDueDate->format('Y-m-d'),
                'next_due_mileage' => 50000
            ]);

            Reminder::create([
                'car_id' => $car1->id,
                'service_type_id' => $oilChange->id,
                'due_date' => $nextDueDate->format('Y-m-d'),
                'due_mileage' => 50000,
                'status' => 'pending'
            ]);

            echo "Oil Change reminder created (upcoming)\n";
        }

        // Brake Pads - متأخر (قبل 10 أيام)
        if ($brakes) {
            $serviceDate = Carbon::now()->subDays(400);
            $nextDueDate = Carbon::now()->subDays(10);
            
            ServiceRecord::create([
                'car_id' => $car1->id,
                'service_type_id' => $brakes->id,
                'service_date' => $serviceDate->format('Y-m-d'),
                'mileage_at_service' => 10000,
                'cost' => 150.00,
                'service_provider' => 'Brake Masters',
                'notes' => 'Front brake pads replaced',
                'next_due_date' => $nextDueDate->format('Y-m-d'),
                'next_due_mileage' => 50000
            ]);

            Reminder::create([
                'car_id' => $car1->id,
                'service_type_id' => $brakes->id,
                'due_date' => $nextDueDate->format('Y-m-d'),
                'due_mileage' => 50000,
                'status' => 'pending'
            ]);

            echo "Brake Pads reminder created (overdue)\n";
        }

        // Tire Rotation - قادم (بعد 60 يوم)
        if ($tireRotation) {
            $serviceDate = Carbon::now()->subDays(50);
            $nextDueDate = Carbon::now()->addDays(60);
            
            ServiceRecord::create([
                'car_id' => $car2->id,
                'service_type_id' => $tireRotation->id,
                'service_date' => $serviceDate->format('Y-m-d'),
                'mileage_at_service' => 55000,
                'cost' => 30.00,
                'service_provider' => 'Tire Shop',
                'notes' => 'Rotated all tires',
                'next_due_date' => $nextDueDate->format('Y-m-d'),
                'next_due_mileage' => 65000
            ]);

            Reminder::create([
                'car_id' => $car2->id,
                'service_type_id' => $tireRotation->id,
                'due_date' => $nextDueDate->format('Y-m-d'),
                'due_mileage' => 65000,
                'status' => 'pending'
            ]);

            echo "Tire Rotation reminder created (upcoming)\n";
        }

        // Oil Change للعربية التانية - قادم (بعد 15 يوم)
        if ($oilChange) {
            $serviceDate = Carbon::now()->subDays(165);
            $nextDueDate = Carbon::now()->addDays(15);
            
            ServiceRecord::create([
                'car_id' => $car2->id,
                'service_type_id' => $oilChange->id,
                'service_date' => $serviceDate->format('Y-m-d'),
                'mileage_at_service' => 55000,
                'cost' => 55.00,
                'service_provider' => 'Honda Service Center',
                'notes' => 'Synthetic oil change',
                'next_due_date' => $nextDueDate->format('Y-m-d'),
                'next_due_mileage' => 60000
            ]);

            Reminder::create([
                'car_id' => $car2->id,
                'service_type_id' => $oilChange->id,
                'due_date' => $nextDueDate->format('Y-m-d'),
                'due_mileage' => 60000,
                'status' => 'pending'
            ]);

            echo "Second Oil Change reminder created (upcoming)\n";
        }

        echo "\n✅ Test data created successfully!\n";
        echo "Email: ahmed@test.com\n";
        echo "Password: password123\n";
        echo "Total Cars: 2\n";
        echo "Total Service Records: 4\n";
        echo "Total Reminders: 4\n";
        echo "Upcoming Services: 3\n";
        echo "Overdue Services: 1\n";
    }
}