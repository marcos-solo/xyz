<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Assessment;
use App\Models\AssessmentOption;
use App\Models\AssessmentQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssessmentQuestionController extends Controller
{
    public function store(Request $request, Assessment $assessment): JsonResponse
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'in:Multiple Choice,Multiple Select,True/False,Short Answer,Essay,Practical/Manual Grading'],
            'marks' => ['required', 'numeric', 'min:0.5'],
            'explanation' => ['nullable', 'string'],
            'difficulty' => ['nullable', 'in:Easy,Medium,Hard'],
            'order' => ['nullable', 'integer'],
            'options' => ['nullable', 'array'],
            'options.*.option_text' => ['required_with:options', 'string'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
        ]);

        $maxOrder = $assessment->questions()->max('order') ?? 0;

        $question = DB::transaction(function () use ($assessment, $validated, $maxOrder) {
            $q = AssessmentQuestion::create([
                'assessment_id' => $assessment->id,
                'question_text' => $validated['question_text'],
                'question_type' => $validated['question_type'],
                'marks' => $validated['marks'],
                'explanation' => $validated['explanation'] ?? null,
                'difficulty' => $validated['difficulty'] ?? 'Medium',
                'order' => $validated['order'] ?? ($maxOrder + 1),
            ]);

            if (!empty($validated['options'])) {
                foreach ($validated['options'] as $idx => $opt) {
                    AssessmentOption::create([
                        'question_id' => $q->id,
                        'option_text' => $opt['option_text'],
                        'is_correct' => $opt['is_correct'] ?? false,
                        'order' => $idx + 1,
                    ]);
                }
            }

            return $q;
        });

        return ApiResponse::success($question->load('options'), 'Question added successfully.', 201);
    }

    public function update(Request $request, AssessmentQuestion $question): JsonResponse
    {
        $validated = $request->validate([
            'question_text' => ['sometimes', 'required', 'string'],
            'question_type' => ['sometimes', 'required', 'in:Multiple Choice,Multiple Select,True/False,Short Answer,Essay,Practical/Manual Grading'],
            'marks' => ['sometimes', 'required', 'numeric', 'min:0.5'],
            'explanation' => ['nullable', 'string'],
            'difficulty' => ['nullable', 'in:Easy,Medium,Hard'],
            'options' => ['nullable', 'array'],
            'options.*.option_text' => ['required_with:options', 'string'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
        ]);

        DB::transaction(function () use ($question, $validated) {
            $question->update(collect($validated)->except('options')->toArray());

            if (isset($validated['options'])) {
                $question->options()->delete();
                foreach ($validated['options'] as $idx => $opt) {
                    AssessmentOption::create([
                        'question_id' => $question->id,
                        'option_text' => $opt['option_text'],
                        'is_correct' => $opt['is_correct'] ?? false,
                        'order' => $idx + 1,
                    ]);
                }
            }
        });

        return ApiResponse::success($question->load('options'), 'Question updated successfully.');
    }

    public function destroy(AssessmentQuestion $question): JsonResponse
    {
        $question->delete();
        return ApiResponse::success(null, 'Question deleted.');
    }
}
