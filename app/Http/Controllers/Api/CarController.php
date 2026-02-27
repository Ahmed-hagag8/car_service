<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    /**
     * List all cars for the authenticated user with optional search and pagination.
     */
    public function index(Request $request)
    {
        $query = $request->user()->cars()->with(['serviceRecords', 'reminders']);

        // Search by brand, model, or plate number
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('plate_number', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        // Paginate (default 12 per page) or return all if no_paginate is set
        if ($request->has('no_paginate')) {
            return response()->json($query->get());
        }

        return response()->json($query->paginate($request->get('per_page', 12)));
    }

    /**
     * Store a new car.
     */
    public function store(StoreCarRequest $request)
    {
        $car = $request->user()->cars()->create($request->validated());

        return response()->json([
            'message' => 'Car added successfully',
            'car' => $car
        ], 201);
    }

    /**
     * Show a single car with details.
     */
    public function show(Request $request, $id)
    {
        $car = $request->user()->cars()->with(['serviceRecords.serviceType', 'reminders'])->findOrFail($id);

        return response()->json($car);
    }

    /**
     * Update a car's details.
     */
    public function update(UpdateCarRequest $request, $id)
    {
        $car = $request->user()->cars()->findOrFail($id);
        $car->update($request->validated());

        return response()->json([
            'message' => 'Car updated successfully',
            'car' => $car
        ]);
    }

    /**
     * Delete a car.
     */
    public function destroy(Request $request, $id)
    {
        $car = $request->user()->cars()->findOrFail($id);
        $car->delete();

        return response()->json([
            'message' => 'Car deleted successfully'
        ]);
    }

    /**
     * Get statistics for a specific car.
     */
    public function stats(Request $request, $id)
    {
        $car = $request->user()->cars()->with(['serviceRecords'])->findOrFail($id);

        $totalCost = $car->serviceRecords->sum('cost');
        $serviceCount = $car->serviceRecords->count();
        $averageCost = $serviceCount > 0 ? $totalCost / $serviceCount : 0;

        // Upcoming services
        $upcomingServices = $car->reminders()
            ->where('status', 'pending')
            ->where(function ($query) {
                $query->where('due_date', '>=', now())
                    ->orWhereNull('due_date');
            })
            ->with('serviceType')
            ->get();

        // Overdue services
        $overdueServices = $car->reminders()
            ->where('status', 'pending')
            ->where('due_date', '<', now())
            ->with('serviceType')
            ->get();

        return response()->json([
            'car' => $car,
            'statistics' => [
                'total_cost' => $totalCost,
                'service_count' => $serviceCount,
                'average_cost' => round($averageCost, 2),
                'upcoming_services_count' => $upcomingServices->count(),
                'overdue_services_count' => $overdueServices->count(),
            ],
            'upcoming_services' => $upcomingServices,
            'overdue_services' => $overdueServices,
            'recent_services' => $car->serviceRecords()->latest()->take(5)->with('serviceType')->get(),
        ]);
    }
}
