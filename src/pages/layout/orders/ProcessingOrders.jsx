import { useState } from 'react';
import { Search, Package, Eye, Phone } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

const ProcessingOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const orders = [
    { id: 'ORD-002', customer: 'Rahul Verma', phone: '+91 98765 43211', items: 'Birthday Cake (2kg)', amount: 1800, date: '2024-06-23', time: '02:15 PM', progress: 60 },
    { id: 'ORD-006', customer: 'Amit Kumar', phone: '+91 98765 43215', items: 'Black Forest Cake', amount: 1100, date: '2024-06-24', time: '11:00 AM', progress: 30 },
  ];

  const filteredOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Processing Orders</p>
          <h3 className="text-xl font-bold text-blue-600">{orders.length}</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Processing Value</p>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">₹{orders.reduce((sum, o) => sum + o.amount, 0)}</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Avg Progress</p>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">45%</h3>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-[rgb(var(--color-border))]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
          <input
            type="text"
            placeholder="Search processing orders..."
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
            <thead className="bg-blue-50 border-b border-[rgb(var(--color-border))]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Items</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Progress</th>
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
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${order.progress}%` }} />
                      </div>
                      <span className="text-xs text-[rgb(var(--color-text-secondary))]">{order.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => setSelectedOrder({ ...order, status: 'Processing' })} className="p-1.5 hover:bg-blue-50 rounded-lg">
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
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">Showing <span className="font-semibold text-blue-600">{filteredOrders.length}</span> processing orders</p>
      </div>

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default ProcessingOrders;
