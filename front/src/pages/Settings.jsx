// Settings.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { ChevronLeft, User, Mail, Save } from 'lucide-react';

const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800/50 border border-gray-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl ${className}`}>
        {children}
    </div>
);

const Toast = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50";
    const typeClasses = {
        success: 'bg-green-600/90 border-green-500',
        error: 'bg-red-600/90 border-red-500',
    };
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [message, onDismiss]);
    return <div className={`${baseClasses} ${typeClasses[type] || 'bg-blue-600/90'}`}>{message}</div>;
};

const Settings = () => {
  const [form, setForm] = useState({ email: '', name: '' });
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/api/users/me');
        setForm({
            email: res.data.email,
            name: res.data.name || ''
        });
      } catch (err) {
        console.error('Failed to fetch user info', err);
        showToast('Failed to load your information.', 'error');
      }
    };
    fetchUser();
  }, []);

  const showToast = (message, type) => setToast({ message, type });
  
  const handleInputChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put('/api/users/me', { name: form.name });
      showToast('Settings updated successfully!', 'success');
    } catch (err) {
      console.error('Update failed', err);
      showToast('Failed to update settings.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
      <nav className="bg-gray-900/60 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-gray-700/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <h1 className="text-2xl font-bold text-white">Settings</h1>
                  <Link to="/dashboard" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <ChevronLeft size={20}/> 
                      <span className="hidden sm:inline">Back to Dashboard</span>
                  </Link>
              </div>
          </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
          <Card className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold mb-6 text-white">Account Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                      <input type="email" value={form.email} disabled className="w-full bg-gray-900/50 p-3 pl-10 border border-gray-700 rounded-lg cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700/50 p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                        placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500"
                        disabled={loading}
                    >
                        <Save size={16}/>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
              </form>
          </Card>
      </main>
    </div>
  );
};

export default Settings;