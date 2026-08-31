import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar, Clock, Edit, Megaphone, Plus, Search,
  Send, Trash2, Users, Zap, CheckCircle, XCircle,
  BarChart2, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { campaignAPI } from '../../services/api';
import SweetAlert from '../../components/ui/SweetAlert';
import CampaignForm from './CampaignForm';
import WhatsAppStatusBanner from '../../components/layout/WhatsAppStatusBanner';

const Campaigns = () => {
  const location = useLocation();
  
  if (location.pathname.includes('/create')) return <CampaignForm />;
  if (location.pathname.includes('/edit/')) return <CampaignForm />;
  return <CampaignList />;
};

const TYPE_META = {
  Manual:          { label: 'Manual',       color: 'bg-blue-100 text-blue-700',    icon: Megaphone },
  AutoBirthday:    { label: 'Birthday Auto', color: 'bg-pink-100 text-pink-700',    icon: Calendar },
  AutoAnniversary: { label: 'Anniv. Auto',  color: 'bg-rose-100 text-rose-700',    icon: Calendar },
  AutoSpecial:     { label: 'Special Day',  color: 'bg-violet-100 text-violet-700', icon: Clock },
};

const AUDIENCE_META = {
  All:         { label: 'All Customers',    color: 'bg-sky-100 text-sky-700' },
  Birthday:    { label: 'Birthdays',        color: 'bg-pink-100 text-pink-700' },
  Anniversary: { label: 'Anniversaries',   color: 'bg-rose-100 text-rose-700' },
  Individual:  { label: 'Specific',         color: 'bg-orange-100 text-orange-700' },
  SpecialDay:  { label: 'Special Day',      color: 'bg-violet-100 text-violet-700' },
};

const STATUS_META = {
  Draft:     { label: 'Draft',    color: 'bg-gray-100 text-gray-600' },
  Active:    { label: 'Active',   color: 'bg-emerald-100 text-emerald-700' },
  Scheduled: { label: 'Scheduled',color: 'bg-amber-100 text-amber-700' },
  Sending:   { label: 'Sending',  color: 'bg-blue-100 text-blue-700' },
  Sent:      { label: 'Sent',     color: 'bg-emerald-100 text-emerald-700' },
  Failed:    { label: 'Failed',   color: 'bg-red-100 text-red-700' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState({ open: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await campaignAPI.getAll();
      setCampaigns(res.data || []);
    } catch { toast.error('Failed to load campaigns'); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchSearch = !q || [c.name, c.type, c.targetAudience, c.message]
        .some((v) => String(v || '').toLowerCase().includes(q));
      const matchFilter =
        filter === 'all' ||
        (filter === 'active' && c.isActive) ||
        (filter === 'inactive' && !c.isActive) ||
        (filter === 'sent' && c.status === 'Sent') ||
        (filter === 'scheduled' && (c.scheduledAt || c.autoSchedule?.enabled));
      return matchSearch && matchFilter;
    });
  }, [campaigns, search, filter]);

  const stats = useMemo(() => [
    { label: 'Total',      value: campaigns.length,                                          icon: Megaphone, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active',     value: campaigns.filter((c) => c.isActive).length,                icon: Zap,       color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Sent',       value: campaigns.filter((c) => c.status === 'Sent').length,       icon: CheckCircle, color: 'text-violet-600 bg-violet-50' },
    { label: 'Recipients', value: campaigns.reduce((s, c) => s + (c.totalRecipients || 0), 0), icon: Users,   color: 'text-amber-600 bg-amber-50' },
  ], [campaigns]);

  const confirm = (title, message, onConfirm) =>
    setAlert({ open: true, title, message, onConfirm });

  const handleDelete = (c) =>
    confirm('Delete Campaign', `Delete "${c.name}"? This cannot be undone.`, async () => {
      await campaignAPI.delete(c._id);
      load();
      toast.success('Campaign deleted');
    });

  const handleToggle = (c) =>
    confirm(
      `${c.isActive ? 'Deactivate' : 'Activate'} Campaign`,
      `${c.isActive ? 'Deactivate' : 'Activate'} "${c.name}"?`,
      async () => {
        await campaignAPI.toggleStatus(c._id);
        load();
        toast.success(`Campaign ${c.isActive ? 'deactivated' : 'activated'}`);
      },
    );

  const handleSend = (c) =>
    confirm('Send Campaign', `Send "${c.name}" to ${c.totalRecipients || 0} recipients now?`, async () => {
      try {
        await campaignAPI.send(c._id);
        load();
        toast.success('Campaign sent!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Send failed');
      }
    });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-[rgb(var(--color-brown))]">Campaigns</h1>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">WhatsApp marketing — create, schedule and track campaigns.</p>
        </div>
        <Link
          to="/admin/campaigns/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--color-brown))] px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      {/* WhatsApp status banner */}
      <WhatsAppStatusBanner />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-white px-3 py-2 shadow-sm">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase text-[rgb(var(--color-text-secondary))]">{s.label}</p>
              <p className="text-lg font-black text-[rgb(var(--color-text-primary))]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-white p-2 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
          />
        </div>
        <div className="relative sm:w-44">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full appearance-none rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] py-2 pl-9 pr-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[rgb(var(--color-border))] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
              <tr>
                {['Campaign', 'Type', 'Audience', 'Recipients', 'Status', 'Active', 'Actions'].map((h) => (
                  <th key={h} className={`px-3 py-2 text-xs font-black uppercase text-[rgb(var(--color-text-secondary))] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-[rgb(var(--color-brown))] border-t-transparent" />
                    <p className="mt-3 text-sm text-[rgb(var(--color-text-secondary))]">Loading...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Megaphone className="mx-auto h-10 w-10 text-[rgb(var(--color-text-tertiary))]" />
                    <p className="mt-3 font-bold text-[rgb(var(--color-text-primary))]">No campaigns found</p>
                    <p className="mt-1 text-sm text-[rgb(var(--color-text-secondary))]">Create your first campaign to get started.</p>
                  </td>
                </tr>
              ) : filtered.map((c) => {
                const type = TYPE_META[c.type] || TYPE_META.Manual;
                const audience = AUDIENCE_META[c.targetAudience] || AUDIENCE_META.All;
                const status = STATUS_META[c.status] || STATUS_META.Draft;
                const TypeIcon = type.icon;

                return (
                  <tr key={c._id} className="hover:bg-[rgb(var(--color-surface))] transition-colors">
                    <td className="px-3 py-2">
                      <p className="max-w-[200px] truncate font-bold text-[rgb(var(--color-text-primary))]">{c.name}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {c.type === 'AutoBirthday' || c.type === 'AutoAnniversary'
                          ? `Daily at ${c.autoSchedule?.time || '09:00'}`
                          : c.scheduledAt ? `Scheduled ${fmt(c.scheduledAt)}` : 'Manual send'}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${type.color}`}>
                        <TypeIcon className="h-3 w-3" />
                        {type.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${audience.color}`}>
                        {audience.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-black text-gray-700">
                        <Users className="h-3 w-3" />
                        {c.totalRecipients || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${status.color}`}>
                        {status.label}
                      </span>
                      {c.status === 'Sent' && (
                        <p className="text-[10px] text-[rgb(var(--color-text-secondary))]">
                          {c.sentCount || 0} sent · {c.failedCount || 0} failed
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleToggle(c)}
                        className={`relative h-5 w-9 rounded-full transition-colors ${c.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${c.isActive ? 'translate-x-4' : ''}`} />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSend(c)}
                          title="Send now"
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/admin/campaigns/edit/${c._id}`}
                          title="Edit"
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c)}
                          title="Delete"
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <SweetAlert
        isOpen={alert.open}
        onClose={() => setAlert({ open: false })}
        onConfirm={alert.onConfirm}
        title={alert.title}
        message={alert.message}
        type="warning"
      />
    </div>
  );
};

export default Campaigns;
