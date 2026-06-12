import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Todos', path: '/todos', icon: <CheckSquare size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-surface h-full shadow-lg flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-500 flex items-center gap-2">
          <CheckSquare className="text-success-500" />
          TodoApp
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-600/10 text-primary-500 font-medium' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
