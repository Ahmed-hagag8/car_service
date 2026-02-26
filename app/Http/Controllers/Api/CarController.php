<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    // عرض كل العربيات بتاعة المستخدم
    public function index(Request $request)
    {
        $cars = $request->user()->cars()->with(['serviceRecords', 'reminders'])->get();
        
        return response()->json($cars);
    }

    // إضافة عربية جديدة
    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'current_mileage' => 'required|integer|min:0',
            'plate_number' => 'nullable|string|max:255',
            'vin' => 'nullable|string|max:17',
            'color' => 'nullable|string|max:255',
        ]);

        $car = $request->user()->cars()->create($validated);

        return response()->json([
            'message' => 'Car added successfully',
            'car' => $car
        ], 201);
    }

    // عرض عربية واحدة بالتفاصيل
    public function show(Request $request, $id)
    {
        $car = $request->user()->cars()->with(['serviceRecords.serviceType', 'reminders'])->findOrFail($id);

        return response()->json($car);
    }

    // تحديث بيانات عربية
    public function update(Request $request, $id)
    {
        $car = $request->user()->cars()->findOrFail($id);

        $validated = $request->validate([
            'brand' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'year' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'current_mileage' => 'sometimes|integer|min:0',
            'plate_number' => 'nullable|string|max:255',
            'vin' => 'nullable|string|max:17',
            'color' => 'nullable|string|max:255',
        ]);

        $car->update($validated);

        return response()->json([
            'message' => 'Car updated successfully',
            'car' => $car
        ]);
    }

    // حذف عربية
    public function destroy(Request $request, $id)
    {
        $car = $request->user()->cars()->findOrFail($id);
        $car->delete();

        return response()->json([
            'message' => 'Car deleted successfully'
        ]);
    }

    // إحصائيات العربية
    public function stats(Request $request, $id)
    {
        $car = $request->user()->cars()->with(['serviceRecords'])->findOrFail($id);

        $totalCost = $car->serviceRecords->sum('cost');
        $serviceCount = $car->serviceRecords->count();
        $averageCost = $serviceCount > 0 ? $totalCost / $serviceCount : 0;

        // الخدمات القادمة
        $upcomingServices = $car->reminders()
            ->where('status', 'pending')
            ->where(function($query) {
                $query->where('due_date', '>=', now())
                      ->orWhereNull('due_date');
            })
            ->with('serviceType')
            ->get();

        // الخدمات المتأخرة
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
