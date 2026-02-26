<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use Illuminate\Http\Request;

class ServiceTypeController extends Controller
{
    // عرض كل أنواع الخدمات
    public function index(Request $request)
    {
        $serviceTypes = ServiceType::all();

        // لو عايز تصنفهم حسب الـ category
        if ($request->has('grouped')) {
            $serviceTypes = ServiceType::all()->groupBy('category');
        }

        return response()->json($serviceTypes);
    }
}