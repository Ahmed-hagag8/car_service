import React, { useState } from 'react';
import { Car, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RegisterPage = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { t, lang, toggleLanguage } = useLanguage();

    const handleSubmit = async () => {
        if (!name || !email || !password || !passwordConfirmation) {
            setError(t('fill_all_fields'));
            return;
        }
        if (password.length < 8) {
            setError(t('password_min_8'));
            return;
        }
        if (password !== passwordConfirmation) {
            setError(t('passwords_not_match'));
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, passwordConfirmation);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 relative">
            <button onClick={toggleLanguage}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition text-sm font-medium">
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'عربي' : 'EN'}
            </button>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <Car className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">{t('create_account')}</h1>
                    <p className="text-gray-600 mt-2">{t('start_managing')}</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('name')}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('email')}</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('password')}</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">{t('confirm_password')}</label>
                        <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                    </div>

                    <button onClick={handleSubmit} disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                        {loading ? t('creating_account') : t('create_account')}
                    </button>
                </div>

                <p className="text-center mt-6 text-gray-600">
                    {t('already_have_account')}{' '}
                    <button onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:underline">
                        {t('login')}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
