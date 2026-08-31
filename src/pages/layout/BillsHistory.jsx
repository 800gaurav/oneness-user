import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Download, IndianRupee, Package, Plus, Search, Trash2, FileText, Eye, X, Phone, MapPin, Mail, Building2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { billAPI, settingsAPI } from '../../services/api';
import { downloadInvoicePdf } from '../../utils/invoicePdf';
import BillGenerator from './BillGenerator';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (v) => v ? new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

const paymentStyle = {
  Cash:   'bg-amber-50 text-amber-800 border-amber-100',
  Card:   'bg-blue-50 text-blue-800 border-blue-100',
  UPI:    'bg-purple-50 text-purple-800 border-purple-100',
  Online: 'bg-indigo-50 text-indigo-800 border-indigo-100',
};

// ── Bill Preview Modal ──────────────────────────────────────────────────────
const BillPreview = ({ bill, settings, onClose }) => {
  const businessName = settings.bakeryName || 'Bakery';

  const handlePrint = () => {
    const el = document.getElementById('bill-preview-content');
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`<html><head><title>${bill.billNumber}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;padding:24px}
        .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #5c3a21;padding-bottom:12px;margin-bottom:12px}
        .biz{font-size:18px;font-weight:900;color:#5c3a21}.biz-sub{font-size:10px;color:#666;margin-top:3px;line-height:1.5}
        .inv-label{font-size:22px;font-weight:900;color:#5c3a21;text-align:right}.inv-num{font-size:11px;color:#888;text-align:right}
        .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .meta-box{background:#faf8f5;border:1px solid #e8e0d8;border-radius:6px;padding:10px}
        .meta-lbl{font-size:9px;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:3px}
        .meta-val{font-size:12px;font-weight:700}.meta-sub{font-size:10px;color:#666}
        table{width:100%;border-collapse:collapse;margin-bottom:12px}
        thead tr{background:#5c3a21;color:#fff}
        th{padding:7px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase}
        th:last-child,td:last-child{text-align:right}
        td{padding:7px 10px;font-size:11px;border-bottom:1px solid #e8e0d8}
        tr:nth-child(even) td{background:#faf8f5}
        .totals{margin-left:auto;width:220px}
        .t-row{display:flex;justify-content:space-between;padding:3px 0;font-size:11px}
        .t-final{display:flex;justify-content:space-between;padding:7px 10px;background:#5c3a21;color:#fff;border-radius:5px;font-weight:900;font-size:13px;margin-top:5px}
        .notes{background:#fffbf0;border:1px solid #f0e0a0;border-radius:5px;padding:8px;margin-bottom:10px;font-size:11px}
        .footer{text-align:center;margin-top:16px;padding-top:10px;border-top:1px dashed #ccc;font-size:10px;color:#888}
      </style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.focus(); win.print(); win.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b px-4 py-2.5">
          <span className="text-sm font-black text-[rgb(var(--color-brown))]">{bill.billNumber}</span>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={() => downloadInvoicePdf(bill, settings)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[rgb(var(--color-brown))] text-white rounded-lg hover:opacity-90">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Bill Content */}
        <div id="bill-preview-content" className="p-5 space-y-4 text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[rgb(var(--color-brown))] pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {settings.logo
                  ? <img src={settings.logo} alt={businessName} className="w-9 h-9 rounded-lg object-contain border" />
                  : <div className="w-9 h-9 rounded-lg bg-[rgb(var(--color-brown))] flex items-center justify-center text-white font-black text-sm">{businessName.charAt(0)}</div>
                }
                <span className="text-lg font-black text-[rgb(var(--color-brown))]">{businessName}</span>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5 ml-11">
                {settings.address && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{settings.address}</p>}
                {settings.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{settings.phone}</p>}
                {settings.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{settings.email}</p>}
                {settings.gst && <p className="font-semibold text-gray-600">GSTIN: {settings.gst}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[rgb(var(--color-brown))]">INVOICE</p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">{bill.billNumber}</p>
              <p className="text-xs text-gray-400">{fmtDate(bill.createdAt)}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[rgb(var(--color-surface))] rounded-lg p-3">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Bill To</p>
              <p className="font-black text-gray-800">{bill.customer?.name || 'Walk-in Customer'}</p>
              {bill.customer?.phone && <p className="text-xs text-gray-500">{bill.customer.phone}</p>}
              {bill.customer?.email && <p className="text-xs text-gray-500">{bill.customer.email}</p>}
              {bill.customer?.address && <p className="text-xs text-gray-500">{bill.customer.address}</p>}
            </div>
            <div className="bg-[rgb(var(--color-surface))] rounded-lg p-3 text-right">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Details</p>
              <p className="text-xs"><span className="font-bold">Date:</span> {fmtDate(bill.createdAt)}</p>
              <p className="text-xs"><span className="font-bold">Time:</span> {fmtTime(bill.createdAt)}</p>
              <p className="text-xs capitalize"><span className="font-bold">Payment:</span> {bill.paymentMethod || 'Cash'}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[rgb(var(--color-brown))] text-white">
                <th className="px-3 py-2 text-left font-black uppercase">#</th>
                <th className="px-3 py-2 text-left font-black uppercase">Item</th>
                <th className="px-3 py-2 text-right font-black uppercase">Qty</th>
                <th className="px-3 py-2 text-right font-black uppercase">Rate</th>
                <th className="px-3 py-2 text-right font-black uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(bill.items || []).map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[rgb(var(--color-surface))]'}>
                  <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-gray-800">{item.name}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{money(item.price)}</td>
                  <td className="px-3 py-2 text-right font-black text-[rgb(var(--color-brown))]">{money(item.total ?? item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-52 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{money(bill.subtotal ?? bill.total)}</span></div>
              {Number(bill.discount) > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>- {money(bill.discount)}</span></div>}
              {bill.gstEnabled && Number(bill.tax) > 0 && <div className="flex justify-between"><span className="text-gray-500">{bill.taxLabel || 'GST'}</span><span className="font-semibold">{money(bill.tax)}</span></div>}
              <div className="flex justify-between bg-[rgb(var(--color-brown))] text-white rounded-lg px-3 py-2 mt-1 font-black text-sm">
                <span>Total</span><span>{money(bill.total)}</span>
              </div>
            </div>
          </div>

          {bill.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-900">
              <span className="font-black">Notes: </span>{bill.notes}
            </div>
          )}

          <div className="text-center text-[10px] text-gray-400 border-t border-dashed border-gray-200 pt-3">
            <p className="italic">"{settings.messageFooter || 'Thank you for your order!'}"</p>
            {settings.gst && <p className="mt-0.5 font-semibold text-gray-500">GSTIN: {settings.gst}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const BillsHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bills, setBills]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({});
  const [stats, setStats]               = useState({});
  const [settings, setSettings]         = useState({});
  const [showGenerator, setShowGenerator] = useState(false);
  const [previewBill, setPreviewBill]   = useState(null);

  const fetchSettings = useCallback(async () => {
    try { const r = await settingsAPI.get(); setSettings(r.data.data || {}); } catch {}
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;
      const r = await billAPI.getAll(params);
      setBills(r.data.data || []);
      setPagination(r.data.pagination || {});
      setStats(r.data.stats || {});
    } catch { toast.error('Failed to fetch bills'); }
    finally { setLoading(false); }
  }, [endDate, page, startDate]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { fetchBills(); }, [fetchBills]);
  useEffect(() => { if (searchParams.get('new') === '1') setShowGenerator(true); }, [searchParams]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try { await billAPI.delete(id); toast.success('Deleted'); fetchBills(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleBillCreated = () => {
    setShowGenerator(false); setSearchParams({}); setPage(1); fetchBills();
  };

  const filteredBills = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return bills.filter(b =>
      b.customer?.name?.toLowerCase().includes(q) ||
      b.customer?.phone?.includes(searchTerm) ||
      b.billNumber?.toLowerCase().includes(q)
    );
  }, [bills, searchTerm]);

  if (showGenerator) {
    return <BillGenerator embedded onClose={() => { setShowGenerator(false); setSearchParams({}); }} onBillCreated={handleBillCreated} />;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[rgb(var(--color-brown))]">Bills & Invoices</h1>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Generate bills and view history</p>
        </div>
        <button
          onClick={() => { setShowGenerator(true); setSearchParams({ new: '1' }); }}
          className="flex items-center gap-1.5 rounded-lg bg-[rgb(var(--color-brown))] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New Bill
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total Bills', value: stats.totalBills || 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Revenue', value: money(stats.totalRevenue), icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Items Sold', value: stats.totalItemsSold || 0, icon: Package, color: 'text-pink-600 bg-pink-50' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 bg-white border border-[rgb(var(--color-border))] rounded-lg px-3 py-2 shadow-sm">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase text-[rgb(var(--color-text-secondary))]">{s.label}</p>
              <p className="text-sm font-black text-[rgb(var(--color-text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 bg-white border border-[rgb(var(--color-border))] rounded-lg px-3 py-2 shadow-sm">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text" placeholder="Search name, phone, bill no..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
          />
        </div>
        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
          className="py-1.5 px-2 text-xs bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
        <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
          className="py-1.5 px-2 text-xs bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
        {(startDate || endDate || searchTerm) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); setPage(1); }}
            className="px-2.5 py-1.5 text-xs font-bold text-[rgb(var(--color-brown))] border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-surface))]">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[rgb(var(--color-border))] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))]">
              <tr>
                {['Bill No', 'Customer', 'Items', 'Total', 'Payment', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-black uppercase text-[rgb(var(--color-text-secondary))]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {loading ? (
                <tr><td colSpan="7" className="py-10 text-center">
                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-[rgb(var(--color-brown))] border-t-transparent" />
                </td></tr>
              ) : filteredBills.length === 0 ? (
                <tr><td colSpan="7" className="py-10 text-center text-sm text-[rgb(var(--color-text-secondary))]">No bills found</td></tr>
              ) : filteredBills.map(bill => (
                <tr key={bill._id} className="hover:bg-[rgb(var(--color-surface))] transition-colors">
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs font-black text-[rgb(var(--color-brown))] bg-orange-50 border border-orange-100 rounded px-1.5 py-0.5">
                      {bill.billNumber}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-[rgb(var(--color-text-primary))]">{bill.customer?.name || 'Walk-in'}</p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">{bill.customer?.phone || ''}</p>
                  </td>
                  <td className="px-3 py-2 max-w-[180px]">
                    {(bill.items || []).slice(0, 2).map((item, i) => (
                      <p key={i} className="text-xs truncate text-[rgb(var(--color-text-secondary))]">{item.name} ×{item.quantity}</p>
                    ))}
                    {(bill.items || []).length > 2 && <p className="text-[10px] text-gray-400">+{bill.items.length - 2} more</p>}
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-black text-[rgb(var(--color-brown))]">{money(bill.total)}</p>
                    {bill.tax > 0 && <p className="text-[10px] text-gray-400">{bill.taxLabel}: {money(bill.tax)}</p>}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${paymentStyle[bill.paymentMethod] || 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                      {bill.paymentMethod || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-secondary))]">
                    <p>{fmtDate(bill.createdAt)}</p>
                    <p className="text-[10px] text-gray-400">{fmtTime(bill.createdAt)}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPreviewBill(bill)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Preview">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button onClick={() => downloadInvoicePdf(bill, settings)} className="p-1.5 hover:bg-amber-50 rounded-lg" title="Download PDF">
                        <Download className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                      <button onClick={() => handleDelete(bill._id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-[rgb(var(--color-border))] px-3 py-2">
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              {((page-1)*pagination.limit)+1}–{Math.min(page*pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="p-1.5 rounded-lg border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))] disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {[...Array(pagination.pages)].map((_,i) => {
                const n = i+1;
                if (n===1 || n===pagination.pages || (n>=page-1 && n<=page+1)) return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`px-2.5 py-1 text-xs font-black rounded-lg ${page===n ? 'bg-[rgb(var(--color-brown))] text-white' : 'border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))]'}`}>
                    {n}
                  </button>
                );
                if (n===page-2||n===page+2) return <span key={n} className="text-gray-400 text-xs">…</span>;
                return null;
              })}
              <button onClick={() => setPage(p => Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}
                className="p-1.5 rounded-lg border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))] disabled:opacity-40">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bill Preview Modal */}
      {previewBill && <BillPreview bill={previewBill} settings={settings} onClose={() => setPreviewBill(null)} />}
    </div>
  );
};

export default BillsHistory;
