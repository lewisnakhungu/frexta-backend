
 import REACT from 'react';
 import { Link, useLocation} from 'react-router-dom';
 import { useAuth } from '../context/AuthContext';
 import { 
     LayoutDashboard, 
     Users, 
     FolderKanban, 
     CreditCard, 
     LogOut, 
     ChevronLeft, 
     ChevronRight,
 } from 'lucide-react';

const SideBar = ({ isExpanded, setIsExpanded, onExpand, onCollapse, onToggle }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { icon: <LayoutDashboard size={20} />, text: 'Dashboard', path: '/dashboard' },
        { icon: <Users size={20} />, text: 'Clients', path: '/clients' },
        { icon: <FolderKanban size={20} />, text: 'Projects', path: '/projects' },
        { icon: <CreditCard size={20} />, text: 'Payments', path: '/payments' },
    ];

    const handleToggle = () => {
        const next = !isExpanded;
        setIsExpanded(next);

        if(onToggle) onToggle(next);
        if(next && onExpand)onExpand();
        if (!next && onCollapse)onCollapse();
    }

    return (
        <aside className={`h-screen sticky top-0 transition-all duration-300 ${isExpanded ? "w-64" : "w-20"} bg-gray-900 border-r border-gray-700/50 flex flex-col`}>
            <nav className="h-full flex flex-col">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <span className={`overflow-hidden transition-all text-white font-bold text-xl ${isExpanded ? "w-32" : "w-0"}`}>ClientConnect</span>
                    <button onClick={() => setIsExpanded(curr => !curr)} className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white">
                        {isExpanded ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
                    </button>
                </div>

                <ul className="flex-1 px-3 mt-4">
                    {navItems.map(item => (
                        <Link key={item.path} to={item.path} className={`
                            flex items-center py-2.5 px-4 my-1 rounded-md transition-colors duration-200
                            ${location.pathname === item.path ? 'bg-blue-800/50 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}
                        `}>
                            {item.icon}
                            <span className={`overflow-hidden transition-all ${isExpanded ? "w-40 ml-3" : "w-0"}`}>{item.text}</span>
                        </Link>
                    ))}
                </ul>

                <div className="border-t border-gray-700 p-3">
                    <div className="flex items-center gap-3">
                         <img src={`https://i.pravatar.cc/40?u=${user?.email}`} alt="User Avatar" className="w-10 h-10 rounded-full" />
                         <div className={`flex justify-between items-center overflow-hidden transition-all ${isExpanded ? "w-36" : "w-0"}`}>
                             <div className="leading-4">
                                 <h4 className="font-semibold text-white truncate">{user?.name || user?.email}</h4>
                                 <Link to="/settings" className="text-xs text-gray-400 hover:underline">Settings</Link>
                             </div>
                             <button onClick={logout} className="text-gray-400 hover:text-white" title="Logout">
                                 <LogOut size={20} />
                             </button>
                         </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
};

export default SideBar;