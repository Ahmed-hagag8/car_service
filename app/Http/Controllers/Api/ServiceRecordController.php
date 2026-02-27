<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRecordRequest;
use App\Http\Requests\UpdateServiceRecordRequest;
use App\Http\Resources\ServiceRecordResource;
use App\Models\ServiceRecord;
use App\Models\Reminder;
use App\Models\ServiceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ServiceRecordController extends Controller
{
    /**
     * List all service records with optional filters and pagination.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = ServiceRecord::whereHas('car', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with(['car', 'serviceType']);

        if ($request->has('car_id') && $request->car_id) {
            $query->where('car_id', $request->car_id);
        }

        if ($request->has('service_type_id') && $request->service_type_id) {
            $query->where('service_type_id', $request->service_type_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->where('service_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('service_date', '<=', $request->date_to);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('notes', 'like', "%{$search}%")
                    ->orWhere('service_provider', 'like', "%{$search}%");
            });
        }

        $query->latest('service_date');

        if ($request->has('no_paginate')) {
            return ServiceRecordResource::collection($query->get());
        }

        return ServiceRecordResource::collection($query->paginate($request->get('per_page', 15)));
    }

    /**
     * Store a new service record and auto-create a reminder.
     */
    public function store(StoreServiceRecordRequest $request)
    {
        $validated = $request->validated();
        $car = $request->user()->cars()->findOrFail($validated['car_id']);
        $serviceType = ServiceType::find($validated['service_type_id']);

        $nextDueDate = $validated['service_date'];
        $nextDueMileage = $validated['mileage_at_service'];

        Log::info('Creating service record', [
            'service_type' => $serviceType->name,
            'next_due_date' => $nextDueDate,
            'next_due_mileage' => $nextDueMileage,
        ]);

        $validated['next_due_date'] = $nextDueDate;
        $validated['next_due_mileage'] = $nextDueMileage;

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('service-receipts', 'public');
        }
        unset($validated['image']);

        $serviceRecord = ServiceRecord::create($validated);
        $car->update(['current_mileage' => $validated['mileage_at_service']]);

        if ($nextDueDate || $nextDueMileage) {
            $this->createOrUpdateReminder($car->id, $validated['service_type_id'], $nextDueDate, $nextDueMileage);
        }

        return response()->json([
            'message' => 'Service record added successfully',
            'service_record' => new ServiceRecordResource($serviceRecord->load(['car', 'serviceType']))
        ], 201);
    }

    /**
     * Show a single service record.
     */
    public function show(Request $request, $id)
    {
        $serviceRecord = ServiceRecord::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->with(['car', 'serviceType'])->findOrFail($id);

        return new ServiceRecordResource($serviceRecord);
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
            'service_record' => new ServiceRecordResource($serviceRecord->load(['car', 'serviceType']))
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

        return response()->json(['message' => 'Service record deleted successfully']);
    }

    /**
     * List all service records for a specific car.
     */
    public function getCarServices(Request $request, $carId)
    {
        $car = $request->user()->cars()->findOrFail($carId);

        return ServiceRecordResource::collection(
            $car->serviceRecords()->with('serviceType')->latest('service_date')->get()
        );
    }

    private function createOrUpdateReminder($carId, $serviceTypeId, $dueDate, $dueMileage)
    {
        Reminder::where('car_id', $carId)
            ->where('service_type_id', $serviceTypeId)
            ->where('status', 'pending')
            ->delete();

        Reminder::create([
            'car_id' => $carId,
            'service_type_id' => $serviceTypeId,
            'due_date' => $dueDate,
            'due_mileage' => $dueMileage,
            'status' => 'pending'
        ]);
    }
}