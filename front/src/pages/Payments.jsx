//Payments.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { ChevronLeft, DollarSign, Wallet } from 'lucide-react';

// Reusable Components
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

// Revamped Payments.jsx
const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ amount: '', project_id: '', date_paid: '' });
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchProjects();
  }, []);
  
  const showToast = (message, type) => setToast({ message, type });

  const fetchPayments = async () => {
    try {
      const res = await API.get('/api/payments');
      setPayments(res.data.sort((a,b) => new Date(b.date_paid) - new Date(a.date_paid)));
    } catch (err) {
      showToast('Failed to fetch payments.', 'error');
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await API.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      showToast('Failed to fetch projects.', 'error');
      console.error(err);
    }
  };
  
  const handleInputChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.date_paid) {
      showToast("Please enter the date paid.", "error");
      setLoading(false);
      return;
    }

    const payload = {
      amount: parseFloat(form.amount),
      project_id: parseInt(form.project_id),
      date_paid: form.date_paid,
    };

    try {
      await API.post('/api/payments', payload);
      showToast("Payment added successfully!", "success");
      // Reset form and refetch payments
      setForm({ amount: '', project_id: '', date_paid: '' });
      fetchPayments();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create payment.';
      showToast(errorMessage, "error");
      console.error('Full Axios Error:', err);
    } finally {
        setLoading(false);
    }
  };
    
  const getProjectName = (id) => projects.find(p => p.id === id)?.name || `Project #${id}`;
  
  const totalRevenue = payments.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
      <nav className="bg-gray-900/60 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-gray-700/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <h1 className="text-2xl font-bold text-white">Payments</h1>
                  <Link to="/dashboard" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <ChevronLeft size={20}/> 
                      <span className="hidden sm:inline">Back to Dashboard</span>
                  </Link>
              </div>
          </div>
      </nav>
      
      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 animate-in fade-in duration-500">
            <Card>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><DollarSign/> Record a Payment</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Project</label>
                    <select name="project_id" value={form.project_id} onChange={handleInputChange} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
                      <option value="">-- Choose a project --</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name || `Project ${project.id}`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                    <input type="number" name="amount" value={form.amount} onChange={handleInputChange} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date Paid</label>
                    <input type="date" name="date_paid" value={form.date_paid} onChange={handleInputChange} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500" disabled={!form.project_id || loading}>
                    {loading ? 'Saving...' : 'Add Payment'}
                  </button>
                </form>
            </Card>
          </div>

          <div className="md:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2"><Wallet/> Payment History</h3>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
                    </div>
                 </div>
                 <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                 {payments.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">No payments recorded.</div>
                ) : (
                    payments.map((payment) => (
                        <div key={payment.id} className="p-4 bg-gray-700/50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg text-green-300">${parseFloat(payment.amount).toFixed(2)}</p>
                                <p className="text-sm text-gray-300">{getProjectName(payment.project_id)}</p>
                            </div>
                            <p className="text-sm text-gray-400">{new Date(payment.date_paid).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
                 </div>
              </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payments;