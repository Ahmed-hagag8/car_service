<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCarRequest extends FormRequest
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
            'brand' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'year' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'current_mileage' => 'sometimes|integer|min:0',
            'plate_number' => 'nullable|string|max:255',
            'vin' => 'nullable|string|max:17',
            'color' => 'nullable|string|max:255',
        ];
    }
}
