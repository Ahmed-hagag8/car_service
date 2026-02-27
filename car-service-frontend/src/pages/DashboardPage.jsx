import React, { useState, useEffect } from 'react';
import { Car, Calendar, AlertCircle, CheckCircle, Download, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { apiCall, API_BASE_URL } from '../services/api';
import { parseLocalDate, getDaysRemaining, formatDaysRemaining } from '../utils/dateUtils';

const CHART_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16'];

const DashboardPage = ({ cars, reminders }) => {
    const [chartData, setChartData] = useState(null);
    const [chartsLoading, setChartsLoading] = useState(true);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            const data = await apiCall('/dashboard/charts');
            setChartData(data);
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
        } finally {
            setChartsLoading(false);
        }
    };

    const handleExportCsv = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/service-records/export/csv`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/csv'
                }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `service_records_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const overdueReminders = reminders.filter(r =>
        r.due_date && parseLocalDate(r.due_date) < new Date()
    );
    const upcomingReminders = reminders.filter(r =>
        r.due_date && parseLocalDate(r.due_date) >= new Date()
    );

    // Format monthly data for the chart
    const monthlyData = chartData?.monthly_spending?.map(item => ({
        month: item.month,
        cost: Number(item.total_cost || 0),
        services: item.service_count
    })) || [];

    const typeData = chartData?.services_by_type?.map(item => ({
        name: item.name,
        value: item.count,
        cost: Number(item.total_cost || 0)
    })) || [];

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                            <p className="text-gray-600 text-sm font-medium">Upcoming</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{upcomingReminders.length}</p>
                        </div>
                        <Calendar className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Overdue</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{overdueReminders.length}</p>
                        </div>
                        <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">
                                ${chartData?.spending_by_car?.reduce((sum, c) => sum + Number(c.total_cost || 0), 0).toFixed(0) || '0'}
                            </p>
                        </div>
                        <BarChart3 className="w-12 h-12 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Charts */}
            {!chartsLoading && chartData && (monthlyData.length > 0 || typeData.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Spending */}
                    {monthlyData.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Spending</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cost']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                    <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Services by Type */}
                    {typeData.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Services by Type</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, value }) => `${name} (${value})`}
                                        labelLine={{ strokeWidth: 1 }}
                                    >
                                        {typeData.map((_, index) => (
                                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* Export Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    <Download className="w-4 h-4" />
                    Export Service Records (CSV)
                </button>
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
