<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateReminderRequest;
use App\Http\Resources\ReminderResource;
use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    /**
     * List all pending reminders with pagination.
     */
    public function index(Request $request)
    {
        $query = Reminder::whereHas('car', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })
            ->with(['car', 'serviceType'])
            ->where('status', 'pending')
            ->orderBy('due_date', 'asc');

        if ($request->has('car_id') && $request->car_id) {
            $query->where('car_id', $request->car_id);
        }

        if ($request->has('no_paginate')) {
            return ReminderResource::collection($query->get());
        }

        return ReminderResource::collection($query->paginate($request->get('per_page', 15)));
    }

    /**
     * List overdue reminders with pagination.
     */
    public function overdue(Request $request)
    {
        $query = Reminder::whereHas('car', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })
            ->with(['car', 'serviceType'])
            ->where('status', 'pending')
            ->where('due_date', '<', now())
            ->orderBy('due_date', 'asc');

        if ($request->has('no_paginate')) {
            return ReminderResource::collection($query->get());
        }

        return ReminderResource::collection($query->paginate($request->get('per_page', 15)));
    }

    /**
     * Update a reminder's status.
     */
    public function update(UpdateReminderRequest $request, $id)
    {
        $reminder = Reminder::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $reminder->update($request->validated());

        return response()->json([
            'message' => 'Reminder updated successfully',
            'reminder' => new ReminderResource($reminder)
        ]);
    }
}