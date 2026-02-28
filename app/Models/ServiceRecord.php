<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRecord extends Model
{
    use HasFactory;
    protected $fillable = [
        'car_id',
        'service_type_id',
        'service_date',
        'mileage_at_service',
        'cost',
        'notes',
        'service_provider',
        'next_due_date',
        'next_due_mileage'
    ];

    protected $casts = [
        'service_date' => 'date:Y-m-d',
        'next_due_date' => 'date:Y-m-d',
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function serviceType()
    {
        return $this->belongsTo(ServiceType::class);
    }
}
