import React, { useState, useEffect } from 'react';
import { Car, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../services/api';
import { useToast } from '../components/Toast';
import DashboardPage from './DashboardPage';
import CarsPage from './CarsPage';
import RemindersPage from './RemindersPage';

const MainLayout = () => {
    const [cars, setCars] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Fetch non-paginated data for the dashboard stats
    const fetchDashboardData = async () => {
        try {
            const [carsData, remindersData] = await Promise.all([
                apiCall('/cars?no_paginate=1'),
                apiCall('/reminders?no_paginate=1')
            ]);
            setCars(carsData);
            setReminders(remindersData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Car className="w-16 h-16 mx-auto text-blue-600 animate-pulse mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {ToastComponent}

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <Car className="w-8 h-8 text-blue-600 mr-3" />
                            <h1 className="text-2xl font-bold text-gray-800">Car Service Manager</h1>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <span className="text-gray-600">Welcome, {user?.name}!</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-200">
                            <p className="text-gray-600 mb-3">Welcome, {user?.name}!</p>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {['dashboard', 'cars', 'reminders'].map(view => (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${activeView === view
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {view === 'dashboard' ? 'Dashboard' : view === 'cars' ? 'My Cars' : 'Reminders'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeView === 'dashboard' && (
                    <DashboardPage cars={cars} reminders={reminders} />
                )}
                {activeView === 'cars' && (
                    <CarsPage onRefresh={fetchDashboardData} onToast={showToast} />
                )}
                {activeView === 'reminders' && (
                    <RemindersPage onRefresh={fetchDashboardData} onToast={showToast} />
                )}
            </div>
        </div>
    );
};

export default MainLayout;
