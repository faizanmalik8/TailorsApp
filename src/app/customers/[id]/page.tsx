"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Customer, Order, getMockCustomers, getMockOrders, formatWhatsAppNumber, generateWhatsAppMessage, getShopSettings } from '@/lib/store';
import { GARMENT_TEMPLATES } from '@/lib/constants';
import { IconChevronLeft, IconPlus, IconEdit, IconRulerMeasure, IconCheck, IconBrandWhatsapp } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { EditMeasurementModal } from '@/components/EditMeasurementModal';

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingGarment, setEditingGarment] = useState<string | null>(null);
  const resolvedParams = React.use(params);
  
  useEffect(() => {
    const loadData = () => {
      const customers = getMockCustomers();
      const allOrders = getMockOrders();
      const c = customers.find(x => x.id === resolvedParams.id);
      if (c) {
        setCustomer(c);
        setOrders(allOrders.filter(o => o.customerId === c.id).sort((a,b) => new Date(b.datePlaced).getTime() - new Date(a.datePlaced).getTime()));
      }
    };
    
    loadData();
    window.addEventListener('tailors_data_updated', loadData);
    return () => window.removeEventListener('tailors_data_updated', loadData);
  }, [resolvedParams.id]);

  if (!customer) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const measurementsKeys = Object.keys(customer.measurements);

  return (
    <div className="p-4 md:p-8 space-y-6 container mx-auto max-w-4xl pb-24">
      {editingGarment && (
        <EditMeasurementModal 
          customer={customer}
          garmentId={editingGarment}
          onClose={() => setEditingGarment(null)}
          onSaveSuccess={(updated) => setCustomer(updated)}
        />
      )}
      
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full">
          <IconChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#152A4A]">{customer.name}</h2>
          <p className="text-gray-500">{customer.phone}</p>
        </div>
      </div>
      
      <Link 
        href={`/customers/new?customerId=${customer.id}`}
        className="flex items-center justify-center gap-2 w-full bg-[#152A4A] text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-[#0c1a2e]"
      >
        <IconPlus /> Add New Order for {customer.name}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Past Measurements Box */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h3 className="font-bold text-xl text-[#152A4A] flex items-center gap-2">
            <IconRulerMeasure size={24} /> Saved Measurements
          </h3>
          
          {measurementsKeys.length === 0 ? (
            <p className="text-gray-500 text-sm">No measurements saved yet.</p>
          ) : (
            <div className="space-y-6">
              {measurementsKeys.map(garmentId => {
                const garment = GARMENT_TEMPLATES.find(g => g.id === garmentId);
                const garmentData = customer.measurements[garmentId];
                if (!garment) return null;

                return (
                  <div key={garmentId} className="border-2 border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-100 p-3 flex justify-between items-center">
                      <span className="font-bold text-[#152A4A]">{garment.name}</span>
                      <button 
                        onClick={() => setEditingGarment(garmentId)}
                        className="flex items-center gap-1 text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                      >
                        <IconEdit size={16} /> Edit
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-2 text-sm" dir="rtl">
                      {garment.fields.map(field => {
                        const data = garmentData[field.id];
                        if (!data || (!data.value && data.tags.length === 0)) return null;
                        
                        return (
                          <div key={field.id} className="flex flex-col border-b border-gray-50 pb-2 last:border-0">
                            <span className="text-xs text-gray-400">{field.labelUrdu}</span>
                            <span className="font-bold text-[#152A4A] text-base">{data.value || '-'}</span>
                            {data.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {data.tags.map((tag: string) => (
                                  <span key={tag} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-xl text-[#152A4A]">Order History</h3>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const garment = GARMENT_TEMPLATES.find(g => g.id === order.garmentId);
                const placedDate = parseISO(order.datePlaced);
                const isDelivered = order.status === 'delivered';
                
                return (
                  <div key={order.id} className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <div>
                        <p className="font-bold text-lg text-[#152A4A]">{order.quantity}x {garment?.name}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-md font-bold ${
                          isDelivered ? 'bg-gray-200 text-gray-700' :
                          order.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#152A4A]">Rs {order.totalAmount}</p>
                        <p className="text-xs text-amber-700 font-bold mt-1">Pending: Rs {Math.max(0, order.totalAmount - order.amountPaid)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 text-xs text-gray-500 gap-2">
                      <div>
                        <span className="block font-medium mb-0.5">Received Date</span>
                        <span className="text-gray-800">{format(placedDate, 'EEEE, dd MMM yyyy')}</span>
                      </div>
                      {isDelivered && order.dateDelivered && (
                        <div>
                          <span className="block font-medium mb-0.5 text-green-700 flex items-center gap-1"><IconCheck size={14}/> Delivered On</span>
                          <span className="text-gray-800">{format(parseISO(order.dateDelivered), 'EEEE, dd MMM yyyy')}</span>
                        </div>
                      )}
                      {!isDelivered && order.dueDate && (
                        <div>
                          <span className="block font-medium mb-0.5 text-amber-700">Expected Return</span>
                          <span className="text-gray-800">{format(parseISO(order.dueDate), 'EEEE, dd MMM yyyy')}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <button 
                        onClick={() => {
                          const garment = GARMENT_TEMPLATES.find(g => g.id === order.garmentId);
                          const settings = getShopSettings();
                          const msg = generateWhatsAppMessage('orderPlaced', customer, order, garment?.name || 'Dress', settings);
                          const url = `https://wa.me/${formatWhatsAppNumber(customer.phone)}?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg font-bold border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        <IconBrandWhatsapp size={18} /> Send Text Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
