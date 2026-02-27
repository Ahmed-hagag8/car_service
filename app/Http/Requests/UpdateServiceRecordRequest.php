<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRecordRequest extends FormRequest
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
            'service_date' => 'sometimes|date',
            'mileage_at_service' => 'sometimes|integer|min:0',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'service_provider' => 'nullable|string|max:255',
        ];
    }
}
