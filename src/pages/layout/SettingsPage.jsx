import { useEffect, useState } from 'react';
import {
  Building2,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  ImagePlus,
  IndianRupee,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Settings2,
  Trash2,
  Upload,
  QrCode,
  LogOut,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Key,
  Smartphone
} from 'lucide-react';
import { settingsAPI, whatsappAPI } from '../../services/api';
import toast from 'react-hot-toast';

const checkoutOptions = [
  { key: 'name', label: 'Customer name', requiredByDefault: true },
  { key: 'phone', label: 'Mobile number', requiredByDefault: true },
  { key: 'email', label: 'Email address' },
  { key: 'address', label: 'Delivery address', requiredByDefault: true },
  { key: 'deliveryDate', label: 'Delivery date', requiredByDefault: true },
  { key: 'dob', label: 'Date of birth' },
  { key: 'anniversaryDate', label: 'Anniversary date' },
  { key: 'specialDate', label: 'Other special date' },
  { key: 'specialDateDescription', label: 'Special date details' },
  { key: 'orderNotes', label: 'Cake message / design notes' }
];

const defaultCheckoutFields = checkoutOptions.reduce((acc, item) => ({
  ...acc,
  [item.key]: { visible: true, required: Boolean(item.requiredByDefault) }
}), {});

const normalizeCheckoutFields = (fields = {}) => checkoutOptions.reduce((acc, item) => {
  const saved = fields?.[item.key];
  if (typeof saved === 'boolean') {
    acc[item.key] = { visible: saved, required: saved && Boolean(item.requiredByDefault) };
    return acc;
  }

  acc[item.key] = {
    visible: saved?.visible !== false,
    required: saved?.required === true
  };
  return acc;
}, {});

const adminCustomerOptions = [
  { key: 'name', label: 'Customer name', requiredByDefault: true },
  { key: 'phone', label: 'Mobile number', requiredByDefault: true },
  { key: 'email', label: 'Email address' },
  { key: 'address', label: 'Address' },
  { key: 'dob', label: 'Birthday' },
  { key: 'anniversaryDate', label: 'Anniversary' },
  { key: 'specialDate', label: 'Special Date' },
  { key: 'orderNotes', label: 'Notes' }
];

const defaultAdminCustomerFields = adminCustomerOptions.reduce((acc, item) => ({
  ...acc,
  [item.key]: { visible: true, required: Boolean(item.requiredByDefault) }
}), {});

const normalizeAdminCustomerFields = (fields = {}) => adminCustomerOptions.reduce((acc, item) => {
  const saved = fields?.[item.key];
  if (typeof saved === 'boolean') {
    acc[item.key] = { visible: saved, required: saved && Boolean(item.requiredByDefault) };
    return acc;
  }

  acc[item.key] = {
    visible: saved?.visible !== false,
    required: saved?.required === true
  };
  return acc;
}, {});

const emptyBanner = { title: '', subtitle: '', image: '', link: '', isActive: true };
const emptyQuickLink = { label: '', type: 'custom', url: '', isActive: true };
const quickLinkTypes = ['whatsapp', 'instagram', 'facebook', 'website', 'phone', 'email', 'reviews', 'install', 'custom'];
const quickLinkHelp = {
  whatsapp: 'Enter WhatsApp number like +91 98765 43210, or paste a wa.me link.',
  phone: 'Enter phone number like +91 98765 43210.',
  email: 'Enter email address like orders@example.com.',
  website: 'Enter full website URL like https://example.com.',
  instagram: 'Enter full Instagram profile URL.',
  facebook: 'Enter full Facebook page URL.',
  reviews: 'Enter your Google review or rating page URL.',
  install: 'No URL needed. This button opens Add to Home Screen.',
  custom: 'Enter any full URL.'
};

const getQuickLinkPlaceholder = (type) => {
  const placeholders = {
    whatsapp: '+91 98765 43210',
    phone: '+91 98765 43210',
    email: 'orders@example.com',
    website: 'https://yourbakery.com',
    instagram: 'https://instagram.com/yourbakery',
    facebook: 'https://facebook.com/yourbakery',
    reviews: 'https://g.page/r/your-review-link',
    install: 'No URL required',
    custom: 'https://example.com'
  };
  return placeholders[type] || placeholders.custom;
};

const normalizeUrl = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const normalizeQuickLink = (link, settings) => {
  const type = link.type || 'custom';
  let url = String(link.url || '').trim();

  if (type === 'install') url = '';
  if (type === 'phone' && !url) url = settings.phone || '';
  if (type === 'email' && !url) url = settings.email || '';
  if (type === 'whatsapp' && !url) url = settings.whatsappNumber || settings.phone || '';
  if (['website', 'instagram', 'facebook', 'reviews', 'custom'].includes(type)) url = normalizeUrl(url);

  return {
    ...link,
    label: link.label || type,
    type,
    url,
    isActive: link.isActive !== false
  };
};

const SettingsPage = () => {
  const [waStatus, setWaStatus] = useState('disconnected'); // disconnected | connecting | qr_ready | pairing_ready | connected
  const [waQr, setWaQr] = useState(null);
  const [waPairingCode, setWaPairingCode] = useState(null);
  const [connectPhone, setConnectPhone] = useState('');
  const [connectMethod, setConnectMethod] = useState('qr'); // qr | pairing
  const [waLoading, setWaLoading] = useState(false);

  useEffect(() => {
    checkWaStatus();
    const interval = setInterval(checkWaStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkWaStatus = async () => {
    try {
      const res = await whatsappAPI.getStatus();
      setWaStatus(res.data.status || 'disconnected');
      setWaQr(res.data.qr || null);
      setWaPairingCode(res.data.pairingCode || null);
    } catch (err) {
      console.error('Failed to fetch WhatsApp status', err);
    }
  };

  const handleWaConnect = async () => {
    try {
      setWaLoading(true);
      const payload = {};
      if (connectMethod === 'pairing') {
        if (!connectPhone.trim()) {
          toast.error('Please enter a phone number (e.g. 919999999999)');
          setWaLoading(false);
          return;
        }
        let rawPhone = connectPhone.trim().replace(/\D/g, '');
        if (rawPhone.length === 10) {
          rawPhone = '91' + rawPhone;
        }
        payload.phoneNumber = rawPhone;
      }
      const res = await whatsappAPI.connect(payload);
      toast.success(res.data.message || 'Connecting...');
      checkWaStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection failed');
    } finally {
      setWaLoading(false);
    }
  };

  const handleWaDisconnect = async () => {
    try {
      setWaLoading(true);
      const res = await whatsappAPI.disconnect();
      setWaStatus('disconnected');
      setWaQr(null);
      setWaPairingCode(null);
      toast.success(res.data.message || 'Disconnected successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Disconnect failed');
    } finally {
      setWaLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    bakeryName: '',
    appName: '',
    appIcon: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    whatsappNumber: '',
    messageFooter: '',
    defaultDiscount: 0,
    website: '',
    instagram: '',
    facebook: '',
    gst: '',
    gstEnabled: false,
    gstPercentage: 0,
    offerBanners: [],
    quickLinks: [],
    checkoutFields: defaultCheckoutFields,
    adminCustomerFields: defaultAdminCustomerFields
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data.data) {
        setSettings(prev => ({
          ...prev,
          ...response.data.data,
          offerBanners: response.data.data.offerBanners || [],
          quickLinks: response.data.data.quickLinks || [],
          checkoutFields: normalizeCheckoutFields(response.data.data.checkoutFields),
          adminCustomerFields: normalizeAdminCustomerFields(response.data.data.adminCustomerFields)
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const updateCheckoutField = (key, patch) => {
    setSettings(prev => {
      const current = normalizeCheckoutFields(prev.checkoutFields);
      const nextField = { ...current[key], ...patch };
      if (patch.visible === false) nextField.required = false;

      return {
        ...prev,
        checkoutFields: {
          ...current,
          [key]: nextField
        }
      };
    });
  };

  const updateAdminCustomerField = (key, patch) => {
    setSettings(prev => {
      const current = normalizeAdminCustomerFields(prev.adminCustomerFields);
      const nextField = { ...current[key], ...patch };
      if (patch.visible === false) nextField.required = false;

      return {
        ...prev,
        adminCustomerFields: {
          ...current,
          [key]: nextField
        }
      };
    });
  };

  const readImage = (file, onLoad) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onLoad(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    readImage(e.target.files[0], image => setSettings(prev => ({ ...prev, logo: image })));
  };

  const handleAppIconUpload = (e) => {
    readImage(e.target.files[0], image => setSettings(prev => ({ ...prev, appIcon: image })));
  };

  const updateBanner = (index, key, value) => {
    setSettings(prev => ({
      ...prev,
      offerBanners: prev.offerBanners.map((banner, idx) => idx === index ? { ...banner, [key]: value } : banner)
    }));
  };

  const updateQuickLink = (index, key, value) => {
    setSettings(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.map((link, idx) => {
        if (idx !== index) return link;
        const next = { ...link, [key]: value };
        if (key === 'type' && value === 'install') next.url = '';
        if (key === 'type' && !next.label) next.label = value;
        return next;
      })
    }));
  };

  const getAvailableTypes = (index) => {
    return quickLinkTypes.filter(type => {
      if (type === 'custom') return true;
      const alreadyUsed = (settings.quickLinks || []).some((link, idx) => idx !== index && link.type === type);
      return !alreadyUsed;
    });
  };

  const handleAddQuickLink = () => {
    const usedTypes = (settings.quickLinks || []).map(link => link.type);
    const firstAvailable = quickLinkTypes.find(type => type === 'custom' || !usedTypes.includes(type)) || 'custom';
    setSettings(prev => ({
      ...prev,
      quickLinks: [...prev.quickLinks, { label: firstAvailable === 'custom' ? 'Link' : firstAvailable, type: firstAvailable, url: '', isActive: true }]
    }));
  };

  const removeFromList = (key, index) => {
    setSettings(prev => ({ ...prev, [key]: prev[key].filter((_, idx) => idx !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...settings,
        quickLinks: (settings.quickLinks || []).map(link => normalizeQuickLink(link, settings))
      };
      await settingsAPI.update(payload);
      setSettings(prev => ({ ...prev, quickLinks: payload.quickLinks }));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--color-brown))]">Store Settings</h1>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">Control bakery profile, invoice details, offers, contact buttons, and checkout fields.</p>
      </div>

      {/* WhatsApp Connection Manager */}
      <section className="bg-white rounded-xl p-5 shadow-sm border border-[rgb(var(--color-border))]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[rgb(var(--color-border))] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MessageCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-[rgb(var(--color-text-primary))]">WhatsApp Device Connection</h3>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Connect your WhatsApp account to automatically send order notifications, bills, and campaigns.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {waStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" /> Connected
              </span>
            ) : waStatus === 'connecting' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting
              </span>
            ) : waStatus === 'qr_ready' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                <QrCode className="h-3.5 w-3.5" /> Scan QR Ready
              </span>
            ) : waStatus === 'pairing_ready' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                <Key className="h-3.5 w-3.5" /> Pairing Code Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-800">
                <AlertTriangle className="h-3.5 w-3.5" /> Disconnected
              </span>
            )}
          </div>
        </div>

        {waStatus === 'connected' ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950">WhatsApp is Linked!</p>
                <p className="text-xs text-emerald-900/80 mt-1">Your device is linked successfully. Campaigns, birthday wishes, and billing messages will trigger automatically.</p>
              </div>
            </div>
            <button
              type="button"
              disabled={waLoading}
              onClick={handleWaDisconnect}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Disconnect Device
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-black/[0.04] pb-2">
              <button
                type="button"
                onClick={() => setConnectMethod('qr')}
                className={`px-4 py-2 text-xs font-black rounded-lg transition-colors ${
                  connectMethod === 'qr'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Option 1: Scan QR Code
              </button>
              <button
                type="button"
                onClick={() => setConnectMethod('pairing')}
                className={`px-4 py-2 text-xs font-black rounded-lg transition-colors ${
                  connectMethod === 'pairing'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Option 2: Phone Pairing Code
              </button>
            </div>

            {connectMethod === 'qr' ? (
              <div className="space-y-4">
                {waStatus === 'qr_ready' && waQr ? (
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="border border-[rgb(var(--color-border))] rounded-2xl bg-white p-3.5 shadow-sm text-center md:col-span-1 max-w-[240px] mx-auto">
                      <img src={waQr} alt="WhatsApp QR Code" className="w-full h-auto rounded-lg" />
                      <p className="mt-2 text-[10px] font-bold text-gray-400">QR refreshes automatically</p>
                    </div>
                    <div className="space-y-2 md:col-span-2 text-sm font-semibold text-gray-700">
                      <p className="font-black text-[rgb(var(--color-text-primary))] text-base">How to connect with QR:</p>
                      <ul className="list-decimal pl-5 space-y-1.5 text-xs">
                        <li>Open WhatsApp on your phone.</li>
                        <li>Tap **Menu** (three dots) or **Settings** (iPhone) ➔ **Linked Devices**.</li>
                        <li>Tap **Link a Device**.</li>
                        <li>Point your phone camera to this QR code to scan and authorize.</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-3">Link your WhatsApp instance by scanning a QR code.</p>
                    <button
                      type="button"
                      disabled={waLoading || waStatus === 'connecting'}
                      onClick={handleWaConnect}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {waStatus === 'connecting' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating QR...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4" />
                          Generate QR Code
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {waStatus === 'pairing_ready' && waPairingCode ? (
                  <div className="space-y-4 max-w-xl">
                    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-center">
                      <p className="text-[10px] font-black uppercase tracking-wider text-purple-700">Your Link Code</p>
                      <p className="font-mono text-3xl font-black text-purple-950 mt-1 select-all tracking-widest">{waPairingCode}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 space-y-2">
                      <p className="font-black text-[rgb(var(--color-text-primary))]">How to connect using code:</p>
                      <ul className="list-decimal pl-5 space-y-1.5 text-xs">
                        <li>Open WhatsApp on your phone.</li>
                        <li>Tap **Menu** (three dots) or **Settings** (iPhone) ➔ **Linked Devices** ➔ **Link a Device**.</li>
                        <li>At the bottom of the scan screen, tap **Link with phone number instead**.</li>
                        <li>Enter the 8-character pairing code shown above on your phone screen.</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md space-y-3.5">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                        WhatsApp Phone Number (with Country Code)
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={connectPhone}
                          onChange={(e) => setConnectPhone(e.target.value)}
                          placeholder="e.g. 919876543210 (No spaces or +)"
                          className="h-11 flex-1 rounded-xl border border-black/10 px-3.5 text-sm font-black outline-none focus:border-[rgb(var(--color-brown))]"
                        />
                        <button
                          type="button"
                          disabled={waLoading || waStatus === 'connecting'}
                          onClick={handleWaConnect}
                          className="h-11 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2 shrink-0"
                        >
                          {waStatus === 'connecting' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating Code...
                            </>
                          ) : (
                            <>
                              <Key className="h-4 w-4" />
                              Get Pairing Code
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-400">Do not enter spaces, brackets or '+' prefix. Example: For Indian number +91 98765 43210, enter 919876543210.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <section className="bg-white rounded-xl p-5 shadow-sm border border-[rgb(var(--color-border))]">
            <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Bakery Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))]">Business Name</span>
                <input name="bakeryName" value={settings.bakeryName || ''} onChange={handleChange} placeholder="Shown on bills and store page" className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))]">App Name</span>
                <input name="appName" value={settings.appName || ''} onChange={handleChange} placeholder="Name shown on mobile home screen" className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Contact Number</span>
                <input type="tel" name="phone" value={settings.phone || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Email</span>
                <input type="email" name="email" value={settings.email || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
              </label>
              <label className="md:col-span-2 space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Business Address</span>
                <textarea name="address" value={settings.address || ''} onChange={handleChange} rows="3" className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all resize-none" />
              </label>
              <label className="md:col-span-2 border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg p-5 text-center hover:border-[rgb(var(--color-brown))]">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                {settings.logo ? <img src={settings.logo} alt="Logo" className="w-20 h-20 mx-auto object-contain mb-2" /> : <Upload className="w-10 h-10 mx-auto text-[rgb(var(--color-text-tertiary))] mb-2" />}
                <span className="text-sm text-[rgb(var(--color-text-secondary))]">Upload business logo</span>
              </label>
              <label className="md:col-span-2 border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg p-5 text-center hover:border-[rgb(var(--color-brown))]">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAppIconUpload} className="hidden" />
                {settings.appIcon ? <img src={settings.appIcon} alt="App icon" className="w-20 h-20 mx-auto rounded-2xl object-cover mb-2" /> : <Upload className="w-10 h-10 mx-auto text-[rgb(var(--color-text-tertiary))] mb-2" />}
                <span className="text-sm text-[rgb(var(--color-text-secondary))]">Upload mobile app icon for Add to Home Screen</span>
              </label>
            </div>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm border border-[rgb(var(--color-border))]">
            <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              Invoice & Tax Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />GST Number (GSTIN)</span>
                <input name="gst" value={settings.gst || ''} onChange={handleChange} placeholder="GSTIN printed on invoice" className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
              </label>
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))]">Default Bill Discount (%)</span>
                <input type="number" min="0" step="0.01" name="defaultDiscount" value={settings.defaultDiscount || 0} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
              </label>

              {/* GST Enable Toggle + Rate */}
              <div className="md:col-span-2 rounded-xl border-2 border-[rgb(var(--color-brown))]/20 bg-[#fffdf9] p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.gstEnabled)}
                      onChange={(e) => setSettings(prev => ({ ...prev, gstEnabled: e.target.checked }))}
                      className="h-5 w-5 rounded border-gray-300 text-[rgb(var(--color-brown))] accent-[rgb(var(--color-brown))] cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-black text-[rgb(var(--color-text-primary))] flex items-center gap-2">
                        <span>Enable GST on Bills & Online Orders</span>
                        {settings.gstEnabled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-800">
                            ✓ ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-600">
                            DISABLED
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
                        Automatically add GST to online customer orders and pre-check GST in Bill Generator.
                      </p>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, gstEnabled: !prev.gstEnabled }))}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                      settings.gstEnabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                      settings.gstEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {settings.gstEnabled && (
                  <div className="pt-3 border-t border-[rgb(var(--color-brown))]/10 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-[rgb(var(--color-text-primary))]">
                      GST Rate / Percentage:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        name="gstPercentage"
                        value={settings.gstPercentage || 0}
                        onChange={handleChange}
                        placeholder="5"
                        className="h-9 w-24 rounded-lg border border-[rgb(var(--color-border))] bg-white px-3 text-sm font-black outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                      />
                      <span className="text-sm font-black text-[rgb(var(--color-text-primary))]">%</span>
                    </div>
                    <span className="text-xs text-gray-500 italic">
                      (e.g. 5% for bakery items, 18% for services)
                    </span>
                  </div>
                )}
              </div>

              <label className="md:col-span-2 space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Invoice Footer Message</span>
                <textarea name="messageFooter" value={settings.messageFooter || ''} onChange={handleChange} rows="3" placeholder="Example: Thank you for choosing us. Freshly baked with love." className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all resize-none" />
              </label>
            </div>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2"><ImagePlus className="w-5 h-5" />Offer Banners</h3>
              <button type="button" onClick={() => setSettings(prev => ({ ...prev, offerBanners: [...prev.offerBanners, emptyBanner] }))} className="px-3 py-2 bg-[rgb(var(--color-brown))] text-white rounded-lg text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {settings.offerBanners.map((banner, index) => (
                <div key={index} className="border border-[rgb(var(--color-border))] rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={banner.title || ''} onChange={(e) => updateBanner(index, 'title', e.target.value)} placeholder="Offer title" className="px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
                    <input value={banner.subtitle || ''} onChange={(e) => updateBanner(index, 'subtitle', e.target.value)} placeholder="Short offer line" className="px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
                    <input value={banner.link || ''} onChange={(e) => updateBanner(index, 'link', e.target.value)} placeholder="Optional link" className="px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
                    <label className="px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 font-medium">Upload banner image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => readImage(e.target.files[0], image => updateBanner(index, 'image', image))} />
                    </label>
                  </div>
                  {banner.image && <img src={banner.image} alt={banner.title || 'Offer'} className="w-full h-28 object-cover rounded-lg" />}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={banner.isActive !== false} onChange={(e) => updateBanner(index, 'isActive', e.target.checked)} /> Active</label>
                    <button type="button" onClick={() => removeFromList('offerBanners', index)} className="text-red-600 text-sm flex items-center gap-1"><Trash2 className="w-4 h-4" />Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm border border-[rgb(var(--color-border))]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2"><ExternalLink className="w-5 h-5" />Floating Contact Icons</h3>
              <button type="button" onClick={handleAddQuickLink} className="px-3 py-2 bg-[rgb(var(--color-brown))] text-white rounded-lg text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {settings.quickLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_160px_1fr_auto] gap-3 items-center border border-[rgb(var(--color-border))] rounded-lg p-3 bg-[rgb(var(--color-surface))]">
                  <input value={link.label || ''} onChange={(e) => updateQuickLink(index, 'label', e.target.value)} placeholder="Label" className="px-3.5 py-2.5 text-sm bg-white border border-[rgb(var(--color-border))] rounded-lg focus:outline-none" />
                  <select value={link.type || 'custom'} onChange={(e) => updateQuickLink(index, 'type', e.target.value)} className="px-3.5 py-2.5 text-sm bg-white border border-[rgb(var(--color-border))] rounded-lg">
                    {getAvailableTypes(index).map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <div>
                    {link.type === 'install' ? (
                      <div className="px-3.5 py-2.5 bg-gray-100 border border-[rgb(var(--color-border))] rounded-lg text-xs font-semibold text-gray-500 text-center select-none">
                        No URL required (Triggers App Install)
                      </div>
                    ) : (
                      <>
                        <input
                          value={link.url || ''}
                          onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                          placeholder={getQuickLinkPlaceholder(link.type || 'custom')}
                          className="w-full px-3.5 py-2.5 text-sm bg-white border border-[rgb(var(--color-border))] rounded-lg"
                        />
                        <p className="mt-1 text-[10px] text-[rgb(var(--color-text-secondary))]">{quickLinkHelp[link.type || 'custom']}</p>
                      </>
                    )}
                  </div>
                  <button type="button" onClick={() => removeFromList('quickLinks', index)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          {/* Store Checkout Fields */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-[rgb(var(--color-border))]">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[rgb(var(--color-brown))]" />
              Store Checkout Fields
            </h3>
            <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-4">Configure form fields shown to customers during online checkout.</p>
            <div className="space-y-3">
              {checkoutOptions.map(option => {
                const field = normalizeCheckoutFields(settings.checkoutFields)[option.key];
                return (
                  <div key={option.key} className="rounded-lg bg-[rgb(var(--color-surface))] p-3 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-semibold text-xs text-[rgb(var(--color-text-primary))]">{option.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${field.visible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {field.visible ? (field.required ? 'Required' : 'Optional') : 'Hidden'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs select-none cursor-pointer">
                        <span>Show</span>
                        <input
                          type="checkbox"
                          checked={field.visible}
                          onChange={(e) => updateCheckoutField(option.key, { visible: e.target.checked })}
                          className="rounded text-[rgb(var(--color-brown))] focus:ring-0"
                        />
                      </label>
                      <label className={`flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs select-none cursor-pointer ${!field.visible ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span>Required</span>
                        <input
                          type="checkbox"
                          checked={field.visible && field.required}
                          disabled={!field.visible}
                          onChange={(e) => updateCheckoutField(option.key, { required: e.target.checked })}
                          className="rounded text-[rgb(var(--color-brown))] focus:ring-0"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Admin Customer & Billing Fields */}
          <section className="bg-white rounded-xl p-5 shadow-sm border border-[rgb(var(--color-border))]">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[rgb(var(--color-brown))]" />
              Admin Customer & Billing Fields
            </h3>
            <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-4 font-medium leading-relaxed">Configure form fields for "Add Customer" and "Bill Generator" forms.</p>
            <div className="space-y-3">
              {adminCustomerOptions.map(option => {
                const field = normalizeAdminCustomerFields(settings.adminCustomerFields)[option.key];
                return (
                  <div key={option.key} className="rounded-lg bg-[rgb(var(--color-surface))] p-3 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-semibold text-xs text-[rgb(var(--color-text-primary))]">{option.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${field.visible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {field.visible ? (field.required ? 'Required' : 'Optional') : 'Hidden'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs select-none cursor-pointer">
                        <span>Show</span>
                        <input
                          type="checkbox"
                          checked={field.visible}
                          onChange={(e) => updateAdminCustomerField(option.key, { visible: e.target.checked })}
                          className="rounded text-[rgb(var(--color-brown))] focus:ring-0"
                        />
                      </label>
                      <label className={`flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs select-none cursor-pointer ${!field.visible ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span>Required</span>
                        <input
                          type="checkbox"
                          checked={field.visible && field.required}
                          disabled={!field.visible}
                          onChange={(e) => updateAdminCustomerField(option.key, { required: e.target.checked })}
                          className="rounded text-[rgb(var(--color-brown))] focus:ring-0"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-xl p-5 shadow-sm border border-[rgb(var(--color-border))]">
            <h3 className="text-base font-semibold mb-4">Marketing & Legal</h3>
            <div className="space-y-3">
              <label className="space-y-1.5 block">
                <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Website URL</span>
                <input type="url" name="website" value={settings.website || ''} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
              </label>
              <input type="url" name="instagram" value={settings.instagram || ''} onChange={handleChange} placeholder="Instagram URL" className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
              <input type="url" name="facebook" value={settings.facebook || ''} onChange={handleChange} placeholder="Facebook URL" className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all" />
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(var(--color-brown))] text-white rounded-xl hover:bg-[rgb(var(--color-light-brown))] shadow-lg font-medium disabled:opacity-50 transition-all duration-200">
            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><Save className="w-5 h-5" />Save Store Settings</>}
          </button>
        </aside>
      </form>
    </div>
  );
};

export default SettingsPage;
