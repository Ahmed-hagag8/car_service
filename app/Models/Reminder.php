<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'car_id',
        'service_type_id',
        'due_date',
        'due_mileage',
        'status',
        'notified',
        'last_notified_at',
    ];

    protected $casts = [
        'due_date' => 'date:Y-m-d',
        'notified' => 'boolean',
        'last_notified_at' => 'datetime',
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
