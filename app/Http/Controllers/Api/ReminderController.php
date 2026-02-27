<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateReminderRequest;
use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    /**
     * List all pending reminders for the authenticated user.
     */
    public function index(Request $request)
    {
        $reminders = Reminder::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
            ->with(['car', 'serviceType'])
            ->where('status', 'pending')
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json($reminders);
    }

    /**
     * List overdue reminders for the authenticated user.
     */
    public function overdue(Request $request)
    {
        $reminders = Reminder::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
            ->with(['car', 'serviceType'])
            ->where('status', 'pending')
            ->where('due_date', '<', now())
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json($reminders);
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
            'reminder' => $reminder
        ]);
    }
}