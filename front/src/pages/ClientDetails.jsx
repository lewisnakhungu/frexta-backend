//ClientDetails.jsx


import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { Mail, Phone, FolderKanban, FileText, ChevronLeft, Loader2 } from 'lucide-react';

const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800/50 border border-gray-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl ${className}`}>
        {children}
    </div>
);

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientRes, projectsRes, notesRes] = await Promise.all([
        API.get(`/api/clients/${id}`),
        API.get(`/api/clients/${id}/projects`),
        API.get(`/api/clients/${id}/notes`),
      ]);
      setClient(clientRes.data);
      setProjects(projectsRes.data);
      setNotes(notesRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError(`Failed to fetch client data. Please try again.`);
      console.error('Error:', err);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        <div className="text-center"><Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" /><p className="mt-4 text-lg">Loading Client Universe...</p></div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
                <p className="text-gray-300 mb-6">{error}</p>
                <Link to="/clients" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition">Return to Clients</Link>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <nav className="bg-gray-900/60 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-white truncate">{client.name}</h1>
                <Link to="/clients" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"><ChevronLeft size={20}/> <span className="hidden sm:inline">Back to All Clients</span></Link>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <Card className="!p-0 overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 bg-gradient-to-br from-gray-900 via-gray-900/70 to-blue-900/30">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                     <img src={`https://i.pravatar.cc/100?u=${client.email}`} alt={client.name} className="w-24 h-24 rounded-full border-4 border-gray-700 shadow-lg"/>
                     <div className="text-center sm:text-left">
                        <h2 className="text-4xl font-bold text-white">{client.name}</h2>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 mt-2 text-gray-400">
                            <span className="flex items-center gap-2"><Mail size={14} /> {client.email}</span>
                            <span className="flex items-center gap-2"><Phone size={14} /> {client.phone || 'N/A'}</span>
                        </div>
                     </div>
                </div>
            </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2"><FolderKanban/> Projects</h3>
                    <Link to={`/projects?clientId=${id}`} className="bg-green-600/20 text-green-300 border border-green-500/30 font-semibold text-sm py-2 px-4 rounded-lg hover:bg-green-600/40">New Project</Link>
                </div>
                {projects.length === 0 ? <p className="text-center text-gray-500 py-8">No projects found.</p> : (
                    <ul className="space-y-4">
                    {projects.map((project) => (
                        <li key={project.id} className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors">
                        <Link to={`/projects/${project.id}`} className="font-semibold text-blue-400 hover:underline">{project.name}</Link>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                        </li>
                    ))}
                    </ul>
                )}
            </Card>
            <Card>
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-semibold text-white flex items-center gap-2"><FileText /> Latest Notes</h3>
                     <Link to={`/clients/${id}/notes`} className="bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold text-sm py-2 px-4 rounded-lg hover:bg-blue-600/40">Manage All Notes</Link>
                </div>
                {notes.length === 0 ? <p className="text-center text-gray-500 py-8">No notes found.</p> : (
                    <ul className="space-y-4">
                    {notes.slice(0, 3).map((note) => (
                        <li key={note.id} className="p-4 bg-gray-700/50 rounded-lg">
                        <p className="text-gray-300 line-clamp-3">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-2 text-right">{new Date(note.created_at).toLocaleString()}</p>
                        </li>
                    ))}
                    </ul>
                )}
            </Card>
        </div>
      </main>
    </div>
  );
};

export default ClientDetails;