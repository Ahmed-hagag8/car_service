import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { apiCall } from '../services/api';
import { parseLocalDate } from '../utils/dateUtils';
import ReminderCard from '../components/ReminderCard';
import Pagination from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';

const RemindersPage = ({ onRefresh, onToast }) => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const { t } = useLanguage();

    const fetchReminders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiCall(`/reminders?page=${page}`);
            setReminders(data.data);
            setPagination({
                currentPage: data.current_page, lastPage: data.last_page,
                total: data.total, perPage: data.per_page
            });
        } catch (error) {
            console.error('Failed to fetch reminders:', error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchReminders(); }, [fetchReminders]);
    const handleRefresh = () => { fetchReminders(); onRefresh(); };

    const overdueReminders = reminders.filter(r => r.due_date && parseLocalDate(r.due_date) < new Date());
    const upcomingReminders = reminders.filter(r => r.due_date && parseLocalDate(r.due_date) >= new Date());

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Calendar className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>
        );
    }

    return (
        <div>
            {overdueReminders.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">{t('overdue_services')}</h2>
                    <div className="space-y-4">
                        {overdueReminders.map(reminder => (
                            <ReminderCard key={reminder.id} reminder={reminder} isOverdue={true} onRefresh={handleRefresh} onToast={onToast} />
                        ))}
                    </div>
                </div>
            )}

            {upcomingReminders.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('upcoming_services')}</h2>
                    <div className="space-y-4">
                        {upcomingReminders.map(reminder => (
                            <ReminderCard key={reminder.id} reminder={reminder} isOverdue={false} onRefresh={handleRefresh} onToast={onToast} />
                        ))}
                    </div>
                </div>
            )}

            {reminders.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t('no_reminders_yet')}</h3>
                    <p className="text-gray-600 mb-6">{t('reminders_auto_created')}</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                        <p className="text-sm text-gray-700 mb-2">
                            <span className="font-semibold">{t('to_create_reminders')}</span>
                        </p>
                        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                            <li>{t('step_add_car')}</li>
                            <li>{t('step_click_car')}</li>
                            <li>{t('step_add_service')}</li>
                            <li>{t('step_auto_calc')}</li>
                        </ol>
                    </div>
                </div>
            )}

            {pagination && (
                <Pagination currentPage={pagination.currentPage} lastPage={pagination.lastPage}
                    total={pagination.total} perPage={pagination.perPage} onPageChange={setPage} />
            )}
        </div>
    );
};

export default RemindersPage;
