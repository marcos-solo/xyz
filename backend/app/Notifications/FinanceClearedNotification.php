<?php

namespace App\Notifications;

use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FinanceClearedNotification extends Notification
{
    use Queueable;

    public function __construct(public Enrollment $enrollment) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'finance_cleared',
            'title' => 'Enrollment approved',
            'message' => 'Your finance approval is complete. You can now prepare to begin training.',
            'enrollment_number' => $this->enrollment->enrollment_number,
            'course_name' => $this->enrollment->batch?->course?->name,
            'action_url' => '/dashboard',
        ];
    }
}
