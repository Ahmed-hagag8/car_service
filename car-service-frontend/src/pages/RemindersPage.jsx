import React from 'react';
import { Calendar } from 'lucide-react';
import { parseLocalDate } from '../utils/dateUtils';
import ReminderCard from '../components/ReminderCard';

const RemindersPage = ({ reminders, onRefresh, onToast }) => {
    const overdueReminders = reminders.filter(r =>
        r.due_date && parseLocalDate(r.due_date) < new Date()
    );
    const upcomingReminders = reminders.filter(r =>
        r.due_date && parseLocalDate(r.due_date) >= new Date()
    );

    return (
        <div>
            {overdueReminders.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Overdue Services</h2>
                    <div className="space-y-4">
                        {overdueReminders.map(reminder => (
                            <ReminderCard key={reminder.id} reminder={reminder} isOverdue={true} onRefresh={onRefresh} onToast={onToast} />
                        ))}
                    </div>
                </div>
            )}

            {upcomingReminders.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Services</h2>
                    <div className="space-y-4">
                        {upcomingReminders.map(reminder => (
                            <ReminderCard key={reminder.id} reminder={reminder} isOverdue={false} onRefresh={onRefresh} onToast={onToast} />
                        ))}
                    </div>
                </div>
            )}

            {reminders.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Reminders Yet</h3>
                    <p className="text-gray-600 mb-6">Reminders are created automatically when you add service records</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold">To create reminders:</span>
                        </p>
                        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                            <li>Add a car from "My Cars" tab</li>
                            <li>Click on the car to open details</li>
                            <li>Add a service record (e.g., Oil Change)</li>
                            <li>The system will automatically calculate the next service date</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemindersPage;
