//Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { 
    Users, 
    FolderKanban, 
    CreditCard, 
    Settings, 
    UserPlus,
    FilePlus,
    DollarSign
} from 'lucide-react';


const Card = ({ children, className = '' }) => (
    <div className={`bg-gray-800/50 border border-gray-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl ${className}`}>
        {children}
    </div>
);

const KpiCardSkeleton = () => (
    <Card><div className="animate-pulse"><div className="h-4 bg-gray-700 rounded w-3/4"></div><div className="h-8 bg-gray-700 rounded w-1/2 mt-3"></div><div className="h-3 bg-gray-700 rounded w-1/4 mt-2"></div></div></Card>
);

const ActivitySkeleton = () => (
    <div className="space-y-4">{[...Array(3)].map((_, i) => (<div key={i} className="flex items-center gap-3 animate-pulse"><div className="w-10 h-10 bg-gray-700 rounded-full"></div><div className="flex-1 space-y-2"><div className="h-4 bg-gray-700 rounded w-full"></div><div className="h-3 bg-gray-700 rounded w-1/4"></div></div></div>))}</div>
);

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
};

const Dashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [kpiRes, activityRes] = await Promise.all([
          API.get('/api/dashboard/kpis'),
          API.get('/api/dashboard/activities')
        ]);
        setKpis(kpiRes.data);
        setActivities(activityRes.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const kpiItems = [
    { title: "Active Clients", data: kpis?.activeClients, link: "/clients", icon: <Users size={24} className="text-blue-400"/> },
    { title: "Projects in Progress", data: kpis?.projectsInProgress, link: "/projects", icon: <FolderKanban size={24} className="text-green-400"/> },
    { title: "Revenue this Month", data: kpis?.revenueThisMonth, link: "/payments", icon: <CreditCard size={24} className="text-yellow-400"/>, isCurrency: true },
    { title: "Pending Tasks", data: kpis?.pendingTasks, link: "/tasks", icon: <Settings size={24} className="text-purple-400"/> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="animate-in fade-in duration-500">
            <h1 className="text-4xl font-bold text-white">Welcome back, {user?.name || user?.email || 'User'} 👋</h1>
            <p className="text-lg text-gray-400 mt-1">Here's your business snapshot for today.</p>
        </div>
        
        {error && <Card className="mt-8"><p className="text-red-400 text-center">{error}</p></Card>}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-8">
            {loading ? (
                kpiItems.map((_, i) => <KpiCardSkeleton key={i} />)
            ) : (
                kpiItems.map((kpi, index) => (
                    <Card key={index}>
                        <Link to={kpi.link} className="block">
                            <div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-400">{kpi.title}</p>{kpi.icon}</div>
                            <p className="text-3xl font-bold text-white mt-2">{kpi.isCurrency && '$'}{kpi.data?.value?.toLocaleString() || '...'}</p>
                            <p className={`text-sm mt-1 ${kpi.data?.change?.toString().startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{kpi.data?.change || ''}</p>
                        </Link>
                    </Card>
                ))
            )}

            <Card className="xl:col-span-2">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                {loading ? <ActivitySkeleton /> : (
                    <ul className="space-y-4">
                        {activities.map((activity) => (
                             <li key={activity.id} className="flex items-center gap-3">
                                <div className="p-2 bg-gray-700 rounded-full"><Users size={16} className="text-gray-300"/></div>
                                <div>
                                    <p className="text-sm text-white"><span className="font-bold">{activity.person}</span> {activity.action} <span className="text-blue-400 font-semibold">{activity.target}</span></p>
                                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                                </div>
                            </li>
                        ))}
                         {activities.length === 0 && !loading && <p className="text-gray-500 text-center py-4">No recent activity.</p>}
                    </ul>
                )}
            </Card>
            
            <Card className="xl:col-span-2">
                 <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <Link to="/clients" className="flex flex-col items-center justify-center p-4 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg border border-blue-500/30"><UserPlus className="mb-2 text-blue-300" size={24} /><span className="font-semibold text-sm">New Client</span></Link>
                     <Link to="/projects" className="flex flex-col items-center justify-center p-4 bg-green-600/20 hover:bg-green-600/40 rounded-lg border border-green-500/30"><FilePlus className="mb-2 text-green-300" size={24}/><span className="font-semibold text-sm">New Project</span></Link>
                     <Link to="/payments" className="flex flex-col items-center justify-center p-4 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-lg border border-yellow-500/30"><DollarSign className="mb-2 text-yellow-300" size={24}/><span className="font-semibold text-sm">Add Payment</span></Link>
                 </div>
            </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;