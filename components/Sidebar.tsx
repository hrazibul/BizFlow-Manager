
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Truck,
  Monitor
} from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  businessName: string;
  isGuest?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, onNavigate, onLogout, businessName, isGuest }) => {
  const menuItems = [
    { id: Page.Dashboard, label: 'ড্যাশবোর্ড', icon: <LayoutDashboard size={20} /> },
    { id: Page.Inventory, label: 'ইনভেন্টরি', icon: <Package size={20} /> },
    { id: Page.Sales, label: 'বিক্রয়', icon: <ShoppingCart size={20} /> },
    { id: Page.Customers, label: 'কাস্টমার', icon: <Users size={20} /> },
    { id: Page.Suppliers, label: 'সাপ্লায়ার', icon: <Truck size={20} /> },
    { id: Page.Expenses, label: 'খরচ', icon: <Receipt size={20} /> },
    { id: Page.Reports, label: 'রিপোর্ট', icon: <BarChart3 size={20} /> },
    { id: Page.Settings, label: 'সেটিংস', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        <div className="px-6 py-8 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="text-xl font-bold text-white tracking-tight">বিজফ্লো</span>
        </div>

        <div className="px-6 mb-6">
          <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ব্যবসা</p>
            <p className="text-sm font-medium text-indigo-400 truncate">{businessName}</p>
            {isGuest && (
              <div className="flex items-center space-x-1 mt-1 text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                <Monitor size={10} />
                <span>অফলাইন মোড</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group
                ${activePage === item.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-slate-800 hover:text-white'}
              `}
            >
              <div className="flex items-center space-x-3">
                <span className={`${activePage === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {activePage === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">লগ আউট</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
