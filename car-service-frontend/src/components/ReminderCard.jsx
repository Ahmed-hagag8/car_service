import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { apiCall } from '../services/api';
import { parseLocalDate, getDaysRemaining, formatDaysRemaining } from '../utils/dateUtils';

const ReminderCard = ({ reminder, isOverdue, onRefresh }) => {
    const [loading, setLoading] = useState(false);

    const handleMarkComplete = async () => {
        setLoading(true);
        try {
            await apiCall(`/reminders/${reminder.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'completed' })
            });
            onRefresh();
        } catch (error) {
            console.error('Failed to update reminder:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${isOverdue ? 'border-red-500' : 'border-blue-500'
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {isOverdue ? (
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        ) : (
                            <Calendar className="w-6 h-6 text-blue-500" />
                        )}
                        <h3 className="text-xl font-bold text-gray-800">{reminder.service_type?.name}</h3>
                    </div>

                    <div className="ml-9 space-y-1">
                        <p className="text-gray-700">
                            <span className="font-semibold">Car:</span> {reminder.car?.brand} {reminder.car?.model}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Due Date:</span> {reminder.due_date ? parseLocalDate(reminder.due_date).toLocaleDateString() : 'No date set'}
                        </p>
                        {reminder.due_date && (
                            <p className={`font-semibold ${getDaysRemaining(reminder.due_date) < 0 ? 'text-red-600' : getDaysRemaining(reminder.due_date) <= 7 ? 'text-orange-500' : 'text-green-600'}`}>
                                {formatDaysRemaining(getDaysRemaining(reminder.due_date))}
                            </p>
                        )}
                        {reminder.due_mileage && (
                            <p className="text-gray-700">
                                <span className="font-semibold">Due Mileage:</span> {reminder.due_mileage.toLocaleString()} km
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleMarkComplete}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                    {loading ? 'Updating...' : 'Mark Complete'}
                </button>
            </div>
        </div>
    );
};

export default ReminderCard;
