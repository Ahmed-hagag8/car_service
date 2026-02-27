import React, { useState, useEffect } from 'react';
import { Car, LogOut, Menu, X, Settings, Moon, Sun, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiCall } from '../services/api';
import { useToast } from '../components/Toast';
import { useTheme } from '../hooks/useTheme';
import DashboardPage from './DashboardPage';
import CarsPage from './CarsPage';
import RemindersPage from './RemindersPage';
import SettingsPage from './SettingsPage';

const MainLayout = () => {
    const [cars, setCars] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { showToast, ToastComponent } = useToast();
    const { darkMode, toggleTheme } = useTheme();
    const { t, lang, toggleLanguage } = useLanguage();

    // Request browser notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        fetchDashboardData();
    }, []);

    // Check for overdue reminders and show browser notification
    useEffect(() => {
        if (reminders.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
            const overdueCount = reminders.filter(r =>
                r.due_date && new Date(r.due_date) < new Date()
            ).length;

            if (overdueCount > 0) {
                new Notification('Car Service Manager', {
                    body: `You have ${overdueCount} overdue service reminder${overdueCount > 1 ? 's' : ''}!`,
                    icon: '/logo192.png'
                });
            }
        }
    }, [reminders]);

    const fetchDashboardData = async () => {
        try {
            const [carsData, remindersData] = await Promise.all([
                apiCall('/cars?no_paginate=1'),
                apiCall('/reminders?no_paginate=1')
            ]);
            setCars(carsData.data || carsData);
            setReminders(remindersData.data || remindersData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { key: 'dashboard', label: t('dashboard') },
        { key: 'cars', label: t('my_cars') },
        { key: 'reminders', label: t('reminders') },
        { key: 'settings', label: t('settings') },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Car className="w-16 h-16 mx-auto text-blue-600 animate-pulse mb-4" />
                    <p className="text-gray-600">{t('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {ToastComponent}

            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <Car className="w-8 h-8 text-blue-600 mr-3" />
                            <h1 className="text-2xl font-bold text-gray-800">{t('app_name')}</h1>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-600"
                                title="Switch language"
                            >
                                <Globe className="w-4 h-4" />
                                {lang === 'en' ? 'عربي' : 'EN'}
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                                title={darkMode ? 'Light mode' : 'Dark mode'}
                            >
                                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
                            </button>
                            <span className="text-gray-600">{t('welcome')}, {user?.name}!</span>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('logout')}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 md:hidden">
                            <button onClick={toggleLanguage} className="p-2 text-sm font-medium text-gray-600">
                                {lang === 'en' ? 'عربي' : 'EN'}
                            </button>
                            <button onClick={toggleTheme} className="p-2">
                                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
                            </button>
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-200">
                            <p className="text-gray-600 mb-3">{t('welcome')}, {user?.name}!</p>
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('logout')}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveView(item.key)}
                            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${activeView === item.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {item.key === 'settings' && <Settings className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
                            {item.label}
                        </button>
                    ))}
                </div>

                {activeView === 'dashboard' && (
                    <DashboardPage cars={cars} reminders={reminders} />
                )}
                {activeView === 'cars' && (
                    <CarsPage onRefresh={fetchDashboardData} onToast={showToast} />
                )}
                {activeView === 'reminders' && (
                    <RemindersPage onRefresh={fetchDashboardData} onToast={showToast} />
                )}
                {activeView === 'settings' && (
                    <SettingsPage onToast={showToast} />
                )}
            </div>
        </div>
    );
};

export default MainLayout;
