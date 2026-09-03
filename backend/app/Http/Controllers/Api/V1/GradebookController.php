<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseBatch;
use App\Services\GradebookCalculationService;
use Illuminate\Http\JsonResponse;

class GradebookController extends Controller
{
    /**
     * Get complete weighted gradebook matrix for a cohort batch.
     */
    public function show(CourseBatch $batch): JsonResponse
    {
        $gradebook = GradebookCalculationService::getBatchGradebook($batch);
        return ApiResponse::success($gradebook);
    }
}
