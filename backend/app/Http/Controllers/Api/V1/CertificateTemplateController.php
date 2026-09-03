<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CertificateTemplate;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        return ApiResponse::success(CertificateTemplate::all());
    }

    public function store(Request $request): JsonResponse
    {
        $org = Organization::first();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'signatory_name' => ['required', 'string', 'max:255'],
            'signatory_title' => ['required', 'string', 'max:255'],
            'requirements_config' => ['required', 'array'],
        ]);

        $template = CertificateTemplate::create(array_merge($validated, [
            'organization_id' => $org->id,
            'is_active' => true,
        ]));

        return ApiResponse::success($template, 'Certificate template created.', 201);
    }
}
