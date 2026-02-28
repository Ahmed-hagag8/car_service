import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { apiCall } from '../services/api';
import { parseLocalDate, getDaysRemaining, formatDaysRemaining, formatDate } from '../utils/dateUtils';
import { useLanguage } from '../context/LanguageContext';

const ReminderCard = ({ reminder, isOverdue, onRefresh, onToast }) => {
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleUpdateStatus = async (status) => {
        setLoading(true);
        try {
            await apiCall(`/reminders/${reminder.id}`, { method: 'PUT', body: JSON.stringify({ status }) });
            onToast(status === 'completed' ? t('reminder_completed') : t('reminder_dismissed'));
            onRefresh();
        } catch (error) {
            onToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${isOverdue ? 'border-red-500' : 'border-blue-500'}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {isOverdue ? <AlertCircle className="w-6 h-6 text-red-500" /> : <Calendar className="w-6 h-6 text-blue-500" />}
                        <h3 className="text-xl font-bold text-gray-800">{t(reminder.service_type?.name) || reminder.service_type?.name}</h3>
                    </div>
                    <div className="ml-9 space-y-1">
                        <p className="text-gray-700">
                            <span className="font-semibold">{t('car_label')}:</span> {reminder.car?.brand} {reminder.car?.model}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">{t('due_date')}:</span> {reminder.due_date ? formatDate(reminder.due_date) : t('no_date_set')}
                        </p>
                        {reminder.due_date && (
                            <p className={`font-semibold ${getDaysRemaining(reminder.due_date) < 0 ? 'text-red-600' : getDaysRemaining(reminder.due_date) <= 7 ? 'text-orange-500' : 'text-green-600'}`}>
                                {formatDaysRemaining(getDaysRemaining(reminder.due_date), t)}
                            </p>
                        )}
                        {reminder.due_mileage && (
                            <p className="text-gray-700">
                                <span className="font-semibold">{t('due_mileage')}:</span> {reminder.due_mileage.toLocaleString()} km
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => handleUpdateStatus('completed')} disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-semibold">
                        {loading ? t('updating') : t('mark_complete')}
                    </button>
                    <button onClick={() => handleUpdateStatus('dismissed')} disabled={loading}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 text-sm font-semibold">
                        {t('dismiss')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderCard;
