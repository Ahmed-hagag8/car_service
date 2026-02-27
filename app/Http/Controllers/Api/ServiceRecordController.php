<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRecordRequest;
use App\Http\Requests\UpdateServiceRecordRequest;
use App\Models\ServiceRecord;
use App\Models\Car;
use App\Models\Reminder;
use App\Models\ServiceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ServiceRecordController extends Controller
{
    /**
     * List all service records for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $serviceRecords = ServiceRecord::whereHas('car', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['car', 'serviceType'])
            ->latest()
            ->get();

        return response()->json($serviceRecords);
    }

    /**
     * Store a new service record and auto-create a reminder.
     */
    public function store(StoreServiceRecordRequest $request)
    {
        $validated = $request->validated();

        // Verify the car belongs to the authenticated user
        $car = $request->user()->cars()->findOrFail($validated['car_id']);

        // Get the service type for logging
        $serviceType = ServiceType::find($validated['service_type_id']);

        // Use the date and mileage entered by the user for the reminder
        $nextDueDate = $validated['service_date'];
        $nextDueMileage = $validated['mileage_at_service'];

        Log::info('Creating service record', [
            'service_type' => $serviceType->name,
            'next_due_date' => $nextDueDate,
            'next_due_mileage' => $nextDueMileage,
        ]);

        $validated['next_due_date'] = $nextDueDate;
        $validated['next_due_mileage'] = $nextDueMileage;

        // Create the service record
        $serviceRecord = ServiceRecord::create($validated);

        // Update the car's current mileage
        $car->update(['current_mileage' => $validated['mileage_at_service']]);

        // Create or update the reminder using the helper method
        if ($nextDueDate || $nextDueMileage) {
            $this->createOrUpdateReminder($car->id, $validated['service_type_id'], $nextDueDate, $nextDueMileage);
        }

        return response()->json([
            'message' => 'Service record added successfully',
            'service_record' => $serviceRecord->load(['car', 'serviceType'])
        ], 201);
    }

    /**
     * Show a single service record.
     */
    public function show(Request $request, $id)
    {
        $serviceRecord = ServiceRecord::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
            ->with(['car', 'serviceType'])
            ->findOrFail($id);

        return response()->json($serviceRecord);
    }

    /**
     * Update a service record.
     */
    public function update(UpdateServiceRecordRequest $request, $id)
    {
        $serviceRecord = ServiceRecord::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $serviceRecord->update($request->validated());

        return response()->json([
            'message' => 'Service record updated successfully',
            'service_record' => $serviceRecord->load(['car', 'serviceType'])
        ]);
    }

    /**
     * Delete a service record.
     */
    public function destroy(Request $request, $id)
    {
        $serviceRecord = ServiceRecord::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $serviceRecord->delete();

        return response()->json([
            'message' => 'Service record deleted successfully'
        ]);
    }

    /**
     * List all service records for a specific car.
     */
    public function getCarServices(Request $request, $carId)
    {
        $car = $request->user()->cars()->findOrFail($carId);

        $services = $car->serviceRecords()
            ->with('serviceType')
            ->latest('service_date')
            ->get();

        return response()->json($services);
    }

    /**
     * Create or update a reminder for a car's service type.
     * Deletes any existing pending reminder for the same service type and creates a new one.
     */
    private function createOrUpdateReminder($carId, $serviceTypeId, $dueDate, $dueMileage)
    {
        // Delete old pending reminders for the same service type
        Reminder::where('car_id', $carId)
            ->where('service_type_id', $serviceTypeId)
            ->where('status', 'pending')
            ->delete();

        // Create a new reminder
        Reminder::create([
            'car_id' => $carId,
            'service_type_id' => $serviceTypeId,
            'due_date' => $dueDate,
            'due_mileage' => $dueMileage,
            'status' => 'pending'
        ]);
    }
}