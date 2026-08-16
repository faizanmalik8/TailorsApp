"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getMockOrders, getMockCustomers, Order, Customer, saveMockOrder, getMessageTemplates, generateId, formatWhatsAppNumber, generateWhatsAppMessage, getShopSettings } from '@/lib/store';
import { GARMENT_TEMPLATES } from '@/lib/constants';
import { Receipt } from '@/components/Receipt';
import { IconBrandWhatsapp, IconCheck, IconScissors, IconSearch } from '@tabler/icons-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

function ActiveOrdersContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') === 'ledger' ? 'ledger' : 'active';
  
  const [tab, setTab] = useState<'active' | 'ledger'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<{order: Order, customer: Customer} | null>(null);
  
  // Search state for ledger
  const [ledgerSearch, setLedgerSearch] = useState('');
  
  useEffect(() => {
    setOrders(getMockOrders());
    setCustomers(getMockCustomers());
  }, []);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status: newStatus };
        saveMockOrder(updated);
        return updated;
      }
      return o;
    });
    setOrders(updatedOrders);
  };

  const handleMarkDone = (order: Order) => {
    if (window.confirm("Are you sure you want to mark this order as delivered? This will remove it from the active list.")) {
      const updated = { ...order, status: 'delivered' as const, dateDelivered: new Date().toISOString() };
      const updatedOrders = orders.map(o => o.id === order.id ? updated : o);
      saveMockOrder(updated);
      setOrders(updatedOrders);
    }
  };

  const handleAddPayment = (orderId: string, amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;
    
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        const currentPaid = Number(o.amountPaid) || 0;
        const updated = { 
          ...o, 
          amountPaid: currentPaid + amount,
          paymentLogs: [...(o.paymentLogs || []), { id: generateId(), date: new Date().toISOString(), amount }]
        };
        saveMockOrder(updated);
        return updated;
      }
      return o;
    });
    setOrders(updatedOrders);
  };

  const handleNotify = (order: Order, type: 'ready' | 'remind') => {
    const customer = customers.find(c => c.id === order.customerId);
    if (!customer) return;
    
    const settings = getShopSettings();
    const garment = GARMENT_TEMPLATES.find(g => g.id === order.garmentId)?.name || 'Dress';
    
    const templateName = type === 'ready' ? 'orderReady' : 'paymentReminder';
    const msg = generateWhatsAppMessage(templateName, customer, order, garment, settings);
    
    const url = `https://wa.me/${formatWhatsAppNumber(customer.phone)}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered').sort((a,b) => new Date(a.datePlaced).getTime() - new Date(b.datePlaced).getTime());
  
  // Ledger filters (Show any order with pending dues, regardless of if it is delivered or not)
  let ledgerOrders = orders.filter(o => {
    const total = Number(o.totalAmount) || 0;
    const paid = Number(o.amountPaid) || 0;
    return total > paid;
  });

  if (ledgerSearch.trim() !== '') {
    const query = ledgerSearch.toLowerCase();
    ledgerOrders = ledgerOrders.filter(o => {
      const customer = customers.find(c => c.id === o.customerId);
      if (!customer) return false;
      return customer.name.toLowerCase().includes(query) || customer.phone.includes(query);
    });
  }

  const groupOrdersByDate = (ordersList: Order[]) => {
    const sorted = [...ordersList].sort((a, b) => {
      const da = a.dateDelivered ? new Date(a.dateDelivered) : new Date(a.datePlaced);
      const db = b.dateDelivered ? new Date(b.dateDelivered) : new Date(b.datePlaced);
      return db.getTime() - da.getTime();
    });
    
    const groups: { dateLabel: string; orders: Order[] }[] = [];
    
    sorted.forEach(order => {
      const dStr = order.dateDelivered || order.datePlaced;
      const d = parseISO(dStr);
      let label = format(d, 'dd MMM yyyy');
      if (isToday(d)) label = 'Today';
      else if (isYesterday(d)) label = 'Yesterday';
      
      let group = groups.find(g => g.dateLabel === label);
      if (!group) {
        group = { dateLabel: label, orders: [] };
        groups.push(group);
      }
      group.orders.push(order);
    });
    return groups;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 container mx-auto max-w-4xl pb-24">
      {receiptOrder && (
        <Receipt 
          order={receiptOrder.order} 
          customer={receiptOrder.customer} 
          onClose={() => setReceiptOrder(null)} 
        />
      )}
      <h2 className="text-2xl font-bold text-[#152A4A] border-b border-gray-200 pb-4">Orders & Payments</h2>
      
      {/* Tabs */}
      <div className="flex bg-gray-200 p-1 rounded-lg">
        <button 
          onClick={() => setTab('active')}
          className={`flex-1 py-2 font-bold text-center rounded-md transition-colors ${tab === 'active' ? 'bg-white text-[#152A4A] shadow' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button 
          onClick={() => setTab('ledger')}
          className={`flex-1 py-2 font-bold text-center rounded-md transition-colors ${tab === 'ledger' ? 'bg-white text-amber-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Ledger ({orders.filter(o => (Number(o.totalAmount) || 0) > (Number(o.amountPaid) || 0)).length})
        </button>
      </div>

      <div className="space-y-4">
        {tab === 'active' && (
          activeOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No active orders found.</p>
          ) : (
            groupOrdersByDate(activeOrders).map(group => (
              <div key={group.dateLabel} className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1 mt-6">{group.dateLabel}</h3>
                {group.orders.map(order => {
                  const customer = customers.find(c => c.id === order.customerId);
                  const garment = GARMENT_TEMPLATES.find(g => g.id === order.garmentId);
                  if (!customer) return null;
                  
                  return (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <Link href={`/customers/${customer.id}`} className="hover:opacity-70 transition-opacity">
                          <h3 className="font-bold text-lg text-[#152A4A] flex items-center gap-1">
                            {customer.name} 
                            <IconSearch size={16} className="text-gray-400" />
                          </h3>
                          <p className="text-sm text-gray-500">{customer.phone} • {order.quantity}x {garment?.name}</p>
                        </Link>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Due: {order.dueDate ? format(parseISO(order.dueDate), 'MMM d, yyyy') : 'N/A'}</p>
                          <button 
                            onClick={() => setReceiptOrder({ order, customer })}
                            className="text-xs text-[#152A4A] underline mt-1 font-bold"
                          >
                            Receipt
                          </button>
                        </div>
                      </div>

                      {/* Status Pipeline */}
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                        <button 
                          onClick={() => handleStatusChange(order.id, 'received')}
                          className={`flex flex-col items-center flex-1 ${order.status === 'received' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}
                        >
                          <IconScissors size={20} /> Received
                        </button>
                        <div className="w-4 border-t border-gray-300"></div>
                        <button 
                          onClick={() => handleStatusChange(order.id, 'ready')}
                          className={`flex flex-col items-center flex-1 ${order.status === 'ready' ? 'text-green-600 font-bold' : 'text-gray-400'}`}
                        >
                          <IconCheck size={20} /> Ready
                        </button>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button 
                          onClick={() => handleNotify(order, 'ready')}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 font-bold py-2 rounded-lg border border-green-200 hover:bg-green-100"
                        >
                          <IconBrandWhatsapp size={18} /> Notify
                        </button>
                        <button 
                          onClick={() => handleMarkDone(order)}
                          className="flex-1 bg-[#152A4A] text-white font-bold py-2 rounded-lg hover:bg-[#0c1a2e]"
                        >
                          Deliver
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )
        )}

        {tab === 'ledger' && (
          <>
            <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-[#152A4A] overflow-hidden bg-white shadow-sm px-3">
              <IconSearch size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search ledger by name or phone..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="w-full p-3 outline-none"
              />
            </div>
            
            {ledgerOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No pending dues match your search.</p>
            ) : (
              groupOrdersByDate(ledgerOrders).map(group => (
                <div key={group.dateLabel} className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1 mt-6">{group.dateLabel}</h3>
                  {group.orders.map(order => {
                    const customer = customers.find(c => c.id === order.customerId);
                    const garment = GARMENT_TEMPLATES.find(g => g.id === order.garmentId);
                    const total = Number(order.totalAmount) || 0;
                    const paid = Number(order.amountPaid) || 0;
                    const balance = Math.max(0, total - paid);
                    if (!customer) return null;
                    
                    return (
                      <div key={order.id} className="bg-white border-2 border-amber-200 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-xl text-[#152A4A]">{customer.name}</h3>
                            <p className="text-sm font-medium text-gray-500">{customer.phone}</p>
                          </div>
                          <div className="text-right bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                            <p className="text-2xl font-bold text-amber-700">Rs {balance}</p>
                            <p className="text-xs font-bold text-amber-700/60 uppercase tracking-wider">Pending Due</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 text-sm grid grid-cols-2 gap-2 text-gray-600">
                          <div>
                            <span className="block text-xs text-gray-400">Order Details</span>
                            <span className="font-medium text-[#152A4A]">{order.quantity}x {garment?.name}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-400">Date</span>
                            <span className="font-medium text-[#152A4A]">{order.dateDelivered ? format(parseISO(order.dateDelivered), 'dd MMM yyyy') : format(parseISO(order.datePlaced), 'dd MMM yyyy')}</span>
                          </div>
                        </div>

                        {order.paymentLogs && order.paymentLogs.length > 0 && (
                          <div className="bg-white border border-gray-100 rounded-lg p-3 text-sm space-y-2">
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment History</span>
                            {order.paymentLogs.map(log => (
                              <div key={log.id} className="flex justify-between items-center text-gray-600 border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                <span>{format(parseISO(log.date), 'dd MMM yyyy, h:mm a')}</span>
                                <span className="font-medium text-green-600">+Rs {log.amount}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button 
                            onClick={() => {
                              const amt = prompt(`Enter amount paid by ${customer.name} (Max: ${balance}):`);
                              if (amt) handleAddPayment(order.id, amt);
                            }}
                            className="flex-1 bg-amber-100 text-amber-800 font-bold py-3 rounded-lg hover:bg-amber-200 transition-colors"
                          >
                            Log Payment
                          </button>
                          <button 
                            onClick={() => handleNotify(order, 'remind')}
                            className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 font-bold py-3 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                          >
                            <IconBrandWhatsapp size={20} /> Remind
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ActiveOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Orders...</div>}>
      <ActiveOrdersContent />
    </Suspense>
  );
}
