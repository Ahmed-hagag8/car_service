<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use App\Models\Car;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ServiceRecordController extends Controller
{
    // عرض كل الخدمات
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

    // إضافة خدمة جديدة
    public function store(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'service_type_id' => 'required|exists:service_types,id',
            'service_date' => 'required|date',
            'mileage_at_service' => 'required|integer|min:0',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'service_provider' => 'nullable|string|max:255',
        ]);

        // التأكد إن العربية بتاعة المستخدم
        $car = $request->user()->cars()->findOrFail($validated['car_id']);

        // جلب نوع الخدمة
        $serviceType = \App\Models\ServiceType::find($validated['service_type_id']);

        // الـ reminder يستخدم نفس التاريخ والمسافة اللي المستخدم دخلها في الفورم
        $nextDueDate = $validated['service_date'];
        $nextDueMileage = $validated['mileage_at_service'];

        Log::info('Service Type:', [
            'id' => $serviceType->id,
            'name' => $serviceType->name,
            'interval_days' => $serviceType->recommended_interval_days,
            'interval_km' => $serviceType->recommended_interval_km
        ]);

        Log::info('Calculated dates:', [
            'next_due_date' => $nextDueDate,
            'next_due_mileage' => $nextDueMileage
        ]);


        $validated['next_due_date'] = $nextDueDate;
        $validated['next_due_mileage'] = $nextDueMileage;

        // إنشاء Service Record
        $serviceRecord = ServiceRecord::create($validated);

        // تحديث الـ mileage بتاع العربية
        $car->update(['current_mileage' => $validated['mileage_at_service']]);

        // إنشاء أو تحديث الـ reminder
        if ($nextDueDate || $nextDueMileage) {
            // امسح الـ reminder القديم لنفس النوع (لو موجود)
            Reminder::where('car_id', $car->id)
                ->where('service_type_id', $validated['service_type_id'])
                ->where('status', 'pending')
                ->delete();

            // اعمل reminder جديد
            Reminder::create([
                'car_id' => $car->id,
                'service_type_id' => $validated['service_type_id'],
                'due_date' => $nextDueDate,
                'due_mileage' => $nextDueMileage,
                'status' => 'pending'
            ]);
        }

        return response()->json([
            'message' => 'Service record added successfully',
            'service_record' => $serviceRecord->load(['car', 'serviceType'])
        ], 201);
    }

    // Helper function
    private function createOrUpdateReminder($carId, $serviceTypeId, $dueDate, $dueMileage)
    {
        // امسح الـ reminders القديمة لنفس النوع
        Reminder::where('car_id', $carId)
            ->where('service_type_id', $serviceTypeId)
            ->where('status', 'pending')
            ->delete();

        // اعمل reminder جديد
        Reminder::create([
            'car_id' => $carId,
            'service_type_id' => $serviceTypeId,
            'due_date' => $dueDate,
            'due_mileage' => $dueMileage,
            'status' => 'pending'
        ]);
    }

    // عرض خدمة معينة
    public function show(Request $request, $id)
    {
        $serviceRecord = ServiceRecord::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
            ->with(['car', 'serviceType'])
            ->findOrFail($id);

        return response()->json($serviceRecord);
    }

    // تحديث خدمة
    public function update(Request $request, $id)
    {
        $serviceRecord = ServiceRecord::whereHas('car', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $validated = $request->validate([
            'service_date' => 'sometimes|date',
            'mileage_at_service' => 'sometimes|integer|min:0',
            'cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'service_provider' => 'nullable|string|max:255',
        ]);

        $serviceRecord->update($validated);

        return response()->json([
            'message' => 'Service record updated successfully',
            'service_record' => $serviceRecord->load(['car', 'serviceType'])
        ]);
    }

    // حذف خدمة
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

    // عرض كل الخدمات لعربية معينة
    public function getCarServices(Request $request, $carId)
    {
        $car = $request->user()->cars()->findOrFail($carId);

        $services = $car->serviceRecords()
            ->with('serviceType')
            ->latest('service_date')
            ->get();

        return response()->json($services);
    }

    // Helper function لإنشاء أو تحديث الـ reminder

}