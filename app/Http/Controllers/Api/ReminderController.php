<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{

    
    // عرض كل التنبيهات
    public function index(Request $request)
    {
        $reminders = Reminder::whereHas('car', function($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
        ->with(['car', 'serviceType'])
        ->where('status', 'pending')
        ->orderBy('due_date', 'asc')
        ->get();

        return response()->json($reminders);
    }

    // التنبيهات المتأخرة
    public function overdue(Request $request)
    {
        $reminders = Reminder::whereHas('car', function($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
        ->with(['car', 'serviceType'])
        ->where('status', 'pending')
        ->where('due_date', '<', now())
        ->orderBy('due_date', 'asc')
        ->get();

        return response()->json($reminders);
    }

    // تحديث حالة التنبيه
    public function update(Request $request, $id)
    {
        $reminder = Reminder::whereHas('car', function($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,completed,dismissed'
        ]);

        $reminder->update($validated);

        return response()->json([
            'message' => 'Reminder updated successfully',
            'reminder' => $reminder
        ]);
    }
}