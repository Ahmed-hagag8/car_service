<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use Illuminate\Http\Request;

class ServiceTypeController extends Controller
{
    /**
     * List all service types, optionally grouped by category.
     */
    public function index(Request $request)
    {
        $serviceTypes = ServiceType::all();

        // Group by category if requested
        if ($request->has('grouped')) {
            $serviceTypes = ServiceType::all()->groupBy('category');
        }

        return response()->json($serviceTypes);
    }
}