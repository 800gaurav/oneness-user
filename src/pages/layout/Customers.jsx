import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, X, Cake, Heart, Filter, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { customerAPI, settingsAPI } from '../../services/api';
import SweetAlert from '../../components/ui/SweetAlert';

const defaultCheckoutFields = {
  name: true,
  phone: true,
  email: true,
  address: true,
  dob: true,
  anniversaryDate: true,
  specialDate: true,
  orderNotes: true
};

const emptyFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  birthday: '',
  anniversary: '',
  specialDate: '',
  notes: ''
};

const Customers = ({ openAddSignal = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [occasionDate, setOccasionDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [visibleFields, setVisibleFields] = useState(defaultCheckoutFields);
  const [sweetAlert, setSweetAlert] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null });
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterDate, occasionDate]);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (openAddSignal > 0) {
      setEditingCustomer(null);
      setFormData(emptyFormData);
      setShowAddSidebar(true);
    }
  }, [openAddSignal]);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setVisibleFields({ ...defaultCheckoutFields, ...(response.data.data?.adminCustomerFields || {}) });
    } catch (error) {
      console.error('Failed to fetch customer field settings', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll({ search: searchTerm, filterDate, occasionDate });
      setCustomers(response.data);
    } catch {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (customer) => {
    setSweetAlert({
      isOpen: true,
      type: 'warning',
      title: `${customer.active ? 'Deactivate' : 'Activate'} Customer`,
      message: `Are you sure you want to ${customer.active ? 'deactivate' : 'activate'} ${customer.name}? ${customer.active ? 'They will stop receiving messages.' : 'They will start receiving messages again.'}`,
      onConfirm: async () => {
        try {
          const response = await customerAPI.toggleActive(customer._id);
          setCustomers(customers.map(c => c._id === customer._id ? response.data : c));
          toast.success(`Customer ${customer.active ? 'deactivated' : 'activated'} successfully`);
        } catch {
          toast.error('Failed to update status');
        }
      }
    });
  };

  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone.replace(/\s+/g, ''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(formData.phone)) { toast.error('Mobile number must be exactly 10 digits'); return; }
    try {
      await customerAPI.create(formData);
      setFormData(emptyFormData);
      setShowAddSidebar(false);
      fetchCustomers();
      toast.success('Customer added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
    }
  };

  const handleDelete = async (customer) => {
    setSweetAlert({
      isOpen: true,
      type: 'error',
      title: 'Delete Customer',
      message: `Are you sure you want to delete ${customer.name}? This action cannot be undone and will remove all their data including orders and messages.`,
      onConfirm: async () => {
        try {
          await customerAPI.delete(customer._id);
          fetchCustomers();
          toast.success('Customer deleted successfully');
        } catch {
          toast.error('Failed to delete customer');
        }
      }
    });
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      birthday: customer.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : '',
      anniversary: customer.anniversary ? new Date(customer.anniversary).toISOString().split('T')[0] : '',
      specialDate: (customer.specialDate || customer.specialDay) ? new Date(customer.specialDate || customer.specialDay).toISOString().split('T')[0] : '',
      notes: customer.notes || ''
    });
    setShowEditSidebar(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validatePhone(formData.phone)) { toast.error('Mobile number must be exactly 10 digits'); return; }
    try {
      await customerAPI.update(editingCustomer._id, formData);
      setShowEditSidebar(false);
      setEditingCustomer(null);
      fetchCustomers();
      toast.success('Customer updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return today.getMonth() === checkDate.getMonth() && today.getDate() === checkDate.getDate();
  };

  const isTomorrow = (date) => {
    if (!date) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkDate = new Date(date);
    return tomorrow.getMonth() === checkDate.getMonth() && tomorrow.getDate() === checkDate.getDate();
  };

  const activeFiltersCount = filterDate !== 'all' ? 1 : 0;
  const showCustomerField = (key) => {
    const field = visibleFields?.[key];
    if (typeof field === 'boolean') return field;
    return field?.visible !== false;
  };

  const isCustomerFieldRequired = (key) => {
    const field = visibleFields?.[key];
    if (typeof field === 'boolean') return false;
    return field?.required === true;
  };

  return (
    <div className="space-y-2">
  
      {/* Search Bar with Add Button */}
      <div className="bg-white rounded-xl p-2 shadow-sm border border-[rgb(var(--color-border))]">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-surface-dark))] transition-colors"
          >
            <Filter className="w-4 h-4 text-[rgb(var(--color-brown))]" />
            <span className="hidden sm:inline text-sm font-medium text-[rgb(var(--color-text-primary))]">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 bg-[rgb(var(--color-brown))] text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowAddSidebar(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[rgb(var(--color-brown))] text-white rounded-lg hover:bg-[rgb(var(--color-light-brown))] transition-all shadow-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Customer</span>
          </button>
        </div>
      </div>

      {/* Left Sidebar - Filters */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed left-0 top-0 h-full w-full md:w-[380px] md:left-64 bg-white shadow-2xl z-[60] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[rgb(var(--color-brown))] to-[rgb(var(--color-light-brown))] px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <p className="text-xs text-white/70 mt-0.5">Filter by special occasions</p>
              </div>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 p-5 space-y-6">
              {/* Date Picker */}
              <div>
                <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-2">Select Date</label>
                <input
                  type="date"
                  value={occasionDate}
                  onChange={(e) => setOccasionDate(e.target.value)}
                  className="w-full rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                />
              </div>

              {/* Birthday */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Cake className="w-4 h-4 text-pink-500" />
                  </div>
                  <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">Birthdays</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { id: 'today-birthday', label: "Today's Birthdays" },
                    { id: 'tomorrow-birthday', label: "Tomorrow's Birthdays" },
                    { id: 'birthday-date', label: 'Birthday on Selected Date' },
                    { id: 'birthday-week', label: 'Birthdays This Week' },
                    { id: 'birthday-month', label: 'Birthdays This Month' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterDate(f.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        filterDate === f.id
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] hover:bg-pink-50 hover:text-pink-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anniversary */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">Anniversaries</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { id: 'today-anniversary', label: "Today's Anniversaries" },
                    { id: 'tomorrow-anniversary', label: "Tomorrow's Anniversaries" },
                    { id: 'anniversary-date', label: 'Anniversary on Selected Date' },
                    { id: 'anniversary-week', label: 'Anniversaries This Week' },
                    { id: 'anniversary-month', label: 'Anniversaries This Month' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterDate(f.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        filterDate === f.id
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Date */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-sm font-bold text-[rgb(var(--color-text-primary))]">Special Date</span>
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setFilterDate('special-date')}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      filterDate === 'special-date'
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    Special Date on Selected Date
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[rgb(var(--color-border))] p-4 flex gap-3">
              <button
                onClick={() => setFilterDate('all')}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2.5 rounded-xl bg-[rgb(var(--color-brown))] text-white text-sm font-semibold hover:bg-[rgb(var(--color-light-brown))] transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}

 

      {/* Customer Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[rgb(var(--color-border))] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[rgb(var(--color-brown))] border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">Customer</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">Phone</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">Birthday</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">Anniversary</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {customers.map((customer, idx) => (
                  <tr key={customer._id} className="hover:bg-[rgb(var(--color-surface))] transition-colors group">
                    <td className="px-3 py-2 text-xs text-[rgb(var(--color-text-tertiary))]">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-[rgb(var(--color-pink))] to-[rgb(var(--color-accent))] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-[rgb(var(--color-brown))]">{customer.name.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate max-w-[140px]">{customer.name}</p>
                          <p className="text-xs text-[rgb(var(--color-text-tertiary))]">{customer.orders || 0} orders</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-[rgb(var(--color-text-secondary))]">{customer.phone}</td>
                    <td className="px-3 py-2">
                      {customer.birthday ? (
                        <div className="flex items-center gap-1">
                          <Cake className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                          <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                            {new Date(customer.birthday).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          {isToday(customer.birthday) && <span className="px-1.5 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">Today</span>}
                          {isTomorrow(customer.birthday) && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Tmrw</span>}
                        </div>
                      ) : <span className="text-xs text-[rgb(var(--color-text-tertiary))]">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      {customer.anniversary ? (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                            {new Date(customer.anniversary).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          {isToday(customer.anniversary) && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Today</span>}
                          {isTomorrow(customer.anniversary) && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Tmrw</span>}
                        </div>
                      ) : <span className="text-xs text-[rgb(var(--color-text-tertiary))]">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleActive(customer)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${customer.active ? 'bg-green-500' : 'bg-gray-300'}`}
                        title={customer.active ? 'Active' : 'Inactive'}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${customer.active ? 'translate-x-5' : ''}`} />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(customer)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button onClick={() => handleDelete(customer)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Sidebar - Add */}
      {showAddSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 animate-fadeIn" 
            onClick={() => setShowAddSidebar(false)}
            style={{ backdropFilter: 'blur(8px)' }}
          />
          
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideIn">
            <div className="sticky top-0 bg-gradient-to-r from-[rgb(var(--color-brown))] to-[rgb(var(--color-light-brown))] px-6 py-5 flex items-center justify-between shadow-lg z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Customer</h2>
                <p className="text-sm text-white/80 mt-1">Fill in customer details</p>
              </div>
              <button onClick={() => setShowAddSidebar(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {showCustomerField('name') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter customer name"
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all"
                    required
                  />
                </div>
              )}

              {showCustomerField('phone') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all"
                    required
                  />
                  {formData.phone && formData.phone.length !== 10 && (
                    <p className="text-[10px] text-red-500 mt-1">{formData.phone.length}/10 digits</p>
                  )}
                </div>
              )}

              {showCustomerField('email') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Email {isCustomerFieldRequired('email') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="customer@email.com"
                    required={isCustomerFieldRequired('email')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all"
                  />
                </div>
              )}

              {showCustomerField('address') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Address {isCustomerFieldRequired('address') && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Customer address"
                    required={isCustomerFieldRequired('address')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all resize-none"
                  />
                </div>
              )}

              {showCustomerField('dob') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Birthday {isCustomerFieldRequired('dob') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                    required={isCustomerFieldRequired('dob')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all"
                  />
                </div>
              )}

              {showCustomerField('anniversaryDate') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Anniversary {isCustomerFieldRequired('anniversaryDate') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) => setFormData({...formData, anniversary: e.target.value})}
                    required={isCustomerFieldRequired('anniversaryDate')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all"
                  />
                </div>
              )}

              {showCustomerField('specialDate') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Special Date {isCustomerFieldRequired('specialDate') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.specialDate}
                    onChange={(e) => setFormData({...formData, specialDate: e.target.value})}
                    required={isCustomerFieldRequired('specialDate')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all"
                  />
                </div>
              )}

              {showCustomerField('orderNotes') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Notes {isCustomerFieldRequired('orderNotes') && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows="4"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Add any additional notes..."
                    required={isCustomerFieldRequired('orderNotes')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))] transition-all resize-none"
                  ></textarea>
                </div>
              )}

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                <button
                  type="button"
                  onClick={() => setShowAddSidebar(false)}
                  className="flex-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 bg-[rgb(var(--color-brown))] hover:bg-[rgb(var(--color-light-brown))] text-white rounded-xl transition-all shadow-md font-medium text-sm"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Right Sidebar - Edit */}
      {showEditSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 animate-fadeIn" 
            onClick={() => setShowEditSidebar(false)}
            style={{ backdropFilter: 'blur(8px)' }}
          />
          
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideIn">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between shadow-lg z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Customer</h2>
                <p className="text-sm text-white/80 mt-1">Update customer details</p>
              </div>
              <button onClick={() => setShowEditSidebar(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {showCustomerField('name') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter customer name"
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              )}

              {showCustomerField('phone') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                  {formData.phone && formData.phone.length !== 10 && (
                    <p className="text-[10px] text-red-500 mt-1">{formData.phone.length}/10 digits</p>
                  )}
                </div>
              )}

              {showCustomerField('email') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Email {isCustomerFieldRequired('email') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="customer@email.com"
                    required={isCustomerFieldRequired('email')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              {showCustomerField('address') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Address {isCustomerFieldRequired('address') && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Customer address"
                    required={isCustomerFieldRequired('address')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>
              )}

              {showCustomerField('dob') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Birthday {isCustomerFieldRequired('dob') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                    required={isCustomerFieldRequired('dob')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              {showCustomerField('anniversaryDate') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Anniversary {isCustomerFieldRequired('anniversaryDate') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) => setFormData({...formData, anniversary: e.target.value})}
                    required={isCustomerFieldRequired('anniversaryDate')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              {showCustomerField('specialDate') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Special Date {isCustomerFieldRequired('specialDate') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={formData.specialDate}
                    onChange={(e) => setFormData({...formData, specialDate: e.target.value})}
                    required={isCustomerFieldRequired('specialDate')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              {showCustomerField('orderNotes') && (
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
                    Notes {isCustomerFieldRequired('orderNotes') && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows="4"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Add any additional notes..."
                    required={isCustomerFieldRequired('orderNotes')}
                    className="w-full px-3.5 py-2.5 text-sm bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  ></textarea>
                </div>
              )}

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                <button
                  type="button"
                  onClick={() => setShowEditSidebar(false)}
                  className="flex-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md font-medium text-sm"
                >
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
          Showing <span className="font-semibold text-[rgb(var(--color-brown))]">{customers.length}</span> customers
        </p>
      </div>
      {/* SweetAlert */}
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

export default Customers;
