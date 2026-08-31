import { Calendar, IndianRupee, Package, Phone, Star, UserRound, X } from 'lucide-react';

const parseItems = (items = '') => items
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : parseItems(order.items);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[rgb(var(--color-brown))] shadow-sm">
              <Package className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-[rgb(var(--color-text-primary))]">Order {order.id}</h2>
              <p className="text-xs font-semibold text-[rgb(var(--color-text-secondary))]">
                {order.status || 'Order details'} {order.date ? `- ${order.date}` : ''} {order.time ? `at ${order.time}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[rgb(var(--color-text-secondary))] hover:bg-white" aria-label="Close order details">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-[rgb(var(--color-border))] p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-black text-[rgb(var(--color-text-primary))]">
                  <UserRound className="h-4 w-4 text-[rgb(var(--color-brown))]" />
                  Customer Details
                </p>
                <div className="space-y-2 text-sm font-semibold text-[rgb(var(--color-text-secondary))]">
                  <p className="text-base font-black text-[rgb(var(--color-text-primary))]">{order.customer}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {order.phone}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgb(var(--color-border))] p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-black text-[rgb(var(--color-text-primary))]">
                  <Package className="h-4 w-4 text-[rgb(var(--color-brown))]" />
                  Items
                </p>
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const name = typeof item === 'string' ? item : item.name;
                    const quantity = typeof item === 'string' ? null : item.quantity;
                    const price = typeof item === 'string' ? null : item.price;

                    return (
                      <div key={`${name}-${index}`} className="flex justify-between gap-3 rounded-xl bg-[rgb(var(--color-surface))] p-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-bold text-[rgb(var(--color-text-primary))]">{name}</p>
                          {quantity && <p className="text-xs font-semibold text-[rgb(var(--color-text-secondary))]">Qty {quantity}</p>}
                        </div>
                        {price !== null && (
                          <p className="shrink-0 font-black text-[rgb(var(--color-brown))]">₹{Number(price * (quantity || 1)).toLocaleString('en-IN')}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="space-y-3">
              <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4">
                <p className="mb-1 text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">Total Amount</p>
                <p className="flex items-center text-3xl font-black text-[rgb(var(--color-brown))]">
                  <IndianRupee className="h-6 w-6" />
                  {Number(order.amount || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="rounded-2xl border border-[rgb(var(--color-border))] p-4 text-sm font-semibold text-[rgb(var(--color-text-secondary))]">
                <p className="mb-3 flex items-center gap-2 text-sm font-black text-[rgb(var(--color-text-primary))]">
                  <Calendar className="h-4 w-4 text-[rgb(var(--color-brown))]" />
                  Order Timeline
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between gap-3"><span>Date</span><span className="font-black text-[rgb(var(--color-text-primary))]">{order.date || '-'}</span></div>
                  <div className="flex justify-between gap-3"><span>Time</span><span className="font-black text-[rgb(var(--color-text-primary))]">{order.time || '-'}</span></div>
                  {order.status && <div className="flex justify-between gap-3"><span>Status</span><span className="font-black text-[rgb(var(--color-text-primary))]">{order.status}</span></div>}
                </div>
              </div>

              {order.progress !== undefined && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm font-black text-blue-800">
                    <span>Progress</span>
                    <span>{order.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-blue-100">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${order.progress}%` }} />
                  </div>
                </div>
              )}

              {order.rating !== undefined && (
                <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                  <p className="mb-2 text-xs font-black uppercase text-yellow-700">Customer Rating</p>
                  <div className="flex items-center gap-2 text-lg font-black text-[rgb(var(--color-text-primary))]">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    {order.rating}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
