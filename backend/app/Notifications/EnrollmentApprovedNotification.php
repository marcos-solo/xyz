<?php

namespace App\Notifications;

use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class EnrollmentApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Enrollment $enrollment,
        public string $customMessage = ''
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $batchName = $this->enrollment->batch?->name ?? 'Cohort';
        $courseName = $this->enrollment->batch?->course?->name ?? 'Course';
        $msg = $this->customMessage ?: "Congratulations! You have been accepted and approved into {$batchName}. Your class schedule, materials, and assessments are now active in your student portal.";

        return [
            'type' => 'enrollment_approved',
            'title' => "Accepted into {$courseName}",
            'message' => $msg,
            'enrollment_number' => $this->enrollment->enrollment_number,
            'course_name' => $courseName,
            'batch_name' => $batchName,
            'action_url' => '/dashboard',
            'batch_id' => $this->enrollment->batch_id,
        ];
    }
}
