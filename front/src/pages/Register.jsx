//Register.jsx


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await API.post('/api/register', { email, password });
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Your Account">
        {error && <p className="bg-red-500/20 text-red-300 border border-red-500/30 p-3 rounded-lg mb-4 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-700/50 p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" required />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700/50 p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Password" required />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-700/50 p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Confirm Password" required />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-500" disabled={loading}>
                 {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-semibold">Login</Link>
        </p>
    </AuthLayout>
  );
};

export default Register;