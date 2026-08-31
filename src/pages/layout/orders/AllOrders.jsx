import { useState } from 'react';
import { Search, Download, Plus, Eye, IndianRupee, Phone, Clock, CheckCircle, Package, XCircle } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

const AllOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = [
    { id: 'ORD-001', customer: 'Priya Sharma', phone: '+91 98765 43210', items: 'Chocolate Cake, Pastries (6)', amount: 1250, status: 'Delivered', date: '2024-06-22', time: '10:30 AM' },
    { id: 'ORD-002', customer: 'Rahul Verma', phone: '+91 98765 43211', items: 'Birthday Cake (2kg)', amount: 1800, status: 'Processing', date: '2024-06-23', time: '02:15 PM' },
    { id: 'ORD-003', customer: 'Anjali Patel', phone: '+91 98765 43212', items: 'Cupcakes (12), Cookies', amount: 850, status: 'Pending', date: '2024-06-23', time: '04:45 PM' },
    { id: 'ORD-004', customer: 'Vikram Singh', phone: '+91 98765 43213', items: 'Wedding Cake (5kg)', amount: 5500, status: 'Delivered', date: '2024-06-21', time: '09:00 AM' },
    { id: 'ORD-005', customer: 'Sneha Reddy', phone: '+91 98765 43214', items: 'Brownies, Muffins (6)', amount: 650, status: 'Cancelled', date: '2024-06-20', time: '11:20 AM' },
    { id: 'ORD-006', customer: 'Amit Kumar', phone: '+91 98765 43215', items: 'Black Forest Cake', amount: 1100, status: 'Processing', date: '2024-06-24', time: '11:00 AM' },
  ];

  const statusConfig = {
    Pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    Processing: { color: 'bg-blue-100 text-blue-700', icon: Package },
    Delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    Cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const filteredOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, order) => order.status !== 'Cancelled' ? sum + order.amount : sum, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Total Orders</p>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">{orders.length}</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Total Revenue</p>
          <h3 className="text-xl font-bold text-green-600">₹{(totalRevenue/1000).toFixed(1)}K</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Avg Order Value</p>
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">₹{Math.round(totalRevenue/orders.length)}</h3>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Success Rate</p>
          <h3 className="text-xl font-bold text-green-600">95%</h3>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-[rgb(var(--color-border))]">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
         
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(var(--color-border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Items</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {filteredOrders.map((order, idx) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <tr key={order.id} className="hover:bg-[rgb(var(--color-surface))] transition-colors group">
                    <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-tertiary))]">{idx+1}</td>
                    <td className="px-3 py-2">
                      <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{order.customer}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">{order.phone}</p>
                    </td>
                    <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))] max-w-[180px] truncate">{order.items}</td>
                    <td className="px-3 py-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">₹{order.amount}</td>
                    <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))]">{order.date}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="View Details">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-green-50 rounded-lg" title="Bill">
                          <IndianRupee className="w-3.5 h-3.5 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center px-1">
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">Showing <span className="font-semibold text-[rgb(var(--color-brown))]">{filteredOrders.length}</span> of {orders.length} orders</p>
      </div>

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default AllOrders;
