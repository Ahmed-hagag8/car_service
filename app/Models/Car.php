<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

        
    protected $fillable = [
        'user_id', 'brand', 'model', 'year', 'current_mileage', 
        'plate_number', 'vin', 'color'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function serviceRecords()
    {
        return $this->hasMany(ServiceRecord::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }
}
