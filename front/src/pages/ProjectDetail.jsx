//ProjectDetails.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { ChevronLeft, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';

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

// Revamped ProjectDetail.jsx
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'Pending' });
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showToast = (message, type) => setToast({ message, type });

  useEffect(() => {
    API.get(`/api/projects/${id}`)
      .then((res) => {
        setProject(res.data);
        setForm({ name: res.data.name, description: res.data.description || '', status: res.data.status });
      })
      .catch((err) => {
          console.error(err);
          showToast('Failed to fetch project details.', 'error');
      })
      .finally(() => setLoading(false));
  }, [id]);
  
  const handleDelete = async () => {
      try {
          await API.delete(`/api/projects/${id}`);
          showToast('Project deleted successfully.', 'success');
          setTimeout(() => navigate('/projects'), 1500);
      } catch (err) {
          console.error(err);
          showToast('Failed to delete project.', 'error');
      } finally {
        setIsModalOpen(false);
      }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/api/projects/${id}`, form);
      setProject(res.data);
      setEditing(false);
      showToast('Project updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Update failed.';
      showToast(msg, 'error');
    }
  };

  const StatusPill = ({ status }) => {
    const styles = {
        Pending: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
        Active: "bg-blue-400/20 text-blue-300 border-blue-400/30",
        Completed: "bg-green-400/20 text-green-300 border-green-400/30",
    };
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${styles[status]}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!project) {
    return (
        <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-red-400">Project Not Found</h2>
                <Link to="/projects" className="mt-6 inline-block bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg">Return to Projects</Link>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
      <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDelete} title="Confirm Project Deletion">
        Are you sure you want to delete this project? This action is permanent.
      </CustomModal>
      <nav className="bg-gray-900/60 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-gray-700/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                  <h1 className="text-2xl font-bold text-white truncate hidden sm:block">Project Details</h1>
                  <Link to="/projects" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <ChevronLeft size={20}/> Back to All Projects
                  </Link>
              </div>
          </div>
      </nav>
      <main className="max-w-5xl mx-auto p-6 space-y-8">
          <Card>
              {!editing ? (
                  <div className="animate-in fade-in">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                           <div>
                              <h2 className="text-3xl font-bold text-white mb-1">{project.name}</h2>
                              <p className="text-gray-400">Associated Client ID: {project.client_id}</p>
                           </div>
                           <div className="flex-shrink-0 flex items-center gap-4">
                               <StatusPill status={project.status} />
                               <button onClick={() => setEditing(true)} className="p-2 rounded-md bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 transition-colors" title="Edit"><Edit size={16} /></button>
                               <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/40 text-red-300 transition-colors" title="Delete"><Trash2 size={16} /></button>
                           </div>
                      </div>
                      <div className="space-y-4 pt-6 border-t border-gray-700">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-1">DESCRIPTION</h3>
                            <p className="text-gray-300 whitespace-pre-wrap">{project.description || 'No description provided.'}</p>
                          </div>
                          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                            <p><strong className="text-gray-400">Created:</strong> {new Date(project.created_at).toLocaleString()}</p>
                            <p><strong className="text-gray-400">Last Updated:</strong> {new Date(project.updated_at).toLocaleString()}</p>
                          </div>
                      </div>
                  </div>
              ) : (
                  <form onSubmit={handleUpdate} className="space-y-4 animate-in fade-in">
                      <h3 className="text-2xl font-bold text-white">Editing: {project.name}</h3>
                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="6" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                              <option>Pending</option>
                              <option>Active</option>
                              <option>Completed</option>
                          </select>
                      </div>
                      <div className="flex gap-4">
                          <button type="submit" className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700"><Save size={16}/> Save Changes</button>
                          <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-700"><X size={16}/> Cancel</button>
                      </div>
                  </form>
              )}
          </Card>
      </main>
    </div>
  );
};

export default ProjectDetail;