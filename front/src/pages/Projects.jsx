//Projects.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../utils/api';
import { ChevronLeft, FilePlus, Save, DollarSign } from 'lucide-react';

// Reusable Components
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

// Hook to read URL query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// Revamped Projects.jsx
const Projects = () => {
  const query = useQuery();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
    const clientIdFromQuery = query.get('clientId');
    if (clientIdFromQuery) {
        setClientId(clientIdFromQuery);
    }
  }, []);

  const showToast = (message, type) => setToast({ message, type });

  const fetchInitialData = async () => {
    try {
      const [clientsRes, projectsRes, paymentsRes] = await Promise.all([
        API.get('/api/clients'),
        API.get('/api/projects'),
        API.get('/api/payments'),
      ]);
      setClients(clientsRes.data);
      setProjects(projectsRes.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      setPayments(paymentsRes.data);
    } catch (err) {
      showToast('Failed to load project data.', 'error');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, description, status, client_id: parseInt(clientId) };
      await API.post('/api/projects', payload);
      showToast('Project created successfully.', 'success');
      setName('');
      setDescription('');
      setStatus('Pending');
      setClientId('');
      fetchInitialData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Project creation failed.';
      showToast(msg, 'error');
    } finally {
        setLoading(false);
    }
  };

  const getClientName = (id) => clients.find((c) => c.id === id)?.name || 'Unknown Client';
  const getPaymentsForProject = (projectId) => payments.filter((p) => p.project_id === projectId);
  
  const StatusPill = ({ status }) => {
    const styles = { Pending: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30", Active: "bg-blue-400/20 text-blue-300 border-blue-400/30", Completed: "bg-green-400/20 text-green-300 border-green-400/30" };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{status}</span>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
        <nav className="bg-gray-900/60 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-2xl font-bold text-white">Projects</h1>
                    <Link to="/dashboard" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"><ChevronLeft size={20}/> <span className="hidden sm:inline">Back to Dashboard</span></Link>
                </div>
            </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6 space-y-8">
            <Card className="animate-in fade-in duration-500">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><FilePlus/> Create New Project</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Project Name*" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
                            <option value="">-- Assign to Client* --</option>
                            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                        </select>
                    </div>
                    <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="3"/>
                    <div className="flex items-center gap-4">
                         <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full md:w-auto bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            <option>Pending</option>
                            <option>Active</option>
                            <option>Completed</option>
                        </select>
                         <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500" disabled={loading}>{loading ? 'Creating...' : <><Save size={16}/> Create Project</>}</button>
                    </div>
                </form>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {projects.map((project) => {
                    const relatedPayments = getPaymentsForProject(project.id);
                    const totalPaid = relatedPayments.reduce((acc, p) => acc + parseFloat(p.amount), 0);
                    return (
                        <Card key={project.id} className="flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2"><h4 className="font-semibold text-lg text-white pr-2">{project.name}</h4><StatusPill status={project.status} /></div>
                                <p className="text-sm text-blue-400 mb-4 font-medium">{getClientName(project.client_id)}</p>
                                <p className="text-sm text-gray-300 line-clamp-2 min-h-[40px]">{project.description}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm flex items-center gap-2"><DollarSign className="text-green-400" size={20}/><div><p className="text-gray-400 text-xs">Total Paid</p><p className="font-bold text-green-400 text-base">${totalPaid.toFixed(2)}</p></div></div>
                                    <Link to={`/projects/${project.id}`} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">View Details</Link>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                 {projects.length === 0 && (<Card className="md:col-span-2 lg:col-span-3 text-center py-12"><p className="text-gray-500">No projects found.</p></Card>)}
            </div>
        </main>
    </div>
  );
};

export default Projects;