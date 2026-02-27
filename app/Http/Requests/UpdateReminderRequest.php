<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReminderRequest extends FormRequest
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
            'status' => 'required|in:pending,completed,dismissed',
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'The reminder status is required.',
            'status.in' => 'The status must be one of: pending, completed, or dismissed.',
        ];
    }
}
