import React, { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SettingsPage = ({ onToast }) => {
    const { user, refreshUser } = useAuth();
    const { t } = useLanguage();

    const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
    const [profileLoading, setProfileLoading] = useState(false);

    const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileUpdate = async () => {
        if (!profile.name || !profile.email) {
            onToast(t('fill_all_fields'), 'error');
            return;
        }
        setProfileLoading(true);
        try {
            await apiCall('/user/profile', { method: 'PUT', body: JSON.stringify(profile) });
            onToast(t('profile_updated'));
            if (refreshUser) refreshUser();
        } catch (err) {
            onToast(err.message, 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwords.current_password || !passwords.password || !passwords.password_confirmation) {
            onToast(t('fill_all_password_fields'), 'error');
            return;
        }
        if (passwords.password.length < 8) {
            onToast(t('new_password_min_8'), 'error');
            return;
        }
        if (passwords.password !== passwords.password_confirmation) {
            onToast(t('new_passwords_not_match'), 'error');
            return;
        }
        setPasswordLoading(true);
        try {
            await apiCall('/user/password', { method: 'PUT', body: JSON.stringify(passwords) });
            onToast(t('password_changed'));
            setPasswords({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            onToast(err.message, 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">{t('profile_info')}</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('name')}</label>
                        <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('email')}</label>
                        <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={handleProfileUpdate} disabled={profileLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                        <Save className="w-4 h-4" />
                        {profileLoading ? t('saving') : t('save_changes')}
                    </button>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">{t('change_password')}</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('current_password')}</label>
                        <input type="password" value={passwords.current_password}
                            onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('new_password')}</label>
                        <input type="password" value={passwords.password}
                            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('confirm_new_password')}</label>
                        <input type="password" value={passwords.password_confirmation}
                            onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                    </div>
                    <button onClick={handlePasswordChange} disabled={passwordLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                        <Lock className="w-4 h-4" />
                        {passwordLoading ? t('changing') : t('change_password')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
