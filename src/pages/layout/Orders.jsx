import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Eye, Receipt, X, Phone, Calendar, UserRound, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';
import OrderBill from '../../components/OrderBill';

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const Orders = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [billOrder, setBillOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await orderAPI.getAll();
      setOrders(data || []);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return;
    try {
      await orderAPI.delete(id);
      setOrders(prev => prev.filter(o => o._id !== id));
      setSelectedOrder(null);
      toast.success('Order deleted');
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o =>
      [o.orderNumber, o.customerId?.name, o.customerId?.phone]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [orders, search]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
        <input
          type="text"
          placeholder="Search by order ID or customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(var(--color-border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))]">
              <tr>
                {['#', 'Order ID', 'Customer', 'Items', 'Amount', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {loading ? (
                <tr><td colSpan="7" className="px-3 py-10 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-[rgb(var(--color-brown))] border-t-transparent" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-3 py-10 text-center text-sm text-[rgb(var(--color-text-secondary))]">No orders found</td></tr>
              ) : filtered.map((order, idx) => {
                const itemSummary = (order.items || []).map(i => `${i.name} ×${i.quantity}`).join(', ') || '—';
                return (
                  <tr key={order._id} className="hover:bg-[rgb(var(--color-surface))] transition-colors group">
                    <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-tertiary))]">{idx + 1}</td>
                    <td className="px-3 py-2 text-xs font-mono font-black text-[rgb(var(--color-brown))]">{order.orderNumber}</td>
                    <td className="px-3 py-2">
                      <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{order.customerId?.name || '—'}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">{order.customerId?.phone || ''}</p>
                    </td>
                    <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))] max-w-[180px] truncate">{itemSummary}</td>
                    <td className="px-3 py-2 text-xs font-semibold text-[rgb(var(--color-text-primary))]">{money(order.totalAmount)}</td>
                    <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))]">{fmtDate(order.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="View details">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button onClick={() => setBillOrder(order)} className="p-1.5 hover:bg-amber-50 rounded-lg" title="View bill">
                          <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                        <button onClick={() => deleteOrder(order._id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 border-t border-[rgb(var(--color-border))]">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
            <span className="font-semibold text-[rgb(var(--color-brown))]">{filtered.length}</span> of {orders.length} orders
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[rgb(var(--color-border))] px-4 py-3">
              <div>
                <h2 className="font-black text-[rgb(var(--color-text-primary))]">{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">{fmtDate(selectedOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setBillOrder(selectedOrder); setSelectedOrder(null); }} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100">
                  <Receipt className="w-3.5 h-3.5" /> Bill
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-[rgb(var(--color-surface))] rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <UserRound className="w-4 h-4 text-[rgb(var(--color-brown))]" />
                <span className="font-semibold">{selectedOrder.customerId?.name || '—'}</span>
              </div>
              {selectedOrder.customerId?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[rgb(var(--color-brown))]" />
                  <span>{selectedOrder.customerId.phone}</span>
                </div>
              )}
              {selectedOrder.deliveryDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[rgb(var(--color-brown))]" />
                  <span>Delivery: {fmtDate(selectedOrder.deliveryDate)}</span>
                </div>
              )}
              {(selectedOrder.items || []).length > 0 && (
                <div className="bg-[rgb(var(--color-surface))] rounded-lg p-3 space-y-1">
                  <p className="text-xs font-black uppercase text-[rgb(var(--color-text-secondary))] mb-2">Items</p>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-semibold">{money(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedOrder.notes && (
                <p className="text-xs bg-amber-50 rounded-lg px-3 py-2 text-amber-800">
                  <span className="font-black">Notes: </span>{selectedOrder.notes}
                </p>
              )}
              <div className="flex justify-end pt-2 border-t border-[rgb(var(--color-border))]">
                <span className="font-black text-[rgb(var(--color-brown))] text-lg">{money(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {billOrder && <OrderBill order={billOrder} onClose={() => setBillOrder(null)} />}
    </div>
  );
};

export default Orders;
