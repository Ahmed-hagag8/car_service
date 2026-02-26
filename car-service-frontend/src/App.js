import React, { useState, useEffect, createContext, useContext } from 'react';
import { Camera, Car, Plus, Calendar, DollarSign, AlertCircle, CheckCircle, Settings, LogOut, Menu, X } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, passwordConfirmation) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// API Helper
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = 'API call failed';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `Server error (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Login Page
const LoginPage = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Car className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Car Service Manager</h1>
          <p className="text-gray-600 mt-2">Track your car maintenance easily</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} className="text-blue-600 font-semibold hover:underline">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Car className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Start managing your car services</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-blue-600 font-semibold hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

// Dashboard
const Dashboard = () => {
  const [cars, setCars] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCar, setSelectedCar] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsData, remindersData] = await Promise.all([
        apiCall('/cars'),
        apiCall('/reminders')
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
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${activeView === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('cars')}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${activeView === 'cars'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            My Cars
          </button>
          <button
            onClick={() => setActiveView('reminders')}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${activeView === 'reminders'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            Reminders
          </button>
        </div>

        {/* Content */}
        {activeView === 'dashboard' && (
          <DashboardView cars={cars} reminders={reminders} onRefresh={fetchData} />
        )}
        {activeView === 'cars' && (
          <CarsView cars={cars} onRefresh={fetchData} onSelectCar={setSelectedCar} />
        )}
        {activeView === 'reminders' && (
          <RemindersView reminders={reminders} onRefresh={fetchData} />
        )}
      </div>
    </div>
  );
};

// Dashboard View
const DashboardView = ({ cars, reminders }) => {
  const overdueReminders = reminders.filter(r =>
    r.due_date && new Date(r.due_date) < new Date()
  );
  const upcomingReminders = reminders.filter(r =>
    r.due_date && new Date(r.due_date) >= new Date()
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
                  {reminder.due_date && new Date(reminder.due_date) < new Date() ? (
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
                  <p className="text-sm font-medium text-gray-700">
                    {reminder.due_date ? new Date(reminder.due_date).toLocaleDateString() : 'No date set'}
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

// Cars View
const CarsView = ({ cars, onRefresh }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Cars</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Car
        </button>
      </div>

      {showAddForm && (
        <AddCarForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); onRefresh(); }} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map(car => (
          <CarCard key={car.id} car={car} onRefresh={onRefresh} />
        ))}
      </div>

      {cars.length === 0 && !showAddForm && (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Cars Yet</h3>
          <p className="text-gray-600 mb-6">Add your first car to start tracking services</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Your First Car
          </button>
        </div>
      )}
    </div>
  );
};

// Car Card
const CarCard = ({ car, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (showDetails && !stats) {
      fetchStats();
    }
  }, [showDetails]);

  const fetchStats = async () => {
    try {
      const data = await apiCall(`/cars/${car.id}/stats`);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition cursor-pointer" onClick={() => setShowDetails(true)}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{car.brand} {car.model}</h3>
            <p className="text-gray-600">{car.year}</p>
          </div>
          <Car className="w-8 h-8 text-blue-600" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mileage:</span>
            <span className="font-semibold text-gray-800">{car.current_mileage?.toLocaleString()} km</span>
          </div>
          {car.plate_number && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plate:</span>
              <span className="font-semibold text-gray-800">{car.plate_number}</span>
            </div>
          )}
        </div>
      </div>

      {showDetails && (
        <CarDetailsModal car={car} stats={stats} onClose={() => setShowDetails(false)} onRefresh={onRefresh} />
      )}
    </>
  );
};

// Car Details Modal
const CarDetailsModal = ({ car, stats, onClose, onRefresh }) => {
  const [showAddService, setShowAddService] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{car.brand} {car.model}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  ${Number(stats.statistics.total_cost || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Services Done</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats.statistics.service_count}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Avg Cost</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  ${Number(stats.statistics.average_cost || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Add Service Button */}
          <button
            onClick={() => setShowAddService(true)}
            className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Service Record
          </button>

          {showAddService && (
            <AddServiceForm
              carId={car.id}
              onClose={() => setShowAddService(false)}
              onSuccess={() => {
                setShowAddService(false);
                onRefresh();
                onClose();
              }}
            />
          )}

          {/* Recent Services */}
          {stats?.recent_services && stats.recent_services.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Services</h3>
              <div className="space-y-3">
                {stats.recent_services.map(service => (
                  <div key={service.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{service.service_type?.name}</h4>
                      {service.cost && (
                        <span className="text-sm font-medium text-gray-600">
                          ${Number(service.cost).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Date: {new Date(service.service_date).toLocaleDateString()}</p>
                      <p>Mileage: {service.mileage_at_service?.toLocaleString()} km</p>
                      {service.service_provider && <p>Provider: {service.service_provider}</p>}
                      {service.notes && <p className="italic">Notes: {service.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Car Form
const AddCarForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    current_mileage: 0,
    plate_number: '',
    color: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.brand || !formData.model) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiCall('/cars', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Car</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Make *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Toyota"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Camry"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Year *</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Current Mileage (km) *</label>
            <input
              type="number"
              value={formData.current_mileage}
              onChange={(e) => setFormData({ ...formData, current_mileage: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Plate Number</label>
            <input
              type="text"
              value={formData.plate_number}
              onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABC123"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Black"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Car'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Service Form
const AddServiceForm = ({ carId, onClose, onSuccess }) => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [formData, setFormData] = useState({
    car_id: carId,
    service_type_id: '',
    service_date: new Date().toISOString().split('T')[0],
    mileage_at_service: 0,
    cost: '',
    notes: '',
    service_provider: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      const data = await apiCall('/service-types');
      setServiceTypes(data);
    } catch (error) {
      console.error('Failed to fetch service types:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.service_type_id || !formData.service_date || !formData.mileage_at_service) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiCall('/service-records', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Add Service Record</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Service Type *</label>
            <select
              value={formData.service_type_id}
              onChange={(e) => setFormData({ ...formData, service_type_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select service type</option>
              {serviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Service Date *</label>
            <input
              type="date"
              value={formData.service_date}
              onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Mileage (km) *</label>
            <input
              type="number"
              value={formData.mileage_at_service}
              onChange={(e) => setFormData({ ...formData, mileage_at_service: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Cost</label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Service Provider</label>
            <input
              type="text"
              value={formData.service_provider}
              onChange={(e) => setFormData({ ...formData, service_provider: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Workshop name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Service'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Reminders View
const RemindersView = ({ reminders, onRefresh }) => {
  const overdueReminders = reminders.filter(r =>
    r.due_date && new Date(r.due_date) < new Date()
  );
  const upcomingReminders = reminders.filter(r =>
    r.due_date && new Date(r.due_date) >= new Date()
  );

  return (
    <div>
      {overdueReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Overdue Services</h2>
          <div className="space-y-4">
            {overdueReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} isOverdue={true} onRefresh={onRefresh} />
            ))}
          </div>
        </div>
      )}

      {upcomingReminders.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Services</h2>
          <div className="space-y-4">
            {upcomingReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} isOverdue={false} onRefresh={onRefresh} />
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Reminders Yet</h3>
          <p className="text-gray-600 mb-6">Reminders are created automatically when you add service records</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">To create reminders:</span>
            </p>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Add a car from "My Cars" tab</li>
              <li>Click on the car to open details</li>
              <li>Add a service record (e.g., Oil Change)</li>
              <li>The system will automatically calculate the next service date</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

// Reminder Card
const ReminderCard = ({ reminder, isOverdue, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const handleMarkComplete = async () => {
    setLoading(true);
    try {
      await apiCall(`/reminders/${reminder.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' })
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to update reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${isOverdue ? 'border-red-500' : 'border-blue-500'
      }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {isOverdue ? (
              <AlertCircle className="w-6 h-6 text-red-500" />
            ) : (
              <Calendar className="w-6 h-6 text-blue-500" />
            )}
            <h3 className="text-xl font-bold text-gray-800">{reminder.service_type?.name}</h3>
          </div>

          <div className="ml-9 space-y-1">
            <p className="text-gray-700">
              <span className="font-semibold">Car:</span> {reminder.car?.brand} {reminder.car?.model}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Due Date:</span> {reminder.due_date ? new Date(reminder.due_date).toLocaleDateString() : 'No date set'}
            </p>
            {reminder.due_mileage && (
              <p className="text-gray-700">
                <span className="font-semibold">Due Mileage:</span> {reminder.due_mileage.toLocaleString()} km
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
};

// Install PWA Prompt
const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstall(false);
    }

    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
      <div className="flex-1">
        <p className="font-semibold">Install Car Service Manager</p>
        <p className="text-sm text-blue-100">Get quick access from your home screen</p>
      </div>
      <button
        onClick={handleInstall}
        className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
      >
        Install
      </button>
      <button
        onClick={() => setShowInstall(false)}
        className="ml-2 p-2 hover:bg-blue-700 rounded"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// Main App
const App = () => {
  const [authView, setAuthView] = useState('login');

  return (
    <AuthProvider>
      <InstallPWA />
      <AuthContent authView={authView} setAuthView={setAuthView} />
    </AuthProvider>
  );
};

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

  return <Dashboard />;
};

export default App;