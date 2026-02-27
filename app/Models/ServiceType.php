<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceType extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'recommended_interval_km',
        'recommended_interval_days',
        'category'
    ];

    public function serviceRecords()
    {
        return $this->hasMany(ServiceRecord::class);
    }
}
