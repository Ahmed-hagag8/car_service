<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRecordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'car_id' => 'required|exists:cars,id',
            'service_type_id' => 'required|exists:service_types,id',
            'service_date' => 'required|date',
            'mileage_at_service' => 'required|integer|min:0',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'service_provider' => 'nullable|string|max:255',
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'car_id.required' => 'Please select a car.',
            'car_id.exists' => 'The selected car does not exist.',
            'service_type_id.required' => 'Please select a service type.',
            'service_type_id.exists' => 'The selected service type does not exist.',
            'service_date.required' => 'The service date is required.',
            'mileage_at_service.required' => 'The mileage at service is required.',
            'mileage_at_service.min' => 'The mileage cannot be negative.',
            'cost.min' => 'The cost cannot be negative.',
        ];
    }
}
