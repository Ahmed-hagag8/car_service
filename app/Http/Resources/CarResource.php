<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'brand' => $this->brand,
            'model' => $this->model,
            'year' => $this->year,
            'current_mileage' => $this->current_mileage,
            'plate_number' => $this->plate_number,
            'vin' => $this->vin,
            'color' => $this->color,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'service_records' => ServiceRecordResource::collection($this->whenLoaded('serviceRecords')),
            'reminders' => ReminderResource::collection($this->whenLoaded('reminders')),
        ];
    }
}
