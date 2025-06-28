//Clients.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { UserPlus, Search, Trash2, Eye, ChevronLeft } from 'lucide-react';

const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800/50 border border-gray-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl ${className}`}>
        {children}
    </div>
);

const Toast = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50";
    const typeClasses = { success: 'bg-green-600/90 border-green-500', error: 'bg-red-600/90 border-red-500' };
    useEffect(() => { const timer = setTimeout(onDismiss, 3000); return () => clearTimeout(timer); }, [message, onDismiss]);
    return <div className={`${baseClasses} ${typeClasses[type] || 'bg-blue-600/90'}`}><span>{message}</span><button onClick={onDismiss} className="text-xl leading-none">&times;</button></div>;
};

const CustomModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-in fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-md m-4 transform animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <div className="text-gray-300 mb-6">{children}</div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="py-2 px-5 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="py-2 px-5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Confirm Delete</button>
                </div>
            </div>
        </div>
    );
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  useEffect(() => { fetchClients(); }, []);

  const showToast = (message, type) => setToast({ message, type });

  const fetchClients = async () => {
    try {
      const res = await API.get('/api/clients');
      setClients(res.data);
    } catch (err) {
      showToast('Failed to fetch clients.', 'error');
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/api/clients', form);
      setClients([...clients, res.data]);
      setForm({ name: '', email: '', phone: '', company: '' });
      showToast('Client added successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding client.', 'error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setClientToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    try {
      await API.delete(`/api/clients/${clientToDelete}`);
      setClients(clients.filter((client) => client.id !== clientToDelete));
      showToast('Client deleted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting client.', 'error');
      console.error('Error:', err);
    } finally {
      setIsModalOpen(false);
      setClientToDelete(null);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
      <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDelete} title="Confirm Deletion">
        Are you sure you want to delete this client? This will also remove associated projects and notes. This action cannot be undone.
      </CustomModal>

      <nav className="bg-gray-900/60 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-white">Clients</h1>
                <Link to="/dashboard" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <ChevronLeft size={20}/> <span className="hidden sm:inline">Back to Dashboard</span>
                </Link>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <Card className="animate-in fade-in duration-500">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><UserPlus size={22}/> Add New Client</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Name*" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                <input type="email" placeholder="Email*" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                <input type="text" placeholder="Phone" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
                <input type="text" placeholder="Company" name="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500" disabled={loading}>{loading ? 'Adding...' : 'Add Client'}</button>
            </form>
        </Card>
        
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                 <h3 className="text-xl font-semibold text-white">Client Database</h3>
                 <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-700/50 p-2 pl-10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="border-b border-gray-700"><tr><th className="py-3 px-4 text-sm font-semibold text-gray-400">Name</th><th className="py-3 px-4 text-sm font-semibold text-gray-400 hidden md:table-cell">Contact</th><th className="py-3 px-4 text-sm font-semibold text-gray-400 hidden md:table-cell">Company</th><th className="py-3 px-4 text-sm font-semibold text-gray-400 text-right">Actions</th></tr></thead>
                    <tbody>
                        {filteredClients.map((client) => (
                          <tr key={client.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                            <td className="py-3 px-4"><div className="font-semibold text-white">{client.name}</div><div className="text-sm text-gray-400 md:hidden">{client.email}</div></td>
                            <td className="py-3 px-4 text-gray-300 hidden md:table-cell"><div>{client.email}</div><div className="text-xs text-gray-500">{client.phone || 'N/A'}</div></td>
                            <td className="py-3 px-4 text-gray-300 hidden md:table-cell">{client.company || 'N/A'}</td>
                            <td className="py-3 px-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                 <Link to={`/clients/${client.id}`} className="p-2 rounded-md bg-blue-600/20 hover:bg-blue-600/40 text-blue-300" title="View Details"><Eye size={16} /></Link>
                                 <button onClick={() => openDeleteModal(client.id)} className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/40 text-red-300" title="Delete Client"><Trash2 size={16} /></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredClients.length === 0 && <p className="text-center text-gray-500 py-8">No clients found.</p>}
            </div>
        </Card>
      </main>
    </div>
  );
};

export default Clients;