import React, { useState, useEffect } from 'react';
import { Car, Calendar, AlertCircle, CheckCircle, Download, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiCall } from '../services/api';
import { parseLocalDate, getDaysRemaining, formatDaysRemaining, formatDate } from '../utils/dateUtils';
import { useLanguage } from '../context/LanguageContext';

const CHART_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16'];

const DashboardPage = ({ cars, reminders }) => {
    const [chartData, setChartData] = useState(null);
    const [chartsLoading, setChartsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => { fetchChartData(); }, []);

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

    const handleExportPdf = async () => {
        try {
            const records = await apiCall('/service-records?no_paginate=1');
            const data = Array.isArray(records) ? records : (records.data || []);

            const { default: jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.setTextColor(37, 99, 235);
            doc.text('Car Service Manager', 14, 20);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`${t('export_pdf')} - ${formatDate(new Date())}`, 14, 28);

            // Table
            const tableData = data.map(r => [
                r.car ? `${r.car.brand} ${r.car.model}` : '',
                r.service_type?.name || r.service_type || '',
                r.service_date || '',
                r.mileage_at_service ? r.mileage_at_service.toLocaleString() : '',
                r.cost ? `$${Number(r.cost).toFixed(2)}` : '',
                r.service_provider || ''
            ]);

            autoTable(doc, {
                startY: 34,
                head: [[t('car_label'), t('service_type'), t('service_date'), t('mileage'), t('cost'), t('provider')]],
                body: tableData,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [37, 99, 235], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
            });

            doc.save(`service_records_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const overdueReminders = reminders.filter(r => r.due_date && parseLocalDate(r.due_date) < new Date());
    const upcomingReminders = reminders.filter(r => r.due_date && parseLocalDate(r.due_date) >= new Date());

    const monthlyData = chartData?.monthly_spending?.map(item => ({
        month: item.month, cost: Number(item.total_cost || 0), services: item.service_count
    })) || [];

    const typeData = chartData?.services_by_type?.map(item => ({
        name: t(item.name) || item.name, value: item.count, cost: Number(item.total_cost || 0)
    })) || [];

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">{t('total_cars')}</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{cars.length}</p>
                        </div>
                        <Car className="w-12 h-12 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">{t('upcoming')}</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{upcomingReminders.length}</p>
                        </div>
                        <Calendar className="w-12 h-12 text-green-600" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">{t('overdue')}</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{overdueReminders.length}</p>
                        </div>
                        <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">{t('total_spent')}</p>
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
                    {monthlyData.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('monthly_spending')}</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, t('cost')]} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                    <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {typeData.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('services_by_type')}</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={typeData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                                        label={({ name, value }) => `${name} (${value})`} labelLine={{ strokeWidth: 1 }}>
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
                <button onClick={handleExportPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <Download className="w-4 h-4" />
                    {t('export_pdf')}
                </button>
            </div>

            {/* Recent Reminders */}
            {reminders.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('recent_reminders')}</h2>
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
                                        <p className="font-semibold text-gray-800">{t(reminder.service_type?.name) || reminder.service_type?.name}</p>
                                        <p className="text-sm text-gray-600">{reminder.car?.brand} {reminder.car?.model}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-medium ${reminder.due_date && getDaysRemaining(reminder.due_date) < 0 ? 'text-red-600' : reminder.due_date && getDaysRemaining(reminder.due_date) <= 7 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {reminder.due_date ? formatDaysRemaining(getDaysRemaining(reminder.due_date), t) : t('no_date_set')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {reminder.due_date ? formatDate(reminder.due_date) : ''}
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
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t('all_caught_up')}</h3>
                    <p className="text-gray-600">{t('no_pending_reminders')}</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
