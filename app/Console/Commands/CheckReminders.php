<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Notifications\ReminderDueNotification;
use Illuminate\Console\Command;

class CheckReminders extends Command
{
    protected $signature = 'reminders:check';
    protected $description = 'Check for overdue or upcoming reminders and send notifications';

    public function handle(): int
    {
        $this->info('Checking reminders...');

        // Find overdue reminders that haven't been notified today
        $overdueReminders = Reminder::where('status', 'pending')
            ->where('due_date', '<', now())
            ->where(function ($query) {
                $query->whereNull('last_notified_at')
                    ->orWhere('last_notified_at', '<', now()->subDay());
            })
            ->with(['car.user', 'serviceType'])
            ->get();

        // Find reminders due within 3 days
        $upcomingReminders = Reminder::where('status', 'pending')
            ->whereBetween('due_date', [now(), now()->addDays(3)])
            ->where(function ($query) {
                $query->whereNull('last_notified_at')
                    ->orWhere('last_notified_at', '<', now()->subDay());
            })
            ->with(['car.user', 'serviceType'])
            ->get();

        $allReminders = $overdueReminders->merge($upcomingReminders)->unique('id');
        $count = 0;

        foreach ($allReminders as $reminder) {
            $user = $reminder->car->user;

            if ($user) {
                $user->notify(new ReminderDueNotification($reminder));
                $reminder->update(['last_notified_at' => now()]);
                $count++;

                $this->line("  → Notified {$user->name} about {$reminder->serviceType->name} for {$reminder->car->brand} {$reminder->car->model}");
            }
        }

        $this->info("Done! Sent {$count} notification(s).");
        return Command::SUCCESS;
    }
}
