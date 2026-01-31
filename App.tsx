
import React, { useState, useEffect } from 'react';
import { Page, User as UserType, InventoryItem, Sale, Customer, Expense, Supplier } from './types';
import { supabase } from './supabase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Suppliers from './pages/Suppliers';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import { Menu, X, User as LucideUser, Loader2, Info } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
  const [user, setUser] = useState<UserType | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const loadInitialData = (currentUser: UserType) => {
    if (currentUser.id === 'guest') {
      const loadLocal = (key: string, setter: any) => {
        try {
          const data = localStorage.getItem(`bizflow_guest_${key}`);
          if (data) setter(JSON.parse(data));
          else setter([]);
        } catch (e) { setter([]); }
      };
      loadLocal('inventory', setInventory);
      loadLocal('sales', setSales);
      loadLocal('customers', setCustomers);
      loadLocal('expenses', setExpenses);
      loadLocal('suppliers', setSuppliers);
    } else {
      fetchSupabaseData(currentUser.id);
    }
  };

  const fetchSupabaseData = async (userId: string) => {
    try {
      const [invRes, salesRes, custRes, expRes, supRes] = await Promise.all([
        supabase.from('inventory').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('sales').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('suppliers').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (invRes.data) setInventory(invRes.data);
      if (salesRes.data) setSales(salesRes.data);
      if (custRes.data) setCustomers(custRes.data);
      if (expRes.data) setExpenses(expRes.data);
      if (supRes.data) setSuppliers(supRes.data);
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      let isGuest = false;
      try {
        isGuest = sessionStorage.getItem('bizflow_is_guest') === 'true';
      } catch (e) {}

      if (isGuest) {
        const guestUser: UserType = { id: 'guest', email: 'guest@local.browser', businessName: 'গেস্ট ব্যবসা' };
        setUser(guestUser);
        loadInitialData(guestUser);
        setCurrentPage(Page.Dashboard);
        setIsLoading(false);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const loggedUser: UserType = {
            id: session.user.id,
            email: session.user.email || '',
            businessName: session.user.user_metadata?.businessName || 'আমার ব্যবসা'
          };
          setUser(loggedUser);
          loadInitialData(loggedUser);
          setCurrentPage(Page.Dashboard);
        }
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const loggedUser: UserType = {
          id: session.user.id,
          email: session.user.email || '',
          businessName: session.user.user_metadata?.businessName || 'আমার ব্যবসা'
        };
        setUser(loggedUser);
        loadInitialData(loggedUser);
        setCurrentPage(Page.Dashboard);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (userData: UserType) => {
    setUser(userData);
    loadInitialData(userData);
    setCurrentPage(Page.Dashboard);
  };

  const handleLogout = async () => {
    if (user?.id === 'guest') {
      sessionStorage.removeItem('bizflow_is_guest');
    } else {
      await supabase.auth.signOut();
    }
    setUser(null);
    setCurrentPage(Page.Login);
    setInventory([]); setSales([]); setCustomers([]); setExpenses([]); setSuppliers([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-bold text-lg">বিজফ্লো প্রস্তুত হচ্ছে...</p>
      </div>
    );
  }

  const renderPage = () => {
    if (!user) return <Auth onLogin={handleLoginSuccess} onSignup={handleLoginSuccess} initialMode="login" />;

    const commonProps = {
      user,
      inventory, setInventory,
      sales, setSales,
      customers, setCustomers,
      expenses, setExpenses,
      suppliers, setSuppliers
    };

    switch (currentPage) {
      case Page.Dashboard: return <Dashboard {...commonProps} />;
      case Page.Inventory: return <Inventory {...commonProps} />;
      case Page.Sales: return <Sales {...commonProps} />;
      case Page.Customers: return <Customers {...commonProps} />;
      case Page.Suppliers: return <Suppliers {...commonProps} />;
      case Page.Expenses: return <Expenses {...commonProps} />;
      case Page.Reports: return <Reports {...commonProps} />;
      case Page.Settings: return <Settings user={user} onUpdateUser={setUser} onLogout={handleLogout} />;
      default: return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {user && (
        <>
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-40">
            <h1 className="text-xl font-bold text-indigo-600">বিজফ্লো</h1>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-slate-100">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <Sidebar 
            isOpen={isSidebarOpen} activePage={currentPage} 
            onNavigate={(p) => { setCurrentPage(p); setSidebarOpen(false); }}
            onLogout={handleLogout} businessName={user.businessName} isGuest={user.id === 'guest'}
          />
        </>
      )}
      <main className="flex-1 overflow-auto relative">
        {user && (
          <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-wider">{currentPage}</h2>
              {user.id === 'guest' && (
                <span className="flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">
                  <Info size={10} /> <span>অফলাইন মোড: ডাটা ব্রাউজারে সেভ থাকছে</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 pl-4 border-l">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <LucideUser size={18} />
              </div>
              <span className="text-sm font-medium text-slate-600 truncate max-w-[150px]">{user.businessName}</span>
            </div>
          </header>
        )}
        <div className={user ? "p-4 md:p-8" : "min-h-screen"}>{renderPage()}</div>
      </main>
      {user && <Chatbot businessData={{ inventory, sales, customers, expenses, suppliers, businessName: user.businessName }} />}
    </div>
  );
};

export default App;
