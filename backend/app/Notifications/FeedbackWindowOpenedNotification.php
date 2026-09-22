<?php

namespace App\Notifications;

use App\Models\CourseBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FeedbackWindowOpenedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public CourseBatch $batch,
        public string $period, // beginning, middle, exit
        public string $dueDate
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $periodTitle = ucfirst($this->period).' Feedback Window Open';
        $batchName = $this->batch->name;

        return [
            'type' => 'feedback_window_open',
            'title' => $periodTitle,
            'message' => "The {$this->period} feedback collection for {$batchName} is now active (Target date: {$this->dueDate}). Your feedback ensures continuous academic quality.",
            'batch_id' => $this->batch->id,
            'batch_name' => $batchName,
            'period' => $this->period,
            'due_date' => $this->dueDate,
            'action_url' => '/dashboard',
        ];
    }
}
