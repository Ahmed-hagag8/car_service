import React from 'react';
import { Car, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { parseLocalDate, getDaysRemaining, formatDaysRemaining } from '../utils/dateUtils';

const DashboardPage = ({ cars, reminders }) => {
    const overdueReminders = reminders.filter(r =>
        r.due_date && parseLocalDate(r.due_date) < new Date()
    );
    const upcomingReminders = reminders.filter(r =>
        r.due_date && parseLocalDate(r.due_date) >= new Date()
    );

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Cars</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{cars.length}</p>
                        </div>
                        <Car className="w-12 h-12 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Upcoming Services</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{upcomingReminders.length}</p>
                        </div>
                        <Calendar className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Overdue Services</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{overdueReminders.length}</p>
                        </div>
                        <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Recent Reminders */}
            {reminders.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Reminders</h2>
                    <div className="space-y-3">
                        {reminders.slice(0, 5).map(reminder => (
                            <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {reminder.due_date && parseLocalDate(reminder.due_date) < new Date() ? (
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-800">{reminder.service_type?.name}</p>
                                        <p className="text-sm text-gray-600">{reminder.car?.brand} {reminder.car?.model}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-medium ${reminder.due_date && getDaysRemaining(reminder.due_date) < 0 ? 'text-red-600' : reminder.due_date && getDaysRemaining(reminder.due_date) <= 7 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {reminder.due_date ? formatDaysRemaining(getDaysRemaining(reminder.due_date)) : 'No date set'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {reminder.due_date ? parseLocalDate(reminder.due_date).toLocaleDateString() : ''}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {reminder.due_mileage ? `${reminder.due_mileage.toLocaleString()} km` : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {reminders.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
                    <p className="text-gray-600">No pending service reminders</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
