
export enum Page {
  Dashboard = 'dashboard',
  Inventory = 'inventory',
  Sales = 'sales',
  Customers = 'customers',
  Suppliers = 'suppliers',
  Expenses = 'expenses',
  Reports = 'reports',
  Settings = 'settings',
  Login = 'login',
  Signup = 'signup'
}

export interface User {
  id: string;
  email: string;
  businessName: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string; // নতুন যুক্ত হয়েছে (পিস, কেজি ইত্যাদি)
  costPrice: number;
  price: number;
  category: string;
}

export interface SaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  unit?: string; // বিক্রয়ের সময় একক দেখানোর জন্য
}

export interface Sale {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'completed' | 'pending';
  items: SaleItem[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  totalDue: number;
  reminderDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  category: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}
