<?php

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReminderDueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reminder;

    public function __construct(Reminder $reminder)
    {
        $this->reminder = $reminder;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $car = $this->reminder->car;
        $serviceType = $this->reminder->serviceType;
        $carName = "{$car->brand} {$car->model}";

        return (new MailMessage)
            ->subject("Service Reminder: {$serviceType->name} for {$carName}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your **{$carName}** is due for **{$serviceType->name}**.")
            ->when($this->reminder->due_date, function ($message) {
                $message->line("**Due date:** {$this->reminder->due_date->format('M d, Y')}");
            })
            ->when($this->reminder->due_mileage, function ($message) {
                $message->line("**Due mileage:** {$this->reminder->due_mileage} km");
            })
            ->action('View Details', config('app.frontend_url', 'http://localhost:3000'))
            ->line('Keep your car in top shape!');
    }

    public function toArray($notifiable): array
    {
        return [
            'reminder_id' => $this->reminder->id,
            'car_id' => $this->reminder->car_id,
            'car_name' => "{$this->reminder->car->brand} {$this->reminder->car->model}",
            'service_type' => $this->reminder->serviceType->name,
            'due_date' => $this->reminder->due_date?->toDateString(),
            'due_mileage' => $this->reminder->due_mileage,
            'message' => "{$this->reminder->serviceType->name} due for {$this->reminder->car->brand} {$this->reminder->car->model}",
        ];
    }
}
