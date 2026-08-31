import { createElement, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Facebook,
  Globe,
  Image,
  Instagram,
  Link as LinkIcon,
  MessageCircle,
  Save,
  Sparkles,
  Upload,
  Users,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Cake,
  Heart,
  Megaphone,
  UserCheck,
  Gift,
  HelpCircle,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { campaignAPI, customerAPI } from '../../services/api';

const emptyFormData = {
  name: '',
  type: 'Manual',
  targetAudience: 'All',
  message: '',
  imageUrl: '',
  couponCode: '',
  discountPercentage: 0,
  discountType: 'percentage',
  discountValue: 0,
  offerLink: '',
  socialLinks: {
    facebook: '',
    instagram: '',
    website: '',
  },
  scheduledAt: '',
  autoSchedule: {
    enabled: false,
    time: '09:00',
    daysInAdvance: 0,
  },
  isActive: true,
  specificCustomers: [],
};

const messageTemplates = {
  Birthday: `🎂 Happy Birthday {name}! 🎉\n\nCelebrate your special day with us. Get {coupon} OFF on all premium cakes today.\n\nUse coupon code: {coupon}\nOrder fresh cakes online: {link}`,
  Anniversary: `💖 Happy Anniversary {name}! 🍰\n\nCelebrate your beautiful journey together with our fresh baked delights.\n\nEnjoy a special anniversary offer of {coupon} OFF.\nUse code: {coupon}\nOrder here: {link}`,
  All: `🌟 Special Offer Just for You! 🧁\n\nHi {name},\n\nEnjoy a sweet discount of {coupon} OFF on our fresh artisan bakery treats.\n\nUse code: {coupon}\nOrder now: {link}`,
  SpecialDay: `🎉 Special Celebration Offer! 🎂\n\nHi {name},\n\nWe are celebrating a special day today! Enjoy {coupon} OFF on our bakery menu.\n\nUse code: {coupon}\nOrder now: {link}`,
  Individual: `Hi {name},\n\nWe have prepared a special bakery gift just for you. Get {coupon} OFF on your next order.\n\nUse code: {coupon}\nOrder now: {link}`,
};

const campaignTypes = [
  { value: 'AutoBirthday', label: 'Birthday Auto-Pilot', icon: Cake, color: 'from-pink-500 to-rose-600', description: 'Automatically sends wishes and discount coupons on customer birthdays.' },
  { value: 'AutoAnniversary', label: 'Anniversary Auto-Pilot', icon: Heart, color: 'from-red-500 to-pink-600', description: 'Automatically sends wishes and special offers on customer wedding anniversaries.' },
  { value: 'AutoSpecial', label: 'Special Day Campaign', icon: Calendar, color: 'from-purple-500 to-indigo-600', description: 'Runs automatically on a specific calendar holiday or event date.' },
  { value: 'Manual', label: 'Manual Broadcast', icon: Megaphone, color: 'from-amber-500 to-orange-600', description: 'Send a one-off announcement or instant discount campaign manually.' },
];

const audienceOptions = [
  { value: 'All', label: 'All Active Customers', description: 'Broadcast messages to all registered active clients' },
  { value: 'Birthday', label: "Today's Birthdays", description: 'Targets clients whose birthday is today' },
  { value: 'Anniversary', label: "Today's Anniversaries", description: 'Targets clients whose wedding anniversary is today' },
  { value: 'SpecialDay', label: 'Special Day Audience', description: 'Targets clients associated with custom events' },
  { value: 'Individual', label: 'Choose Manually', description: 'Select specific clients from a search directory' },
];

const CampaignForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    fetchCustomers();
    if (isEdit) {
      fetchCampaign();
    }
  }, [id]);

  const selectedCustomersCount = formData.specificCustomers?.length || 0;

  const currentCampaignType = useMemo(
    () => campaignTypes.find((type) => type.value === formData.type) || campaignTypes[3],
    [formData.type]
  );

  const previewMessage = useMemo(() => {
    const fallback = 'Message preview will show here...';
    const val = formData.discountValue || formData.discountPercentage || 0;
    const discountText = val > 0 
      ? (formData.discountType === 'fixed' ? `Rs. ${val}` : `${val}%`) 
      : 'special';
    return (formData.message || fallback)
      .split('{name}').join('Gaurav Sharma')
      .split('{{name}}').join('Gaurav Sharma')
      .split('{coupon}').join(formData.couponCode || `${discountText} discount`)
      .split('{{coupon}}').join(formData.couponCode || `${discountText} discount`)
      .split('{{couponCode}}').join(formData.couponCode || `${discountText} discount`)
      .split('{link}').join(formData.offerLink || 'https://bakery.com/order');
  }, [formData.message, formData.offerLink, formData.couponCode, formData.discountPercentage, formData.discountType, formData.discountValue]);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data.customers || response.data || []);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    }
  };

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getOne(id);
      const campaign = response.data;
      setFormData({
        ...emptyFormData,
        ...campaign,
        discountType: campaign.discountType || 'percentage',
        discountValue: campaign.discountValue || campaign.discountPercentage || 0,
        scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : '',
        socialLinks: { ...emptyFormData.socialLinks, ...(campaign.socialLinks || {}) },
        autoSchedule: { ...emptyFormData.autoSchedule, ...(campaign.autoSchedule || {}) },
        specificCustomers: campaign.specificCustomers || [],
      });
      if (campaign.imageUrl) {
        setImagePreview(campaign.imageUrl);
      }
      navigate('/admin/campaigns');
    } catch {
      toast.error('Failed to load campaign');
      navigate('/admin/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      };

      if (isEdit) {
        await campaignAPI.update(id, submitData);
        toast.success('Campaign updated successfully!');
      } else {
        await campaignAPI.create(submitData);
        toast.success('Campaign created successfully!');
      }
      navigate('/admin/campaigns');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    const audienceByType = {
      AutoBirthday: 'Birthday',
      AutoAnniversary: 'Anniversary',
      AutoSpecial: 'SpecialDay',
    };
    const nextAudience = audienceByType[type] || formData.targetAudience;
    const placeholderMessage = messageTemplates[nextAudience] || messageTemplates.All;

    setFormData({
      ...formData,
      type,
      targetAudience: nextAudience,
      message: formData.message || placeholderMessage,
      autoSchedule: {
        ...formData.autoSchedule,
        enabled: type === 'AutoBirthday' || type === 'AutoAnniversary',
      },
    });
  };

  const handleAudienceChange = (targetAudience) => {
    setFormData({
      ...formData,
      targetAudience,
      message: messageTemplates[targetAudience] || formData.message,
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData({ ...formData, imageUrl: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    setImagePreview('');
  };

  const insertPlaceholder = (placeholder) => {
    const textarea = document.querySelector('textarea[name="message"]');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = formData.message.substring(0, start) + placeholder + formData.message.substring(end);
    setFormData({ ...formData, message: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  const isFormValid = () => {
    if (!formData.name.trim()) return false;
    if (formData.targetAudience === 'Individual' && (!formData.specificCustomers || formData.specificCustomers.length === 0)) return false;
    if (!formData.message.trim()) return false;
    if (formData.type === 'AutoSpecial' && (!formData.scheduledAt || !formData.autoSchedule.time)) return false;
    return true;
  };

  if (loading && isEdit) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[rgb(var(--color-brown))] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate('/admin/campaigns')}
            className="rounded-2xl border border-[rgb(var(--color-border))] bg-white p-3 text-[rgb(var(--color-brown))] shadow-sm transition-all hover:bg-[rgb(var(--color-surface))] hover:scale-105"
            title="Back to campaigns"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-600 animate-pulse" />
              WhatsApp Marketing Engine
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[rgb(var(--color-brown))]">
              {isEdit ? 'Refine Campaign settings' : 'Launch New Campaign'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_390px]">
        {/* Left Side Wizard Panel */}
        <div className="rounded-3xl border border-[rgb(var(--color-border))] bg-white p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
          
          <div className="space-y-5">
            {/* SECTION 1: Campaign Target & Audience */}
            <div className="bg-[#faf9f6]/30 border border-black/[0.04] rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.015)]">
              <div>
                <h3 className="text-sm font-black text-[rgb(var(--color-brown))] flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-orange-600 text-xs font-black">1</span>
                  Campaign Target & Audience
                </h3>
                <p className="text-[11px] text-[rgb(var(--color-text-secondary))] mt-0.5 ml-8">Set the campaign target, select audience filter or choose specific customers.</p>
              </div>

              {/* Campaign Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[rgb(var(--color-text-primary))] flex items-center gap-1.5">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Birthday Special 15% OFF"
                  className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all font-semibold"
                  required
                />
              </div>

              {/* Campaign Type (Objective) Card Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[rgb(var(--color-text-primary))]">Choose Campaign Objective</label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {campaignTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeChange(type.value)}
                        className={`rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-[rgb(var(--color-brown))] bg-orange-50/20 shadow-sm ring-1 ring-orange-100'
                            : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${type.color} text-white shadow-sm`}>
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <span className="font-black text-xs text-[rgb(var(--color-text-primary))]">{type.label}</span>
                        </div>
                        <p className="mt-1.5 text-[10px] font-semibold text-[rgb(var(--color-text-secondary))] leading-normal">
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Audience selection */}
              {formData.type === 'Manual' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[rgb(var(--color-text-primary))]">Target Audience</label>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {audienceOptions.map((opt) => {
                      const isSelected = formData.targetAudience === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAudienceChange(opt.value)}
                          className={`rounded-xl border p-2.5 text-left transition-all ${
                            isSelected
                              ? 'border-[rgb(var(--color-brown))] bg-orange-50/10 font-bold'
                              : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:bg-white'
                          }`}
                        >
                          <span className="block text-xs font-black text-[rgb(var(--color-text-primary))]">{opt.label}</span>
                          <span className="mt-0.5 block text-[10px] text-[rgb(var(--color-text-secondary))] leading-tight">{opt.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specific customers directories (If Audience is Individual) */}
              {formData.targetAudience === 'Individual' && (
                <div className="space-y-3 p-4 rounded-2xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wider">Search Contacts</span>
                      <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-0.5">{selectedCustomersCount} customer(s) selected</p>
                    </div>
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name or mobile..."
                        className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white py-1.5 pl-9 pr-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-xl border border-[rgb(var(--color-border))] bg-white p-2">
                    {filteredCustomers.length === 0 ? (
                      <p className="p-4 text-center text-xs font-semibold text-gray-400">No matching clients found.</p>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const isChecked = formData.specificCustomers.includes(customer._id);
                        return (
                          <label
                            key={customer._id}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all ${
                              isChecked ? 'bg-orange-50/15' : 'hover:bg-[rgb(var(--color-surface))]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(event) => {
                                  const specificCustomers = event.target.checked
                                    ? [...formData.specificCustomers, customer._id]
                                    : formData.specificCustomers.filter((id) => id !== customer._id);
                                  setFormData({ ...formData, specificCustomers });
                                }}
                                className="h-4.5 w-4.5 rounded-lg border-gray-300 text-[rgb(var(--color-brown))] focus:ring-0"
                              />
                              <div>
                                <span className="block text-sm font-black text-[rgb(var(--color-text-primary))]">{customer.name}</span>
                                <span className="text-xs font-semibold text-[rgb(var(--color-text-secondary))]">{customer.phone}</span>
                              </div>
                            </div>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-500">
                              {customer.orders} orders
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Craft Message Template & Coupon Settings */}
            <div className="bg-[#faf9f6]/30 border border-black/[0.04] rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.015)]">
              <div>
                <h3 className="text-sm font-black text-[rgb(var(--color-brown))] flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-orange-600 text-xs font-black">2</span>
                  Craft Message Template & Coupon Settings
                </h3>
                <p className="text-[11px] text-[rgb(var(--color-text-secondary))] mt-0.5 ml-8">Write the marketing copy and configure coupon settings for client checkouts.</p>
              </div>

              {/* Message Input Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[rgb(var(--color-text-primary))]">Compose Message <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{name}')}
                      className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-black text-[rgb(var(--color-brown))] hover:bg-orange-100 transition-colors"
                    >
                      + Client Name
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{coupon}')}
                      className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-black text-red-700 hover:bg-red-100 transition-colors"
                    >
                      + Coupon Code
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{link}')}
                      className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      + Order Link
                    </button>
                  </div>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  placeholder="Type your message copy..."
                  rows="5"
                  className="w-full resize-none rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3.5 py-2 text-xs text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] leading-relaxed font-semibold"
                  required
                />
              </div>

              {/* Coupon details grid */}
              <div className="p-3 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[rgb(var(--color-brown))]" />
                  <span className="text-xs font-black text-[rgb(var(--color-text-primary))]">Promo Code & Discount Settings</span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))]">Coupon Code</span>
                    <input
                      type="text"
                      value={formData.couponCode}
                      onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                      placeholder="BIRTHDAY20"
                      className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white px-3 py-2 text-xs font-black focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))]">Discount Type</span>
                    <select
                      value={formData.discountType || 'percentage'}
                      onChange={(e) => {
                        const type = e.target.value;
                        setFormData({
                          ...formData,
                          discountType: type,
                          discountPercentage: type === 'percentage' ? formData.discountValue : 0
                        });
                      }}
                      className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white px-3 py-2 text-xs font-black focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))]">
                      {formData.discountType === 'fixed' ? 'Discount Amount' : 'Discount Percentage'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={formData.discountType === 'percentage' ? "100" : undefined}
                      value={formData.discountValue || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setFormData({
                          ...formData,
                          discountValue: val,
                          discountPercentage: formData.discountType === 'percentage' ? val : 0
                        });
                      }}
                      placeholder={formData.discountType === 'fixed' ? '100' : '20'}
                      className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white px-3 py-2 text-xs font-black focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[rgb(var(--color-text-secondary))]">Destination Link</span>
                    <div className="relative">
                      <LinkIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={formData.offerLink}
                        onChange={(e) => setFormData({ ...formData, offerLink: e.target.value })}
                        placeholder="https://wa.me/order"
                        className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white py-2 pl-7.5 pr-2.5 text-xs font-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Uploader */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[rgb(var(--color-text-primary))]">Add Creative Banner (Optional)</label>
                {imagePreview ? (
                  <div className="relative max-w-sm overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                    <img src={imagePreview} alt="Campaign creative preview" className="h-44 w-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-2.5 top-2.5 rounded-full bg-red-600 p-2 text-white shadow-md hover:bg-red-700"
                      title="Delete creative image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-6 text-center hover:bg-white hover:border-[rgb(var(--color-brown))] transition-all">
                    <Upload className="mb-2 h-8 w-8 text-[rgb(var(--color-brown))]" />
                    <span className="text-xs font-black text-[rgb(var(--color-text-primary))]">Upload promo poster or cake creative</span>
                    <span className="mt-0.5 text-[10px] text-[rgb(var(--color-text-tertiary))]">PNG/JPG up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* SECTION 3: Campaign Schedule & Active State */}
            <div className="bg-[#faf9f6]/30 border border-black/[0.04] rounded-2xl p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.015)]">
              <div>
                <h3 className="text-sm font-black text-[rgb(var(--color-brown))] flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-orange-600 text-xs font-black">3</span>
                  Campaign Schedule & Active State
                </h3>
                <p className="text-[11px] text-[rgb(var(--color-text-secondary))] mt-0.5 ml-8">Define when messages should go out to the customers.</p>
              </div>

              {/* Automation settings: Auto Birthday & Anniversary */}
              {(formData.type === 'AutoBirthday' || formData.type === 'AutoAnniversary') && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-black text-[rgb(var(--color-text-primary))]">Enable Auto-Pilot Schedule</span>
                      <span className="text-[10px] text-[rgb(var(--color-text-secondary))]">Run automatically daily without manual triggers.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        autoSchedule: { ...formData.autoSchedule, enabled: !formData.autoSchedule.enabled }
                      })}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${formData.autoSchedule.enabled ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${formData.autoSchedule.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  {formData.autoSchedule.enabled && (
                    <div className="grid gap-3 sm:grid-cols-2 p-3 rounded-xl border border-[rgb(var(--color-border))] bg-white">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[rgb(var(--color-text-primary))]">Daily Execution Time</label>
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="time"
                            value={formData.autoSchedule.time}
                            onChange={(e) => setFormData({
                              ...formData,
                              autoSchedule: { ...formData.autoSchedule, time: e.target.value }
                            })}
                            className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] pl-8.5 pr-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[rgb(var(--color-text-primary))]">Send Notification</label>
                        <select
                          value={formData.autoSchedule.daysInAdvance}
                          onChange={(e) => setFormData({
                            ...formData,
                            autoSchedule: { ...formData.autoSchedule, daysInAdvance: parseInt(e.target.value, 10) }
                          })}
                          className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                        >
                          <option value={0}>On the same day</option>
                          <option value={1}>1 day before</option>
                          <option value={2}>2 days before</option>
                          <option value={3}>3 days before</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Special Day schedule settings */}
              {formData.type === 'AutoSpecial' && (
                <div className="grid gap-3 sm:grid-cols-2 p-3 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[rgb(var(--color-text-primary))] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Calendar Date</label>
                    <input
                      type="date"
                      value={formData.scheduledAt ? formData.scheduledAt.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        const time = formData.autoSchedule.time || '09:00';
                        setFormData({ ...formData, scheduledAt: `${date}T${time}` });
                      }}
                      className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[rgb(var(--color-text-primary))] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Trigger Time</label>
                    <input
                      type="time"
                      value={formData.autoSchedule.time}
                      onChange={(e) => {
                        const time = e.target.value;
                        const date = formData.scheduledAt ? formData.scheduledAt.split('T')[0] : '';
                        setFormData({
                          ...formData,
                          autoSchedule: { ...formData.autoSchedule, time },
                          scheduledAt: date ? `${date}T${time}` : '',
                        });
                      }}
                      className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Manual campaign settings */}
              {formData.type === 'Manual' && (
                <div className="space-y-1.5 p-3 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                  <label className="text-xs font-bold text-[rgb(var(--color-text-primary))] flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Schedule Send Date & Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                  <span className="block text-[10px] font-semibold text-gray-500">Leave blank if you wish to trigger this campaign manually from the list page later.</span>
                </div>
              )}

              {/* Toggle: Campaign Active State */}
              <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-black text-[rgb(var(--color-text-primary))]">Campaign Active State</span>
                  <span className="text-[10px] text-[rgb(var(--color-text-secondary))]">Only active campaigns are executed by the scheduler.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${formData.isActive ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${formData.isActive ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Attached Social Links */}
              <div className="space-y-2 p-3 rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                <span className="block text-xs font-black text-[rgb(var(--color-text-primary))]">Attach Brand Links</span>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={formData.socialLinks.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, website: e.target.value }
                      })}
                      placeholder="Website link"
                      className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white pl-8.5 pr-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Instagram className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-500" />
                    <input
                      type="url"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                      })}
                      placeholder="Instagram URL"
                      className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-white pl-8.5 pr-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Footer Buttons */}
          <div className="mt-6 pt-4 border-t border-[rgb(var(--color-border))] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/campaigns')}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-[rgb(var(--color-border))] bg-white px-4 text-xs font-black text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-surface))] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 text-xs font-black text-white shadow shadow-emerald-100 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? 'Update Campaign' : 'Launch Campaign'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Realistic Phone Mockup WhatsApp Preview */}
        <aside className="sticky top-24">
          <div className="relative mx-auto w-[360px] h-[570px] rounded-[42px] border-[10px] border-gray-900 bg-gray-950 p-2 shadow-2xl overflow-hidden flex flex-col">
            {/* Phone Top Notch Speaker */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-gray-900 rounded-full z-20 flex items-center justify-center">
              <div className="w-12 h-1 bg-gray-800 rounded-full mb-1" />
            </div>

            {/* WhatsApp Header bar */}
            <div className="bg-[#075e54] text-white pt-6 pb-2.5 px-3 flex items-center gap-2.5 z-10">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {formData.name ? formData.name.slice(0, 2).toUpperCase() : 'BC'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-none truncate">{formData.name || 'BakeryCRM Campaign'}</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/80">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Screen Background */}
            <div className="flex-1 bg-[#efeae2] p-3 overflow-y-auto space-y-3 relative flex flex-col justify-end">
              
              {/* Message Bubble Card */}
              <div className="max-w-[85%] rounded-2xl bg-white p-2.5 shadow-sm self-start border border-black/[0.03] space-y-2 text-sm leading-relaxed text-gray-800 relative">
                {/* Arrow pointer */}
                <div className="absolute top-3 -left-1.5 w-3 h-3 bg-white transform rotate-45 border-l border-t border-black/[0.01]" />
                
                {/* Image Creative preview */}
                {imagePreview ? (
                  <div className="w-full aspect-video overflow-hidden rounded-xl bg-gray-100 border">
                    <img src={imagePreview} alt="Creative asset" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                {/* Main Message Text content */}
                <p className="whitespace-pre-wrap text-xs text-gray-800">{previewMessage}</p>

                {/* Dashboard Coupon Code Block */}
                {formData.couponCode && (
                  <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50/50 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-orange-800">Dynamic Store Coupon</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-xs font-bold text-orange-950">{formData.couponCode}</span>
                      {(formData.discountValue > 0 || formData.discountPercentage > 0) && (
                        <span className="rounded bg-orange-700 px-1.5 py-0.5 text-[9px] font-black text-white">
                          {formData.discountType === 'fixed' ? `Rs. ${formData.discountValue || formData.discountPercentage}` : `${formData.discountValue || formData.discountPercentage}%`} OFF
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Attached Links list */}
                {(formData.socialLinks.website || formData.socialLinks.instagram || formData.socialLinks.facebook) && (
                  <div className="border-t pt-2 mt-2 space-y-1 text-[10px] font-bold text-blue-600">
                    {formData.socialLinks.website && <p className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Website Link</p>}
                    {formData.socialLinks.instagram && <p className="flex items-center gap-1.5"><Instagram className="w-3 h-3" /> Instagram Profile</p>}
                  </div>
                )}

                {/* Message Timestamp */}
                <div className="flex justify-end items-center gap-1 text-[9px] text-gray-400 font-semibold mt-1">
                  <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-blue-500">✓✓</span>
                </div>
              </div>
            </div>
            
            {/* Phone Home Button Indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CampaignForm;
