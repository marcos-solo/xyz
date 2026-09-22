<?php

namespace App\Notifications;

use App\Models\CourseFeedback;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class FeedbackSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(public CourseFeedback $feedback) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $studentName = $this->feedback->student?->full_name ?? 'Student';
        $batchName = $this->feedback->batch?->name ?? 'Cohort';
        $periodLabel = ucfirst($this->feedback->period);
        $stars = str_repeat('★', $this->feedback->rating).str_repeat('☆', 5 - $this->feedback->rating);

        return [
            'type' => 'feedback_submitted',
            'title' => "New {$periodLabel} Feedback Received",
            'message' => "{$studentName} submitted {$periodLabel} feedback ({$stars}) for {$batchName}: \"".(Str::limit($this->feedback->comments ?? 'No comment provided', 70)).'"',
            'feedback_id' => $this->feedback->id,
            'feedback_uuid' => $this->feedback->uuid,
            'batch_name' => $batchName,
            'student_name' => $studentName,
            'period' => $this->feedback->period,
            'rating' => $this->feedback->rating,
            'action_url' => '/feedback',
        ];
    }
}
