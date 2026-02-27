<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get chart data for the dashboard.
     */
    public function chartData(Request $request)
    {
        $user = $request->user();
        $carIds = $user->cars()->pluck('id');

        // Monthly spending (last 12 months)
        $monthlySpending = ServiceRecord::whereIn('car_id', $carIds)
            ->where('service_date', '>=', now()->subMonths(12))
            ->select(
                DB::raw("DATE_FORMAT(service_date, '%Y-%m') as month"),
                DB::raw('SUM(cost) as total_cost'),
                DB::raw('COUNT(*) as service_count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Services by type
        $servicesByType = ServiceRecord::whereIn('car_id', $carIds)
            ->join('service_types', 'service_records.service_type_id', '=', 'service_types.id')
            ->select(
                'service_types.name',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(service_records.cost) as total_cost')
            )
            ->groupBy('service_types.name')
            ->orderByDesc('count')
            ->get();

        // Spending by car
        $spendingByCar = ServiceRecord::whereIn('service_records.car_id', $carIds)
            ->join('cars', 'service_records.car_id', '=', 'cars.id')
            ->select(
                DB::raw("CONCAT(cars.brand, ' ', cars.model) as car_name"),
                DB::raw('SUM(service_records.cost) as total_cost'),
                DB::raw('COUNT(*) as service_count')
            )
            ->groupBy('car_name')
            ->orderByDesc('total_cost')
            ->get();

        return response()->json([
            'monthly_spending' => $monthlySpending,
            'services_by_type' => $servicesByType,
            'spending_by_car' => $spendingByCar,
        ]);
    }

    /**
     * Export service records as CSV.
     */
    public function exportCsv(Request $request)
    {
        $user = $request->user();

        $records = ServiceRecord::whereHas('car', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with(['car', 'serviceType'])
            ->latest('service_date')
            ->get();

        $csv = "Car,Service Type,Date,Mileage,Cost,Provider,Notes\n";

        foreach ($records as $record) {
            $car = $record->car ? "{$record->car->brand} {$record->car->model}" : '';
            $type = $record->serviceType ? $record->serviceType->name : '';
            $date = $record->service_date;
            $mileage = $record->mileage_at_service;
            $cost = $record->cost ?? '';
            $provider = str_replace(',', ';', $record->service_provider ?? '');
            $notes = str_replace(',', ';', $record->notes ?? '');

            $csv .= "{$car},{$type},{$date},{$mileage},{$cost},{$provider},{$notes}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="service_records_' . date('Y-m-d') . '.csv"');
    }
}
