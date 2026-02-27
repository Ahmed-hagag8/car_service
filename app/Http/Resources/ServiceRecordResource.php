<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'car_id' => $this->car_id,
            'service_type_id' => $this->service_type_id,
            'service_date' => $this->service_date,
            'mileage_at_service' => $this->mileage_at_service,
            'cost' => $this->cost,
            'notes' => $this->notes,
            'service_provider' => $this->service_provider,
            'next_due_date' => $this->next_due_date,
            'next_due_mileage' => $this->next_due_mileage,
            'image_path' => $this->image_path,
            'image_url' => $this->image_path ? url('storage/' . $this->image_path) : null,
            'created_at' => $this->created_at->toISOString(),
            'car' => new CarResource($this->whenLoaded('car')),
            'service_type' => $this->whenLoaded('serviceType'),
        ];
    }
}
