import React, { useState } from 'react';
import { Car } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import InstallPWA from './components/InstallPWA';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  return <MainLayout />;
};

const App = () => {
  const [authView, setAuthView] = useState('login');

  return (
    <AuthProvider>
      <InstallPWA />
      <AuthContent authView={authView} setAuthView={setAuthView} />
    </AuthProvider>
  );
};

export default App;