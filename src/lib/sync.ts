import { supabase } from './supabase';
import { SyncAction, getMockCustomers, getMockOrders } from './store';

export const processSyncQueue = async () => {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const shop_id = session.user.id;
  const queueStr = localStorage.getItem('tailors_sync_queue');
  if (!queueStr) return;
  
  const queue: SyncAction[] = JSON.parse(queueStr);
  if (queue.length === 0) return;

  const remainingQueue: SyncAction[] = [];

  for (const action of queue) {
    try {
      if (action.type === 'UPSERT_CUSTOMER') {
        const { error } = await supabase.from('customers').upsert({
          id: action.payload.id,
          shop_id,
          name: action.payload.name,
          phone: action.payload.phone,
          measurements: action.payload.measurements,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      } else if (action.type === 'UPSERT_ORDER') {
        const { error } = await supabase.from('orders').upsert({
          id: action.payload.id,
          shop_id,
          customer_id: action.payload.customerId,
          garment_id: action.payload.garmentId,
          quantity: action.payload.quantity,
          total_amount: action.payload.totalAmount,
          amount_paid: action.payload.amountPaid,
          status: action.payload.status,
          date_placed: action.payload.datePlaced,
          due_date: action.payload.dueDate,
          date_delivered: action.payload.dateDelivered,
          payment_logs: action.payload.paymentLogs,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      }
    } catch (e) {
      console.error('Sync error for action:', action, e);
      remainingQueue.push(action);
    }
  }

  localStorage.setItem('tailors_sync_queue', JSON.stringify(remainingQueue));
};

export const pullFromSupabase = async () => {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  try {
    const queueStr = localStorage.getItem('tailors_sync_queue');
    const queue = queueStr ? JSON.parse(queueStr) : [];
    
    // Only pull and overwrite if there are no pending local changes to avoid destroying offline work
    if (queue.length === 0) {
      const { data: customers } = await supabase.from('customers').select('*').eq('shop_id', session.user.id);
      if (customers) {
        const formattedCustomers = customers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          measurements: c.measurements || {}
        }));
        localStorage.setItem('tailors_customers', JSON.stringify(formattedCustomers));
      }

      const { data: orders } = await supabase.from('orders').select('*').eq('shop_id', session.user.id);
      if (orders) {
        const formattedOrders = orders.map(o => ({
          id: o.id,
          customerId: o.customer_id,
          garmentId: o.garment_id,
          quantity: Number(o.quantity),
          status: o.status,
          totalAmount: Number(o.total_amount),
          amountPaid: Number(o.amount_paid),
          datePlaced: o.date_placed,
          dueDate: o.due_date,
          dateDelivered: o.date_delivered,
          measurementSnapshot: {},
          paymentLogs: o.payment_logs || []
        }));
        localStorage.setItem('tailors_orders', JSON.stringify(formattedOrders));
      }
    }
  } catch (e) {
    console.error('Error pulling from Supabase:', e);
  }
};
