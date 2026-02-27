import React, { useState } from 'react';
import './App.css';
import { Car } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import InstallPWA from './components/InstallPWA';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MainLayout from './pages/MainLayout';

const AuthContent = ({ authView, setAuthView }) => {
  const { user, loading } = useAuth();

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

  if (!user) {
    switch (authView) {
      case 'register':
        return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
      case 'forgot':
        return <ForgotPasswordPage onSwitchToLogin={() => setAuthView('login')} />;
      case 'reset':
        return <ResetPasswordPage onSwitchToLogin={() => setAuthView('login')} />;
      default:
        return (
          <LoginPage
            onSwitchToRegister={() => setAuthView('register')}
            onSwitchToForgot={() => setAuthView('forgot')}
          />
        );
    }
  }

  return <MainLayout />;
};

const App = () => {
  const [authView, setAuthView] = useState('login');

  return (
    <LanguageProvider>
      <AuthProvider>
        <InstallPWA />
        <AuthContent authView={authView} setAuthView={setAuthView} />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;