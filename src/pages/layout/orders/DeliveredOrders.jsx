import { useState } from 'react';
import { Search, CheckCircle, Eye, IndianRupee, Phone, Download, Star } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

const DeliveredOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = [
    { id: 'ORD-001', customer: 'Priya Sharma', phone: '+91 98765 43210', items: 'Chocolate Cake, Pastries (6)', amount: 1250, date: '2024-06-22', time: '10:30 AM', rating: 5 },
    { id: 'ORD-004', customer: 'Vikram Singh', phone: '+91 98765 43213', items: 'Wedding Cake (5kg)', amount: 5500, date: '2024-06-21', time: '09:00 AM', rating: 5 },
    { id: 'ORD-009', customer: 'Meera Joshi', phone: '+91 98765 43218', items: 'Fruit Cake', amount: 950, date: '2024-06-20', time: '03:00 PM', rating: 4 },
    { id: 'ORD-010', customer: 'Karan Mehta', phone: '+91 98765 43219', items: 'Chocolate Brownies (12)', amount: 700, date: '2024-06-19', time: '11:30 AM', rating: 5 },
  ];

  const filteredOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Delivered Orders</p>
          <h3 className="text-xl font-bold text-green-600">{orders.length}</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Total Revenue</p>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">₹{(totalRevenue/1000).toFixed(1)}K</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Avg Rating</p>
          <h3 className="text-xl font-bold text-yellow-600">4.8 ⭐</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Repeat Customers</p>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">75%</h3>
        </div>
      </div>

      {/* Search & Export */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-[rgb(var(--color-border))]">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <input
              type="text"
              placeholder="Search delivered orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(var(--color-border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50 border-b border-[rgb(var(--color-border))]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Items</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Rating</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {filteredOrders.map((order, idx) => (
                <tr key={order.id} className="hover:bg-[rgb(var(--color-surface))] transition-colors group">
                  <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-tertiary))]">{idx+1}</td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{order.customer}</p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">{order.phone}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))] max-w-[180px] truncate">{order.items}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-green-600">₹{order.amount}</td>
                  <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))]">{order.date}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{order.rating}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedOrder({ ...order, status: 'Delivered' })} className="p-1.5 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => setSelectedOrder({ ...order, status: 'Delivered' })} className="p-1.5 hover:bg-green-50 rounded-lg">
                        <IndianRupee className="w-3.5 h-3.5 text-green-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center px-1">
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">Showing <span className="font-semibold text-green-600">{filteredOrders.length}</span> delivered orders</p>
      </div>

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default DeliveredOrders;
