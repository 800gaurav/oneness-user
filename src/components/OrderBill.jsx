import { useEffect, useState } from 'react';
import { X, Download, Printer, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { settingsAPI } from '../services/api';
import { downloadInvoicePdf } from '../utils/invoicePdf';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Normalize order from either Order model or StoreOrder model into a common bill shape
const normalize = (order) => {
  if (!order) return null;

  // StoreOrder has customerName, Order has customerId (populated object)
  const isStoreOrder = Boolean(order.customerName !== undefined);

  const customer = isStoreOrder
    ? { name: order.customerName, phone: order.phone, email: order.email, address: order.address }
    : {
        name: order.customerId?.name || order.customer?.name || 'Customer',
        phone: order.customerId?.phone || order.customer?.phone || '',
        email: order.customerId?.email || order.customer?.email || '',
        address: order.customerId?.address || order.customer?.address || '',
      };

  const items = (order.items || []).map(item => ({
    name: item.name,
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
    total: Number(item.total ?? (item.price * item.quantity) ?? 0),
    weight: item.weight ? `${item.weight} ${item.weightUnit || ''}`.trim() : '',
  }));

  const subtotal = isStoreOrder
    ? Number(order.subtotal || items.reduce((s, i) => s + i.total, 0))
    : items.reduce((s, i) => s + i.total, 0);

  return {
    billNumber: order.orderNumber || `#${(order._id || '').slice(-6).toUpperCase()}`,
    customer,
    items,
    subtotal,
    discount: Number(order.discountAmount || order.discount || 0),
    deliveryCharge: Number(order.deliveryCharge || 0),
    tax: 0,
    gstEnabled: false,
    total: Number(order.totalAmount || order.total || 0),
    paymentMethod: order.paymentMethod || 'cash',
    paymentStatus: order.paymentStatus || order.status || '',
    notes: order.notes || '',
    createdAt: order.createdAt || new Date().toISOString(),
    deliveryDate: order.deliveryDate,
    couponCode: order.couponCode || '',
  };
};

const OrderBill = ({ order, onClose }) => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    settingsAPI.get().then(r => setSettings(r.data.data || {})).catch(() => {});
  }, []);

  const bill = normalize(order);
  if (!bill) return null;

  const businessName = settings.bakeryName || 'Bakery';

  const handleDownload = () => downloadInvoicePdf(bill, settings);

  const handlePrint = () => {
    const printContent = document.getElementById('order-bill-print');
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`
      <html><head><title>Bill ${bill.billNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; background: white; }
        .bill { max-width: 700px; margin: 0 auto; padding: 24px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3d2b1f; padding-bottom: 16px; margin-bottom: 16px; }
        .biz-name { font-size: 20px; font-weight: 900; color: #3d2b1f; }
        .biz-info { font-size: 10px; color: #666; margin-top: 4px; line-height: 1.5; }
        .invoice-label { font-size: 24px; font-weight: 900; color: #3d2b1f; text-align: right; }
        .invoice-num { font-size: 11px; color: #666; text-align: right; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .meta-box { background: #faf8f5; border: 1px solid #e8e0d8; border-radius: 8px; padding: 12px; }
        .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 4px; }
        .meta-value { font-size: 12px; font-weight: 700; }
        .meta-sub { font-size: 10px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        thead tr { background: #3d2b1f; color: white; }
        th { padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        th:last-child, td:last-child { text-align: right; }
        td { padding: 8px 10px; font-size: 11px; border-bottom: 1px solid #e8e0d8; }
        tr:nth-child(even) td { background: #faf8f5; }
        .totals { margin-left: auto; width: 240px; }
        .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
        .total-final { display: flex; justify-content: space-between; padding: 8px 10px; background: #3d2b1f; color: white; border-radius: 6px; font-weight: 900; font-size: 14px; margin-top: 6px; }
        .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px dashed #ccc; font-size: 10px; color: #888; }
        .notes { background: #fffbf0; border: 1px solid #f0e0a0; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 11px; }
      </style></head><body>
      ${printContent.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <span className="text-sm font-black text-[rgb(var(--color-brown))]">Bill — {bill.billNumber}</span>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[rgb(var(--color-brown))] text-white rounded-lg hover:opacity-90">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div id="order-bill-print" className="bill p-6 space-y-4 text-sm">
          {/* Header */}
          <div className="header flex justify-between items-start border-b-2 border-[rgb(var(--color-brown))] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {settings.logo
                  ? <img src={settings.logo} alt={businessName} className="w-10 h-10 rounded-lg object-contain border" />
                  : <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-brown))] flex items-center justify-center text-white font-black text-sm">{businessName.charAt(0)}</div>
                }
                <span className="text-xl font-black text-[rgb(var(--color-brown))]">{businessName}</span>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5 ml-12">
                {settings.address && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{settings.address}</p>}
                {settings.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{settings.phone}</p>}
                {settings.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{settings.email}</p>}
                {settings.gst && <p className="font-semibold text-gray-600">GSTIN: {settings.gst}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[rgb(var(--color-brown))]">INVOICE</p>
              <p className="text-xs font-bold text-gray-500 mt-1">{bill.billNumber}</p>
              <p className="text-xs text-gray-400 mt-0.5">{fmtDate(bill.createdAt)}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgb(var(--color-surface))] rounded-lg p-3">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Bill To</p>
              <p className="font-black text-gray-800">{bill.customer.name || 'Customer'}</p>
              {bill.customer.phone && <p className="text-xs text-gray-500">{bill.customer.phone}</p>}
              {bill.customer.email && <p className="text-xs text-gray-500">{bill.customer.email}</p>}
              {bill.customer.address && <p className="text-xs text-gray-500">{bill.customer.address}</p>}
            </div>
            <div className="bg-[rgb(var(--color-surface))] rounded-lg p-3 text-right">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Details</p>
              <p className="text-xs"><span className="font-bold">Date:</span> {fmtDate(bill.createdAt)}</p>
              {bill.deliveryDate && <p className="text-xs"><span className="font-bold">Delivery:</span> {fmtDate(bill.deliveryDate)}</p>}
              <p className="text-xs capitalize"><span className="font-bold">Payment:</span> {bill.paymentMethod}</p>
              {bill.couponCode && <p className="text-xs"><span className="font-bold">Coupon:</span> {bill.couponCode}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[rgb(var(--color-brown))] text-white">
                <th className="px-3 py-2 text-left font-black uppercase">#</th>
                <th className="px-3 py-2 text-left font-black uppercase">Item</th>
                {bill.items.some(i => i.weight) && <th className="px-3 py-2 text-right font-black uppercase">Weight</th>}
                <th className="px-3 py-2 text-right font-black uppercase">Qty</th>
                <th className="px-3 py-2 text-right font-black uppercase">Rate</th>
                <th className="px-3 py-2 text-right font-black uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bill.items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[rgb(var(--color-surface))]'}>
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-gray-800">{item.name}</td>
                  {bill.items.some(it => it.weight) && <td className="px-3 py-2 text-right text-gray-500">{item.weight || '—'}</td>}
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{money(item.price)}</td>
                  <td className="px-3 py-2 text-right font-black text-[rgb(var(--color-brown))]">{money(item.total || item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-56 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{money(bill.subtotal)}</span></div>
              {bill.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>- {money(bill.discount)}</span></div>}
              {bill.deliveryCharge > 0 && <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-semibold">{money(bill.deliveryCharge)}</span></div>}
              <div className="flex justify-between bg-[rgb(var(--color-brown))] text-white rounded-lg px-3 py-2 mt-2 font-black text-sm">
                <span>Total</span><span>{money(bill.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-900">
              <span className="font-black">Notes: </span>{bill.notes}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-400 border-t border-dashed border-gray-200 pt-3">
            <p className="italic">"{settings.messageFooter || 'Thank you for your order!'}"</p>
            {settings.gst && <p className="mt-1 font-semibold text-gray-500">GSTIN: {settings.gst}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBill;
