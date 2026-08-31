import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Eye,
  Gift,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  Search,
  Trash2,
  Truck,
  UserRound,
  WalletCards,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import OrderBill from '../../components/OrderBill';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const tabs = [
  { id: 'pending', label: 'Pending', icon: Package },
  { id: 'preparing', label: 'Preparing', icon: CheckCircle2 },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  { id: 'rejected', label: 'Rejected', icon: Trash2 }
];

const statusColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  preparing: 'bg-violet-50 text-violet-700 border-violet-100',
  out_for_delivery: 'bg-blue-50 text-blue-700 border-blue-100',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rejected: 'bg-red-50 text-red-700 border-red-100'
};

const statusLabels = {
  pending: 'Pending',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  rejected: 'Rejected'
};

const paymentColors = {
  unpaid: 'bg-red-50 text-red-700 border-red-100',
  partial: 'bg-amber-50 text-amber-700 border-amber-100',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  refunded: 'bg-gray-50 text-gray-700 border-gray-100'
};

const statusOptions = ['pending', 'preparing', 'out_for_delivery', 'completed', 'rejected'];
const paymentOptions = ['unpaid', 'partial', 'paid', 'refunded'];
const paymentMethods = ['cash', 'upi', 'card', 'online', 'other'];

const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not provided';
const formatTime = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
const money = (value = 0) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const shortOrderId = (id = '') => `#${id.slice(-6).toUpperCase()}`;

const StoreOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [billOrder, setBillOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/store-orders`, authHeaders());
      setOrders(data || []);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(`${API_URL}/store-orders/${id}/status`, { status }, authHeaders());
      setOrders(prev => prev.map(order => order._id === id ? { ...order, ...data } : order));
      setSelectedOrder(prev => prev?._id === id ? { ...prev, ...data } : prev);
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const updatePayment = async (order, patch) => {
    try {
      const { data } = await axios.patch(`${API_URL}/store-orders/${order._id}/payment`, patch, authHeaders());
      setOrders(prev => prev.map(item => item._id === order._id ? { ...item, ...data } : item));
      setSelectedOrder(prev => prev?._id === order._id ? { ...prev, ...data } : prev);
      toast.success('Payment updated');
    } catch {
      toast.error('Failed to update payment');
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return;
    try {
      await axios.delete(`${API_URL}/store-orders/${id}`, authHeaders());
      setOrders(prev => prev.filter(order => order._id !== id));
      setSelectedOrder(prev => prev?._id === id ? null : prev);
      toast.success('Order deleted');
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const filteredOrders = useMemo(() => orders.filter(order => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = [
      order.customerName,
      order.phone,
      order.email,
      order.address,
      order._id,
      ...(order.items || []).map(item => item.name)
    ].filter(Boolean).join(' ').toLowerCase().includes(query);

    return order.status === activeTab && matchesSearch;
  }), [activeTab, orders, searchTerm]);

  const stats = useMemo(() => ({
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
    completed: orders.filter(o => o.status === 'completed').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
  }), [orders]);

  const detailOrder = selectedOrder && orders.find(order => order._id === selectedOrder._id) ? orders.find(order => order._id === selectedOrder._id) : selectedOrder;

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-black text-[rgb(var(--color-brown))]">Order Management</h3>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg border bg-white px-3 py-2 text-left shadow-sm transition-colors ${activeTab === tab.id ? 'border-[rgb(var(--color-brown))]' : 'border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))]'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase text-[rgb(var(--color-text-secondary))]">{tab.label}</p>
                  <p className="mt-0.5 text-lg font-black text-[rgb(var(--color-text-primary))]">{stats[tab.id]}</p>
                </div>
                <Icon className="h-4 w-4 text-[rgb(var(--color-brown))]" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white px-3 py-2 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-text-secondary))]" />
          <input
            type="text"
            placeholder="Search by order id, customer, phone, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[rgb(var(--color-border))] bg-white shadow-sm">
   

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px]">
            <thead className="border-b border-[rgb(var(--color-border))] bg-white">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">#</th>
                <th className="px-3 py-2 text-left text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Delivery</th>
                <th className="px-3 py-2 text-left text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Items</th>
                <th className="px-3 py-2 text-right text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Total</th>
                <th className="px-3 py-2 text-left text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Payment</th>
                <th className="px-3 py-2 text-left text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Status</th>
                <th className="px-3 py-2 text-center text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[rgb(var(--color-brown))] border-t-transparent" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-[rgb(var(--color-text-secondary))]">
                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="font-semibold">No {statusLabels[activeTab]?.toLowerCase()} orders found</p>
                  </td>
                </tr>
              ) : filteredOrders.map((order, idx) => {
                const itemCount = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                const firstItem = order.items?.[0];
                const balance = Math.max(Number(order.totalAmount || 0) - Number(order.amountPaid || 0), 0);

                return (
                  <tr key={order._id} className="transition-colors hover:bg-[rgb(var(--color-surface))]">
                    <td className="px-3 py-2">
                      <p className="font-mono text-xs font-black text-[rgb(var(--color-brown))]">{shortOrderId(order._id)}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="max-w-[140px] truncate text-sm font-bold text-[rgb(var(--color-text-primary))]">{order.customerName || 'Guest'}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">{order.phone || '—'}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-xs font-semibold text-[rgb(var(--color-text-primary))]">{formatDate(order.deliveryDate)}</p>
                      <p className="max-w-[150px] truncate text-xs text-[rgb(var(--color-text-secondary))]">{order.address || '—'}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="max-w-[160px] truncate text-xs font-semibold text-[rgb(var(--color-text-primary))]">{firstItem ? `${firstItem.name} x${firstItem.quantity}` : '—'}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">{itemCount} item{itemCount === 1 ? '' : 's'}{(order.items || []).length > 1 ? ` +${order.items.length - 1}` : ''}</p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <p className="text-xs font-black text-[rgb(var(--color-brown))]">{money(order.totalAmount)}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Bal {money(balance)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-black ${paymentColors[order.paymentStatus || 'unpaid']}`}>
                        {(order.paymentStatus || 'unpaid').toUpperCase()}
                      </span>
                      <p className="mt-0.5 text-xs capitalize text-[rgb(var(--color-text-secondary))]">{order.paymentMethod || 'cash'}</p>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`rounded-lg border px-2 py-1 text-xs font-black outline-none ${statusColors[order.status] || statusColors.pending}`}
                      >
                        {statusOptions.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => setSelectedOrder(order)} className="rounded-lg p-1.5 text-[rgb(var(--color-brown))] hover:bg-[rgb(var(--color-surface))]" title="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => setBillOrder(order)} className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50" title="View bill">
                          <Receipt className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => deleteOrder(order._id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
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

      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelectedOrder(null)}>
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[rgb(var(--color-border))] bg-white px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[rgb(var(--color-text-secondary))]">Complete Order Detail</p>
                <h3 className="mt-1 text-xl font-black text-[rgb(var(--color-brown))]">Order {shortOrderId(detailOrder._id)}</h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">Placed {formatDate(detailOrder.createdAt)} {formatTime(detailOrder.createdAt)}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface))]" aria-label="Close order detail">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_380px]">
              <div className="space-y-5">
                <section className="rounded-xl border border-[rgb(var(--color-border))] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-[rgb(var(--color-brown))]" />
                    <h4 className="font-black text-[rgb(var(--color-text-primary))]">Customer & Delivery</h4>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <DetailLine label="Customer" value={detailOrder.customerName || 'Guest customer'} />
                    <DetailLine label="Phone" value={detailOrder.phone || 'Not provided'} icon={<Phone className="h-4 w-4" />} />
                    <DetailLine label="Email" value={detailOrder.email || 'Not provided'} icon={<Mail className="h-4 w-4" />} />
                    <DetailLine label="Delivery Date" value={formatDate(detailOrder.deliveryDate)} icon={<Calendar className="h-4 w-4" />} />
                    <div className="md:col-span-2">
                      <DetailLine label="Address" value={detailOrder.address || 'Not provided'} icon={<MapPin className="h-4 w-4" />} />
                    </div>
                  </div>
                </section>

                {(detailOrder.dob || detailOrder.anniversaryDate || detailOrder.specialDate || detailOrder.specialDateDescription) && (
                  <section className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-rose-700">
                      <Gift className="h-5 w-5" />
                      <h4 className="font-black">Customer Dates</h4>
                    </div>
                    <div className="grid gap-3 text-sm md:grid-cols-2">
                      {detailOrder.dob && <DetailLine label="DOB" value={formatDate(detailOrder.dob)} />}
                      {detailOrder.anniversaryDate && <DetailLine label="Anniversary" value={formatDate(detailOrder.anniversaryDate)} />}
                      {detailOrder.specialDate && <DetailLine label="Special Date" value={formatDate(detailOrder.specialDate)} />}
                      {detailOrder.specialDateDescription && <DetailLine label="Special Details" value={detailOrder.specialDateDescription} />}
                    </div>
                  </section>
                )}

                <section className="rounded-xl border border-[rgb(var(--color-border))] p-4">
                  <h4 className="mb-3 font-black text-[rgb(var(--color-text-primary))]">Items</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px]">
                      <thead className="border-b border-[rgb(var(--color-border))]">
                        <tr>
                          <th className="py-2 text-left text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Item</th>
                          <th className="py-2 text-right text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Qty</th>
                          <th className="py-2 text-right text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Weight</th>
                          <th className="py-2 text-right text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Rate</th>
                          <th className="py-2 text-right text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgb(var(--color-border))]">
                        {(detailOrder.items || []).map((item, index) => (
                          <tr key={`${item.name}-${index}`}>
                            <td className="py-3 pr-3 text-sm font-bold text-[rgb(var(--color-text-primary))]">{item.name}</td>
                            <td className="py-3 text-right text-sm">{item.quantity || 0}</td>
                            <td className="py-3 text-right text-sm">{item.weight ? `${item.weight} ${item.weightUnit || ''}` : '-'}</td>
                            <td className="py-3 text-right text-sm">{money(item.price)}</td>
                            <td className="py-3 text-right text-sm font-black text-[rgb(var(--color-brown))]">{money(Number(item.price || 0) * Number(item.quantity || 0))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {detailOrder.notes && (
                  <section className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                    <span className="font-black">Notes: </span>{detailOrder.notes}
                  </section>
                )}
              </div>

              <aside className="space-y-4">
                <section className="rounded-xl border border-[rgb(var(--color-border))] p-4">
                  <h4 className="mb-3 font-black text-[rgb(var(--color-text-primary))]">Bill Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal</span><span>{money(detailOrder.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span>{detailOrder.deliveryCharge ? money(detailOrder.deliveryCharge) : 'FREE'}</span></div>
                    <div className="flex justify-between border-t border-[rgb(var(--color-border))] pt-3 text-lg font-black text-[rgb(var(--color-brown))]"><span>Total</span><span>{money(detailOrder.totalAmount)}</span></div>
                    <div className="flex justify-between"><span>Paid</span><span>{money(detailOrder.amountPaid || 0)}</span></div>
                    <div className="flex justify-between"><span>Balance</span><span>{money(Math.max(Number(detailOrder.totalAmount || 0) - Number(detailOrder.amountPaid || 0), 0))}</span></div>
                  </div>
                </section>

                <section className="rounded-xl border border-[rgb(var(--color-border))] p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-black text-[rgb(var(--color-text-primary))]">
                    <CreditCard className="h-5 w-5 text-[rgb(var(--color-brown))]" />
                    Payment & Status
                  </h4>
                  <div className="space-y-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold uppercase text-[rgb(var(--color-text-secondary))]">Order Status</span>
                      <select value={detailOrder.status || 'pending'} onChange={(e) => updateStatus(detailOrder._id, e.target.value)} className="w-full rounded-lg border border-[rgb(var(--color-border))] px-3 py-2 text-sm font-bold">
                        {statusOptions.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}
                      </select>
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold uppercase text-[rgb(var(--color-text-secondary))]">Payment Status</span>
                      <select value={detailOrder.paymentStatus || 'unpaid'} onChange={(e) => updatePayment(detailOrder, { paymentStatus: e.target.value })} className="w-full rounded-lg border border-[rgb(var(--color-border))] px-3 py-2 text-sm font-bold">
                        {paymentOptions.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold uppercase text-[rgb(var(--color-text-secondary))]">Payment Method</span>
                      <select value={detailOrder.paymentMethod || 'cash'} onChange={(e) => updatePayment(detailOrder, { paymentMethod: e.target.value })} className="w-full rounded-lg border border-[rgb(var(--color-border))] px-3 py-2 text-sm font-bold">
                        {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                      </select>
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold uppercase text-[rgb(var(--color-text-secondary))]">Amount Paid</span>
                      <input type="number" min="0" defaultValue={detailOrder.amountPaid || 0} onBlur={(e) => updatePayment(detailOrder, { amountPaid: e.target.value })} className="w-full rounded-lg border border-[rgb(var(--color-border))] px-3 py-2 text-sm font-bold" />
                    </label>
                    <button type="button" onClick={() => updatePayment(detailOrder, { paymentStatus: 'paid', amountPaid: detailOrder.totalAmount })} className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-700">
                      Mark Fully Paid
                    </button>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {billOrder && <OrderBill order={billOrder} onClose={() => setBillOrder(null)} />}
    </div>
  );
};

const DetailLine = ({ label, value, icon }) => (
  <div className="rounded-lg bg-[rgb(var(--color-surface))] p-3">
    <p className="mb-1 text-xs font-bold uppercase text-[rgb(var(--color-text-secondary))]">{label}</p>
    <p className="flex items-start gap-2 break-words font-semibold text-[rgb(var(--color-text-primary))]">
      {icon}
      <span>{value}</span>
    </p>
  </div>
);

export default StoreOrders;
