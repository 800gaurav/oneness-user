import { useState } from 'react';
import { Search, Clock, Eye, Phone } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

const PendingOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const orders = [
    { id: 'ORD-003', customer: 'Anjali Patel', phone: '+91 98765 43212', items: 'Cupcakes (12), Cookies', amount: 850, date: '2024-06-23', time: '04:45 PM' },
    { id: 'ORD-007', customer: 'Pooja Desai', phone: '+91 98765 43216', items: 'Vanilla Cake', amount: 900, date: '2024-06-24', time: '09:30 AM' },
    { id: 'ORD-008', customer: 'Rajesh Gupta', phone: '+91 98765 43217', items: 'Pastries (12)', amount: 600, date: '2024-06-24', time: '10:15 AM' },
  ];

  const filteredOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Pending Orders</p>
          <h3 className="text-xl font-bold text-yellow-600">{orders.length}</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Pending Value</p>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">₹{orders.reduce((sum, o) => sum + o.amount, 0)}</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Avg Wait Time</p>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">2.5 hrs</h3>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-[rgb(var(--color-border))]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
          <input
            type="text"
            placeholder="Search pending orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(var(--color-border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-yellow-50 border-b border-[rgb(var(--color-border))]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Items</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {filteredOrders.map((order, idx) => (
                <tr key={order.id} className="hover:bg-[rgb(var(--color-surface))] transition-colors">
                  <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-tertiary))]">{idx+1}</td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{order.customer}</p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">{order.phone}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))] max-w-[180px] truncate">{order.items}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">₹{order.amount}</td>
                  <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))]">{order.date}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => setSelectedOrder({ ...order, status: 'Pending' })} className="p-1.5 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center px-1">
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">Showing <span className="font-semibold text-yellow-600">{filteredOrders.length}</span> pending orders</p>
      </div>

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default PendingOrders;
