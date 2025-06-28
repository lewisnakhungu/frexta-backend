//Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { AtSign, Lock } from 'lucide-react';

const AuthLayout = ({ children, title }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop')"}}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md">
            <div className="bg-gray-800/50 border border-gray-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">{title}</h2>
                {children}
            </div>
        </div>
    </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const res = await API.post('/api/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      login(res.data);
      navigate('/dashboard');

    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthLayout title="ClientConnect Login">
        {error && <p className="bg-red-500/20 text-red-300 border border-red-500/30 p-3 rounded-lg mb-4 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700/50 p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Email" required />
            </div>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700/50 p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Password" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-500" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
            <p>
                <Link to="/forgot-password" className="text-blue-400 hover:underline">Forgot Password?</Link>
            </p>
            <p>
                Don't have an account?{' '}
                <Link to="/register" className="text-green-400 hover:underline font-semibold">Register Here</Link>
            </p>
        </div>
    </AuthLayout>
  );
};

export default Login;