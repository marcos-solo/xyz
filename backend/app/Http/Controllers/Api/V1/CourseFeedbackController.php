<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseBatch;
use App\Models\CourseFeedback;
use App\Models\Enrollment;
use App\Models\User;
use App\Notifications\FeedbackSubmittedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseFeedbackController extends Controller
{
    /**
     * List course feedback submissions (for staff/trainers/managers)
     */
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();

        $query = CourseFeedback::with([
            'student:id,uuid,first_name,last_name,email',
            'batch:id,uuid,name,code,course_id',
            'trainer:id,uuid,first_name,last_name,email',
        ]);

        if ($authUser->hasRole('Trainer') && ! $authUser->can('branches.view-all-branches')) {
            $query->where(function ($q) use ($authUser) {
                $q->where('trainer_id', $authUser->id)
                    ->orWhereHas('batch.trainers', fn ($tq) => $tq->where('users.id', $authUser->id));
            });
        } elseif ($authUser->hasRole('Student')) {
            $query->where('student_id', $authUser->id);
        } elseif ($authUser->hasRole('Branch Manager') && $authUser->branch_id) {
            $query->whereHas('batch', fn ($bq) => $bq->where('branch_id', $authUser->branch_id));
        }

        if ($request->filled('batch_id')) {
            $query->where('batch_id', $request->batch_id);
        }

        if ($request->filled('period')) {
            $query->where('period', $request->period);
        }

        if ($request->filled('unit_code')) {
            $query->where('unit_code', $request->unit_code);
        }

        $feedbacks = $query->latest()->paginate(25);

        $avgRating = (clone $query)->avg('rating') ?? 5.0;
        $totalCount = (clone $query)->count();

        return ApiResponse::success([
            'feedbacks' => $feedbacks->items(),
            'stats' => [
                'total' => $totalCount,
                'average_rating' => round((float) $avgRating, 2),
            ],
        ], 'Feedback retrieved.', 200, [
            'current_page' => $feedbacks->currentPage(),
            'last_page' => $feedbacks->lastPage(),
            'per_page' => $feedbacks->perPage(),
            'total' => $feedbacks->total(),
        ]);
    }

    /**
     * Store student feedback submission.
     */
    public function store(Request $request): JsonResponse
    {
        $student = $request->user();

        $validated = $request->validate([
            'batch_id' => ['required_without:batch_uuid', 'nullable', 'integer', 'exists:course_batches,id'],
            'batch_uuid' => ['required_without:batch_id', 'nullable', 'string', 'exists:course_batches,uuid'],
            'period' => ['nullable', 'string', 'in:beginning,middle,exit,lesson,general'],
            'unit_code' => ['nullable', 'string', 'max:20'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'category' => ['nullable', 'string', 'max:100'],
            'comments' => ['nullable', 'string', 'max:2000'],
            'metrics' => ['nullable', 'array'],
        ]);

        $batch = null;
        if (! empty($validated['batch_id'])) {
            $batch = CourseBatch::find($validated['batch_id']);
        } elseif (! empty($validated['batch_uuid'])) {
            $batch = CourseBatch::where('uuid', $validated['batch_uuid'])->first();
        }

        if (! $batch) {
            return ApiResponse::error('Cohort / Batch not found.', 404);
        }

        // Verify student enrollment in batch
        $isEnrolled = Enrollment::where('student_id', $student->id)
            ->where('batch_id', $batch->id)
            ->whereIn('status', ['Active', 'Completed', 'Pending'])
            ->exists();

        if (! $isEnrolled && ! $student->hasRole(['Super Admin', 'Trainer'])) {
            return ApiResponse::forbidden('You must be enrolled in this cohort to submit feedback.');
        }

        // Determine trainer to associate with feedback
        $trainer = $batch->trainers()->first();

        $feedback = CourseFeedback::create([
            'batch_id' => $batch->id,
            'student_id' => $student->id,
            'trainer_id' => $trainer?->id,
            'unit_code' => $validated['unit_code'] ?? null,
            'period' => $validated['period'] ?? 'general',
            'rating' => $validated['rating'],
            'category' => $validated['category'] ?? 'Course Delivery',
            'comments' => $validated['comments'] ?? null,
            'metrics' => $validated['metrics'] ?? null,
            'status' => 'submitted',
        ]);

        // Notify Lead Trainer, Academic Manager, Branch Manager, and Admins
        $recipients = collect();

        // 1. Batch trainers
        foreach ($batch->trainers as $t) {
            $recipients->push($t);
        }

        // 2. Academic Manager
        $academicManagers = User::role('Academic Manager')->get();
        foreach ($academicManagers as $am) {
            $recipients->push($am);
        }

        // 3. Branch Manager of the batch's branch
        if ($batch->branch_id) {
            $branchManagers = User::role('Branch Manager')->where('branch_id', $batch->branch_id)->get();
            foreach ($branchManagers as $bm) {
                $recipients->push($bm);
            }
        }

        // 4. Super Admin
        $superAdmins = User::role('Super Admin')->get();
        foreach ($superAdmins as $sa) {
            $recipients->push($sa);
        }

        $uniqueRecipients = $recipients->unique('id');
        foreach ($uniqueRecipients as $recipient) {
            $recipient->notify(new FeedbackSubmittedNotification($feedback));
        }

        return ApiResponse::success(
            $feedback->load(['batch', 'trainer', 'student']),
            'Thank you! Your feedback has been submitted and shared with academic management and trainers.',
            201
        );
    }
}
