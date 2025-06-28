//resetpassword.jsx

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import API from '../utils/api';
import { Lock } from 'lucide-react';

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

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
        setError('Invalid or missing reset token.');
        return;
    }
    setLoading(true);
    try {
      const res = await API.post('/api/reset-password', { token, new_password: newPassword });
      setMessage(res.data.msg || 'Password reset successful. You can now login.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error resetting password. The link may be invalid or expired.');
      console.error('Error:', err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Your Password">
        {message && <p className="bg-green-500/20 text-green-300 border border-green-500/30 p-3 rounded-lg mb-4 text-sm text-center">{message}</p>}
        {error && <p className="bg-red-500/20 text-red-300 border border-red-500/30 p-3 rounded-lg mb-4 text-sm text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-700/50 p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Enter new password"
                    required
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-700/50 p-3 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Confirm new password"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-500"
                disabled={loading || !!message}
            >
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
         <p className="mt-6 text-center text-sm text-gray-400">
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">
                Back to Login
            </Link>
        </p>
    </AuthLayout>
  );
};

export default ResetPassword;