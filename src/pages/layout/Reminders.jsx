import { useEffect, useMemo, useState } from 'react';
import { Cake, Calendar, CheckCircle2, Clock, Gift, Heart, MessageCircle, RefreshCw, Send, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { campaignAPI, reminderAPI } from '../../services/api';
import SweetAlert from '../../components/ui/SweetAlert';

const eventMeta = {
  Birthday: {
    label: 'Birthday',
    icon: Cake,
    badge: 'bg-pink-50 text-pink-700 border-pink-100',
    iconBox: 'bg-pink-100 text-pink-700',
  },
  Anniversary: {
    label: 'Anniversary',
    icon: Heart,
    badge: 'bg-rose-50 text-rose-700 border-rose-100',
    iconBox: 'bg-rose-100 text-rose-700',
  },
  'Special Day': {
    label: 'Special Date',
    icon: Gift,
    badge: 'bg-violet-50 text-violet-700 border-violet-100',
    iconBox: 'bg-violet-100 text-violet-700',
  },
};

const getTodayLabel = () => new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const Reminders = () => {
  const [events, setEvents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sweetAlert, setSweetAlert] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, campaignsRes] = await Promise.all([
        reminderAPI.getUpcoming({ filter: 'today' }),
        campaignAPI.getAll(),
      ]);

      const todayEvents = eventsRes.data.events || [];
      setEvents(todayEvents.filter(event => ['Birthday', 'Anniversary', 'Special Day'].includes(event.type) && event.customerId));
      setCampaigns((campaignsRes.data || []).filter(campaign =>
        ['AutoBirthday', 'AutoAnniversary', 'AutoSpecial'].includes(campaign.type) && campaign.isActive
      ));
    } catch {
      toast.error('Failed to load today events');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return [
      { label: 'Birthdays Today', value: events.filter(event => event.type === 'Birthday').length, icon: Cake, tone: 'bg-pink-50 text-pink-700' },
      { label: 'Anniversaries Today', value: events.filter(event => event.type === 'Anniversary').length, icon: Heart, tone: 'bg-rose-50 text-rose-700' },
      { label: 'Special Dates Today', value: events.filter(event => event.type === 'Special Day').length, icon: Gift, tone: 'bg-violet-50 text-violet-700' },
      { label: 'Total Customers', value: new Set(events.map(event => String(event.customerId || event.id))).size, icon: Users, tone: 'bg-blue-50 text-blue-700' },
    ];
  }, [events]);

  const sendCampaignToCustomer = async (event, campaign) => {
    try {
      const personalizedMessage = campaign.message
        .replace(/{name}/g, event.name)
        .replace(/{{name}}/g, event.name)
        .replace(/{{CustomerName}}/g, event.name);

      const response = await campaignAPI.sendIndividual({
        customerId: event.customerId || event.id,
        campaignId: campaign._id,
        message: personalizedMessage,
        imageUrl: campaign.imageUrl,
      });

      if (response.data?.success && response.data?.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
        toast.success('WhatsApp opened!');
        await fetchData();
      } else {
        toast.error('Failed to generate WhatsApp link');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    }
  };

  const handleSendClick = (event, campaign) => {
    setSweetAlert({
      isOpen: true,
      type: 'warning',
      title: 'Send Campaign',
      message: `Send "${campaign.name}" to ${event.name}?`,
      onConfirm: async () => {
        await sendCampaignToCustomer(event, campaign);
      },
    });
  };

  const getCampaignForEvent = (eventType) => {
    if (eventType === 'Birthday') return campaigns.find(campaign => campaign.type === 'AutoBirthday');
    if (eventType === 'Anniversary') return campaigns.find(campaign => campaign.type === 'AutoAnniversary');
    if (eventType === 'Special Day') return campaigns.filter(campaign => campaign.type === 'AutoSpecial');
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-[rgb(var(--color-brown))]">Reminders & Events</h1>
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Customers with birthday, anniversary or special date today.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white px-3 py-1.5 text-xs font-bold text-[rgb(var(--color-text-primary))] shadow-sm">
            <Calendar className="mr-1.5 inline h-3.5 w-3.5 text-[rgb(var(--color-brown))]" />
            {getTodayLabel()}
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--color-border))] bg-white px-3 py-1.5 text-xs font-bold text-[rgb(var(--color-brown))] shadow-sm hover:bg-[rgb(var(--color-surface))]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-white px-3 py-2 shadow-sm">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-[rgb(var(--color-text-secondary))]">{stat.label}</p>
                <p className="text-lg font-black text-[rgb(var(--color-text-primary))]">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-[rgb(var(--color-border))] bg-white py-12 shadow-sm">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[rgb(var(--color-brown))] border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-[rgb(var(--color-border))] bg-white p-10 text-center shadow-sm">
          <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <h3 className="font-black text-[rgb(var(--color-text-primary))]">No customer events today</h3>
          <p className="mt-1 text-xs text-[rgb(var(--color-text-secondary))]">No active customer has a birthday, anniversary or special date today.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[rgb(var(--color-border))] bg-white shadow-sm">
          <div className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2">
            <h2 className="text-sm font-black text-[rgb(var(--color-text-primary))]">Today's Events — {events.length} found</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-[rgb(var(--color-border))] bg-white">
                <tr>
                  {['Customer', 'Event', 'Contact', 'Status', 'Action'].map((h, i) => (
                    <th key={h} className={`px-3 py-2 text-xs font-black uppercase text-[rgb(var(--color-text-secondary))] ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {events.map((event) => {
                  const meta = eventMeta[event.type] || eventMeta.Birthday;
                  const Icon = meta.icon;
                  const campaign = getCampaignForEvent(event.type);
                  const isSent = event.campaignSent;
                  const isSpecialDay = event.type === 'Special Day';
                  const specialCampaigns = isSpecialDay && Array.isArray(campaign) ? campaign : [];
                  const singleCampaign = !isSpecialDay ? campaign : null;

                  return (
                    <tr key={`${event.customerId || event.id}-${event.type}`} className={`transition-colors hover:bg-[rgb(var(--color-surface))] ${isSent ? 'bg-emerald-50/50' : ''}`}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.iconBox}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <p className="font-bold text-sm text-[rgb(var(--color-text-primary))]">{event.name}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${meta.badge}`}>
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs font-bold text-[rgb(var(--color-text-primary))]">{event.phone || '-'}</p>
                        {event.email && <p className="text-xs text-[rgb(var(--color-text-secondary))]">{event.email}</p>}
                      </td>
                      <td className="px-3 py-2">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-700">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end">
                          {!isSent && (
                            isSpecialDay && specialCampaigns.length > 0 ? (
                              <select
                                onChange={(e) => {
                                  const selectedCampaign = specialCampaigns.find(c => c._id === e.target.value);
                                  if (selectedCampaign) handleSendClick(event, selectedCampaign);
                                }}
                                className="rounded-lg border border-[rgb(var(--color-border))] bg-white px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                                defaultValue=""
                              >
                                <option value="" disabled>Select Campaign</option>
                                {specialCampaigns.map(camp => (
                                  <option key={camp._id} value={camp._id}>{camp.name}</option>
                                ))}
                              </select>
                            ) : singleCampaign ? (
                              <button
                                type="button"
                                onClick={() => handleSendClick(event, singleCampaign)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-black text-white hover:bg-emerald-700"
                              >
                                <Send className="h-3.5 w-3.5" /> Send
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-bold text-gray-500">
                                <MessageCircle className="h-3.5 w-3.5" /> No campaign
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SweetAlert
        isOpen={sweetAlert.isOpen}
        onClose={() => setSweetAlert({ ...sweetAlert, isOpen: false })}
        onConfirm={sweetAlert.onConfirm}
        title={sweetAlert.title}
        message={sweetAlert.message}
        type={sweetAlert.type}
      />
    </div>
  );
};

export default Reminders;
