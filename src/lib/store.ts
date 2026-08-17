"use client";
import { supabase } from './supabase';
export interface Customer {
  id: string;
  name: string;
  phone: string;
  measurements: Record<string, any>;
  customerNumber?: number;
}

export type OrderStatus = 'received' | 'ready' | 'delivered';

export interface PaymentLog {
  id: string;
  date: string;
  amount: number;
}

export interface Order {
  id: string;
  customerId: string;
  garmentId: string;
  quantity: number;
  status: OrderStatus;
  totalAmount: number;
  amountPaid: number;
  datePlaced: string;
  dueDate: string | null;
  dateDelivered?: string;
  measurementSnapshot: any;
  paymentLogs?: PaymentLog[];
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  suitPrice: number;
}

export interface MessageTemplates {
  orderPlaced: string;
  orderReady: string;
  paymentReminder: string;
}

export type SyncAction = 
  | { type: 'UPSERT_CUSTOMER'; payload: Customer; timestamp: number }
  | { type: 'UPSERT_ORDER'; payload: Order; timestamp: number }
  | { type: 'UPSERT_SETTINGS'; payload: ShopSettings; timestamp: number };

export const addToSyncQueue = (action: SyncAction) => {
  if (typeof window === 'undefined') return;
  try {
    const queueStr = localStorage.getItem('tailors_sync_queue');
    const queue: SyncAction[] = queueStr ? JSON.parse(queueStr) : [];
    // Remove older actions of the same type and ID to avoid redundant syncs
    const filteredQueue = queue.filter(a => {
      if (a.type !== action.type) return true;
      if (a.type === 'UPSERT_SETTINGS') return false; // Only keep the newest settings action
      return (a.payload as any).id !== (action.payload as any).id;
    });
    filteredQueue.push(action);
    localStorage.setItem('tailors_sync_queue', JSON.stringify(filteredQueue));
  } catch (e) {
    console.error('Error queueing sync action:', e);
  }
};

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: "My Tailor Shop",
  ownerName: "Owner",
  phone: "",
  suitPrice: 1500
};

const DEFAULT_TEMPLATES: MessageTemplates = {
  orderPlaced: "Thanks for trusting {shopName}!\n\n*Order Summary for {name}*\nOrder: {quantity}x {garment}\nDate Placed: {datePlaced}\nExpected Pickup: {dueDate}\n\n*Payment Details:*\nTotal Amount: Rs {total}\nAdvance Paid: Rs {advance}\n*Pending Due: Rs {balance}*\n\nYou will be notified as soon as your dress is ready!\n\n*Regards,*\n*{ownerName}*",
  orderReady: "Thanks for trusting {shopName}!\n\nGreat news, {name}! Your order ({quantity}x {garment}) is now stitched and ready for pickup.\n\n*Pending Balance: Rs {balance}*\n\nThank you for choosing us for your tailoring needs. We hope you love the fit and choose us again for your next dress!\n\n*Regards,*\n*{ownerName}*",
  paymentReminder: "Thanks for trusting {shopName}!\n\n*Pending Dues Reminder for {name}*\n\n*Order Details:*\nItems: {quantity}x {garment}\nOrder Date: {datePlaced}\n\n*Payment Summary:*\nTotal Amount: Rs {total}\nAmount Paid: Rs {advance}\n*Remaining Balance: Rs {balance}*\n\nPlease clear your pending dues at your earliest convenience.\n\n*Regards,*\n*{ownerName}*"
};

export const getMockCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('tailors_customers');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error reading customers:', e);
    return [];
  }
};

export const saveMockCustomer = (customer: Customer) => {
  if (typeof window === 'undefined') return;
  try {
    const customers = getMockCustomers();
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    
    if (existingIndex >= 0) {
      customers[existingIndex] = customer;
    } else {
      customers.push(customer);
    }
    
    localStorage.setItem('tailors_customers', JSON.stringify(customers));
    addToSyncQueue({ type: 'UPSERT_CUSTOMER', payload: customer, timestamp: Date.now() });
  } catch (e) {
    console.error('Error saving customer:', e);
  }
};

export const getMockOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('tailors_orders');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error reading orders:', e);
  }
  return [];
};

export const saveMockOrder = (order: Order) => {
  if (typeof window === 'undefined') return;
  try {
    const orders = getMockOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.push(order);
    }
    
    localStorage.setItem('tailors_orders', JSON.stringify(orders));
    addToSyncQueue({ type: 'UPSERT_ORDER', payload: order, timestamp: Date.now() });
  } catch (e) {
    console.error('Error saving order:', e);
  }
};

export const getShopSettings = (): ShopSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem('tailors_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Error reading settings:', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveShopSettings = (settings: ShopSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('tailors_settings', JSON.stringify(settings));
    addToSyncQueue({ type: 'UPSERT_SETTINGS', payload: settings, timestamp: Date.now() });
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

export const getMessageTemplates = (): MessageTemplates => {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const stored = localStorage.getItem('tailors_templates');
    return stored ? JSON.parse(stored) : DEFAULT_TEMPLATES;
  } catch (e) {
    console.error('Error reading templates:', e);
    return DEFAULT_TEMPLATES;
  }
};

export const saveMessageTemplates = (templates: MessageTemplates) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('tailors_templates', JSON.stringify(templates));
  } catch (e) {
    console.error('Error saving templates:', e);
  }
};

// Fallback ID generator for mobile devices on non-HTTPS connections where crypto.randomUUID is not available
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const formatWhatsAppNumber = (phone: string): string => {
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '92' + clean.substring(1);
  }
  return clean;
};

export const generateWhatsAppMessage = (
  templateName: keyof MessageTemplates,
  customer: Customer,
  order: Order,
  garmentName: string,
  settings: ShopSettings
): string => {
  const templates = getMessageTemplates();
  let msg = templates[templateName] || DEFAULT_TEMPLATES[templateName];
  
  const pending = Math.max(0, order.totalAmount - order.amountPaid);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  msg = msg.replace(/\{shopName\}/g, settings.shopName || 'Tailor Shop')
           .replace(/\{ownerName\}/g, settings.ownerName || 'Tailor Shop Owner')
           .replace(/\{name\}/g, customer.name)
           .replace(/\{garment\}/g, garmentName)
           .replace(/\{quantity\}/g, order.quantity.toString())
           .replace(/\{datePlaced\}/g, formatDate(order.datePlaced))
           .replace(/\{dueDate\}/g, formatDate(order.dueDate))
           .replace(/\{total\}/g, order.totalAmount.toString())
           .replace(/\{advance\}/g, order.amountPaid.toString())
           .replace(/\{balance\}/g, pending.toString());
           
  return msg;
};
