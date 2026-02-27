<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReminderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'car_id' => $this->car_id,
            'service_type_id' => $this->service_type_id,
            'due_date' => $this->due_date,
            'due_mileage' => $this->due_mileage,
            'status' => $this->status,
            'created_at' => $this->created_at->toISOString(),
            'car' => new CarResource($this->whenLoaded('car')),
            'service_type' => $this->whenLoaded('serviceType'),
        ];
    }
}
