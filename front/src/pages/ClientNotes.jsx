//ClientNotes.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { ChevronLeft, FilePlus, Save, X, Edit, Trash2 } from 'lucide-react';

const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800/50 border border-gray-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl ${className}`}>
        {children}
    </div>
);

const Toast = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50";
    const typeClasses = { success: 'bg-green-600/90 border-green-500', error: 'bg-red-600/90 border-red-500', info: 'bg-blue-600/90 border-blue-500' };
    useEffect(() => { const timer = setTimeout(onDismiss, 3000); return () => clearTimeout(timer); }, [message, onDismiss]);
    return <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}><span>{message}</span><button onClick={onDismiss} className="text-xl leading-none">&times;</button></div>;
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

const ClientNotes = () => {
  const { id: clientId } = useParams();
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchClientName();
    fetchNotes();
  }, [clientId]);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchClientName = async () => {
    try {
        const res = await API.get(`/api/clients/${clientId}`);
        setClientName(res.data.name);
    } catch(err){
        console.error("Failed to get client name", err);
        setClientName(`Client #${clientId}`);
    }
  }

  const fetchNotes = async () => {
    try {
      const res = await API.get(`/api/clients/${clientId}/notes`);
      setNotes(res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      showToast('Failed to fetch notes.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/notes', { content: form.content, client_id: parseInt(clientId) });
      setForm({ content: '' });
      fetchNotes();
      showToast('Note added successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding note.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      await API.put(`/api/notes/${id}`, { content: form.content, client_id: parseInt(clientId) });
      setEditingNote(null);
      setForm({ content: '' });
      fetchNotes();
      showToast('Note updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error updating note.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const openDeleteModal = (id) => {
    setNoteToDelete(id);
    setIsModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      await API.delete(`/api/notes/${noteToDelete}`);
      fetchNotes();
      showToast('Note deleted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting note.', 'error');
    } finally {
      setIsModalOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note.id);
    setForm({ content: note.content });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setForm({ content: '' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: '' })} />
        <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDelete} title="Confirm Note Deletion">
            Are you sure you want to permanently delete this note?
        </CustomModal>
        
        <nav className="bg-gray-900/60 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-gray-700/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-2xl font-bold text-white truncate">Notes for {clientName}</h1>
                    <Link to={`/clients/${clientId}`} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                        <ChevronLeft size={20}/> <span className="hidden sm:inline">Back to Client Details</span>
                    </Link>
                </div>
            </div>
        </nav>

        <main className="max-w-5xl mx-auto p-6 space-y-8">
            <Card className="animate-in fade-in duration-500">
                <form onSubmit={editingNote ? (e) => { e.preventDefault(); handleUpdate(editingNote); } : handleSubmit}>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    {editingNote ? <><Edit size={20}/> Edit Note</> : <><FilePlus size={20}/> Add New Note</>}
                  </h3>
                  <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full bg-gray-700/50 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows="4" placeholder="Type your note here..." required/>
                  <div className="flex items-center gap-4 mt-4">
                    <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500" disabled={loading}>
                      {loading ? 'Saving...' : editingNote ? <><Save size={16}/> Update Note</> : <><FilePlus size={16}/> Add Note</>}
                    </button>
                    {editingNote && (<button type="button" onClick={cancelEdit} className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700"><X size={16}/> Cancel</button>)}
                  </div>
                </form>
            </Card>

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {notes.map((note) => (
                  <Card key={note.id} className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                      <p className="text-gray-300 flex-1 whitespace-pre-wrap">{note.content}</p>
                      <div className="flex-shrink-0 flex sm:flex-col items-end gap-2">
                         <p className="text-xs text-gray-500 text-right">{new Date(note.created_at).toLocaleString()}</p>
                         <div className="flex items-center gap-2">
                            <button onClick={() => handleEditClick(note)} className="p-2 rounded-md bg-green-600/20 hover:bg-green-600/40 text-green-300" title="Edit Note"><Edit size={16}/></button>
                            <button onClick={() => openDeleteModal(note.id)} className="p-2 rounded-md bg-red-600/20 hover:bg-red-600/40 text-red-300" title="Delete Note"><Trash2 size={16}/></button>
                         </div>
                      </div>
                  </Card>
                ))}
                 {notes.length === 0 && (<Card className="text-center py-12"><p className="text-gray-500">No notes yet. Add your first note!</p></Card>)}
            </div>
        </main>
    </div>
  );
};

export default ClientNotes;