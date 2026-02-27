<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarRequest extends FormRequest
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
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'current_mileage' => 'required|integer|min:0',
            'plate_number' => 'nullable|string|max:255',
            'vin' => 'nullable|string|max:17',
            'color' => 'nullable|string|max:255',
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'brand.required' => 'The car brand is required.',
            'model.required' => 'The car model is required.',
            'year.required' => 'The manufacturing year is required.',
            'year.min' => 'The year must be 1900 or later.',
            'current_mileage.required' => 'The current mileage is required.',
            'current_mileage.min' => 'The mileage cannot be negative.',
            'vin.max' => 'The VIN cannot exceed 17 characters.',
        ];
    }
}
