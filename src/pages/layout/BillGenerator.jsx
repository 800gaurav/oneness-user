import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, Gift, Heart, Mail, MapPin, Phone, Plus, Cake, ShoppingBag, Trash2, User, CheckCircle, Percent, WalletCards } from 'lucide-react';
import toast from 'react-hot-toast';
import { billAPI, settingsAPI } from '../../services/api';
import { downloadInvoicePdf } from '../../utils/invoicePdf';

const emptyCustomer = { name: '', phone: '', email: '', address: '', birthday: '', anniversary: '', specialDay: '' };
const emptyItem     = { name: '', quantity: 1, price: 0, total: 0 };
const defaultSettings = { bakeryName: '', logo: '', address: '', phone: '', email: '', whatsappNumber: '', gst: '', messageFooter: '', defaultDiscount: 0, website: '' };

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const inp = 'h-9 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all';
const lbl = 'block text-xs font-bold text-[rgb(var(--color-text-secondary))] mb-1';

const BillGenerator = ({ embedded = false, onClose, onBillCreated }) => {
  const [customer, setCustomer]       = useState(emptyCustomer);
  const [items, setItems]             = useState([{ ...emptyItem }]);
  const [discount, setDiscount]       = useState(0);
  const [gstEnabled, setGstEnabled]   = useState(false);
  const [gstRate, setGstRate]         = useState(5);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [settings, setSettings]       = useState(defaultSettings);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await settingsAPI.get();
      const s = { ...defaultSettings, ...(r.data.data || {}) };
      setSettings(s);
      if (Number(s.defaultDiscount || 0) > 0) setDiscount(Number(s.defaultDiscount));
    } catch {}
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const subtotal      = useMemo(() => items.reduce((s, i) => s + Number(i.total || 0), 0), [items]);
  const taxableAmount = Math.max(subtotal - Number(discount || 0), 0);
  const tax           = gstEnabled ? (taxableAmount * Number(gstRate || 0)) / 100 : 0;
  const total         = taxableAmount + tax;

  const showField = (key) => {
    const field = settings.adminCustomerFields?.[key];
    if (typeof field === 'boolean') return field;
    return field?.visible !== false;
  };

  const isFieldRequired = (key) => {
    const field = settings.adminCustomerFields?.[key];
    if (typeof field === 'boolean') return false;
    return field?.required === true;
  };

  const setCust = (field, val) => setCustomer(p => ({ ...p, [field]: val }));

  const updateItem = (idx, field, val) => setItems(prev => prev.map((item, i) => {
    if (i !== idx) return item;
    const next = { ...item, [field]: val };
    if (field === 'quantity' || field === 'price')
      next.total = Number(next.quantity || 0) * Number(next.price || 0);
    return next;
  }));

  const resetForm = () => {
    setCustomer(emptyCustomer); setItems([{ ...emptyItem }]);
    setDiscount(0); setGstEnabled(false); setGstRate(5);
    setPaymentMethod('Cash'); setNotes('');
  };

  const previewBill = {
    billNumber: 'DRAFT', customer, items, subtotal, discount, tax,
    taxLabel: gstEnabled ? `GST (${gstRate}%)` : 'Tax',
    gstEnabled, gstRate, total, paymentMethod, notes,
    createdAt: new Date().toISOString()
  };

  const handleDownloadDraft = () => {
    if (!items.some(i => i.name.trim())) { toast.error('Add at least one item'); return; }
    downloadInvoicePdf(previewBill, settings);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) { toast.error('Name and phone required'); return; }
    if (!/^[0-9]{10}$/.test(customer.phone.replace(/\s+/g, ''))) { toast.error('Mobile number must be exactly 10 digits'); return; }
    if (items.some(i => !i.name.trim() || Number(i.quantity) <= 0 || Number(i.price) <= 0)) { toast.error('Fill all item fields'); return; }
    if (Number(discount || 0) > subtotal) { toast.error('Discount > subtotal'); return; }
    try {
      setLoading(true);
      const r = await billAPI.create({ customer, items, discount: Number(discount || 0), tax, taxLabel: gstEnabled ? `GST (${gstRate}%)` : 'Tax', gstEnabled, gstRate: gstEnabled ? Number(gstRate) : 0, paymentMethod, notes });
      const created = r.data.bill || r.data.data || r.data;
      downloadInvoicePdf(created, settings);
      toast.success('Bill saved & PDF downloaded');
      resetForm();
      onBillCreated?.(created);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        {embedded && (
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))]">
            <ArrowLeft className="h-4 w-4 text-[rgb(var(--color-brown))]" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-black text-[rgb(var(--color-brown))]">New Bill</h1>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Fill customer details and items to generate invoice</p>
        </div>
        {/* Live totals */}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 bg-white border border-[rgb(var(--color-border))] rounded-lg px-3 py-1.5 text-xs">
            <span className="text-[rgb(var(--color-text-secondary))]">Subtotal <span className="font-black text-[rgb(var(--color-text-primary))]">{money(subtotal)}</span></span>
            {gstEnabled && <span className="text-[rgb(var(--color-text-secondary))]">GST <span className="font-black text-[rgb(var(--color-text-primary))]">{money(tax)}</span></span>}
          </div>
          <div className="bg-[rgb(var(--color-brown))] text-white rounded-lg px-3 py-1.5 text-xs font-black">
            Total {money(total)}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_340px]">
        {/* Left */}
        <div className="space-y-3">

          {/* Customer */}
          <div className="bg-white border border-[rgb(var(--color-border))] rounded-xl p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-[rgb(var(--color-text-secondary))] mb-3 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Customer Details
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {showField('name') && (
                <div>
                  <label className={lbl}>Name {isFieldRequired('name') && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input value={customer.name} onChange={e => setCust('name', e.target.value)} className={`${inp} pl-8`} placeholder="Customer name" required={isFieldRequired('name')} />
                  </div>
                </div>
              )}
              {showField('phone') && (
                <div>
                  <label className={lbl}>Phone {isFieldRequired('phone') && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input type="tel" value={customer.phone} onChange={e => setCust('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className={`${inp} pl-8`} placeholder="10-digit mobile number" maxLength={10} required={isFieldRequired('phone')} />
                    {customer.phone && customer.phone.length !== 10 && (
                      <p className="text-[10px] text-red-500 mt-0.5">{customer.phone.length}/10 digits</p>
                    )}
                  </div>
                </div>
              )}
              {showField('email') && (
                <div>
                  <label className={lbl}>Email {isFieldRequired('email') && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input type="email" value={customer.email} onChange={e => setCust('email', e.target.value)} className={`${inp} pl-8`} placeholder="email@example.com" required={isFieldRequired('email')} />
                  </div>
                </div>
              )}
              {showField('address') && (
                <div>
                  <label className={lbl}>Address {isFieldRequired('address') && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input value={customer.address} onChange={e => setCust('address', e.target.value)} className={`${inp} pl-8`} placeholder="Delivery address" required={isFieldRequired('address')} />
                  </div>
                </div>
              )}
              {showField('dob') && (
                <div>
                  <label className={lbl}>Birthday {isFieldRequired('dob') && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <Cake className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input type="date" value={customer.birthday} onChange={e => setCust('birthday', e.target.value)} className={`${inp} pl-8`} required={isFieldRequired('dob')} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {showField('anniversaryDate') && (
                  <div>
                    <label className={lbl}>Anniversary {isFieldRequired('anniversaryDate') && <span className="text-red-500">*</span>}</label>
                    <div className="relative">
                      <Heart className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input type="date" value={customer.anniversary} onChange={e => setCust('anniversary', e.target.value)} className={`${inp} pl-7 text-xs`} required={isFieldRequired('anniversaryDate')} />
                    </div>
                  </div>
                )}
                {showField('specialDate') && (
                  <div>
                    <label className={lbl}>Special Day {isFieldRequired('specialDate') && <span className="text-red-500">*</span>}</label>
                    <div className="relative">
                      <Gift className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input type="date" value={customer.specialDay} onChange={e => setCust('specialDay', e.target.value)} className={`${inp} pl-7 text-xs`} required={isFieldRequired('specialDate')} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-[rgb(var(--color-border))] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" /> Items
              </p>
              <button type="button" onClick={() => setItems(p => [...p, { ...emptyItem }])}
                className="flex items-center gap-1 rounded-lg bg-[rgb(var(--color-brown))] px-2.5 py-1 text-xs font-bold text-white hover:opacity-90">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {/* Header row */}
              <div className="hidden md:grid md:grid-cols-[1fr_70px_90px_90px_36px] gap-2 px-1">
                {['Item Name', 'Qty', 'Rate (₹)', 'Total', ''].map(h => (
                  <span key={h} className="text-[10px] font-black uppercase text-[rgb(var(--color-text-secondary))]">{h}</span>
                ))}
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_70px_90px_90px_36px] md:items-center bg-[rgb(var(--color-surface))] rounded-lg p-2">
                  <div className="col-span-2 md:col-span-1">
                    <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)}
                      className={inp} placeholder="Item name" required />
                  </div>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value) || 0)}
                    className={inp} required />
                  <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(idx, 'price', Number(e.target.value) || 0)}
                    className={inp} required />
                  <div className="h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center px-2 text-xs font-black text-orange-900">
                    {money(item.total)}
                  </div>
                  <div className="flex justify-end">
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(p => p.filter((_, i) => i !== idx))}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <aside className="space-y-3">
          {/* Tax & Payment */}
          <div className="bg-white border border-[rgb(var(--color-border))] rounded-xl p-4 shadow-sm space-y-3">
            <p className="text-xs font-black uppercase text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5">
              <WalletCards className="h-3.5 w-3.5" /> Tax & Payment
            </p>

            <div>
              <label className={lbl}><Percent className="inline h-3 w-3 mr-1" />Discount (₹)</label>
              <input type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)}
                className={inp} placeholder="0.00" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2">
              <div>
                <p className="text-xs font-black text-[rgb(var(--color-text-primary))]">Enable GST</p>
                {gstEnabled && (
                  <input type="number" min="0" step="0.01" value={gstRate} onChange={e => setGstRate(Number(e.target.value) || 0)}
                    className="mt-1.5 h-8 w-24 rounded-lg border border-[rgb(var(--color-border))] bg-white px-2 text-xs font-bold outline-none" placeholder="Rate %" />
                )}
              </div>
              <input type="checkbox" checked={gstEnabled} onChange={e => setGstEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[rgb(var(--color-brown))]" />
            </div>

            <div>
              <label className={lbl}>Payment Mode</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inp}>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div>
              <label className={lbl}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full resize-none rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                placeholder="Notes, advance, delivery info..." />
            </div>
          </div>

          {/* Receipt preview */}
          <div className="bg-[#faf8f5] border border-dashed border-gray-300 rounded-xl p-4 space-y-3 text-xs">
            <div className="text-center border-b border-dashed border-gray-300 pb-3">
              <p className="font-black text-sm text-gray-800">{settings.bakeryName || 'Your Bakery'}</p>
              {settings.address && <p className="text-[10px] text-gray-500 mt-0.5">{settings.address}</p>}
              <span className="mt-1.5 inline-block rounded bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-900">DRAFT</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 border-b border-gray-200 pb-2">
              <span className="font-bold text-gray-700">{customer.name || 'Customer'}</span>
              <span>{paymentMethod}</span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {items.filter(i => i.name).length === 0
                ? <p className="text-center text-gray-400 italic py-2">No items yet</p>
                : items.filter(i => i.name).map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate text-gray-700 font-semibold">{item.name} ×{item.quantity}</span>
                    <span className="font-black text-gray-800 shrink-0 ml-2">{money(item.total)}</span>
                  </div>
                ))
              }
            </div>
            <div className="border-t border-gray-300 pt-2 space-y-1">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-{money(discount)}</span></div>}
              {gstEnabled && <div className="flex justify-between text-gray-500"><span>GST ({gstRate}%)</span><span>{money(tax)}</span></div>}
              <div className="flex justify-between font-black text-sm text-gray-900 pt-1 border-t border-dashed border-gray-300">
                <span>Total</span><span>{money(total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button type="button" onClick={handleDownloadDraft}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-white text-sm font-bold text-[rgb(var(--color-brown))] hover:bg-[rgb(var(--color-surface))]">
              <Download className="h-4 w-4" /> Draft PDF
            </button>
            <button type="submit" disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[rgb(var(--color-brown))] text-sm font-black text-white hover:opacity-90 disabled:opacity-50">
              {loading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <><CheckCircle className="h-4 w-4" /> Save & Download</>
              }
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default BillGenerator;
