import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Phone, Mail, CreditCard, MessageCircle, MapPin, Eye, Filter, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBalance, setCustomerBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hasEmail: false,
    hasWhatsapp: false,
    city: '',
   
  });
  const [stats, setStats] = useState({ total: 0, active: 0, totalReceivable: 0, totalBalance: 0 });

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: {
      street: '',
      city: '',
    
    },
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      const customersList = response.data.customers || [];
      setCustomers(customersList);
      
      // Calculate stats
      setStats({
        total: customersList.length,
        active: customersList.filter(c => c.isActive).length,
        totalReceivable: customersList.reduce((sum, c) => sum + (c.totalReceivable || 0), 0),
        totalBalance: customersList.reduce((sum, c) => sum + (c.balance || 0), 0)
      });
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const clearFilters = () => {
    setFilters({ hasEmail: false, hasWhatsapp: false, city: '', });
    setSearchTerm('');
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    const matchesEmail = !filters.hasEmail || customer.email;
    const matchesWhatsapp = !filters.hasWhatsapp || customer.whatsapp;
    const matchesCity = !filters.city || 
      customer.address?.city?.toLowerCase().includes(filters.city.toLowerCase());
    
  
    
    return matchesSearch && matchesEmail && matchesWhatsapp && matchesCity;
  });

  const cities = [...new Set(customers.map(c => c.address?.city).filter(Boolean))];

  const viewCustomerBalance = async (customer) => {
    try {
      setSelectedCustomer(customer);
      const response = await customerAPI.getBalance(customer._id);
      setCustomerBalance(response.data);
      setShowBalanceModal(true);
    } catch (error) {
      toast.error('Failed to load customer balance');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerAPI.update(editingCustomer._id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerAPI.create(formData);
        toast.success('Customer created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: {
        street: '',
        city: '',
      
      },
     
    });
    setEditingCustomer(null);
  };



  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customers and their details</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasEmail}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasEmail: e.target.checked }))}
                    className="mr-2"
                  />
                  Has Email
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasWhatsapp}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasWhatsapp: e.target.checked }))}
                    className="mr-2"
                  />
                  Has WhatsApp
                </label>
              </div>
              <div>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            
             
              <div>
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X size={16} className="mr-2" />
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">₹{stats.totalReceivable.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Receivable</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">₹{stats.totalBalance.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Outstanding</div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receivable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {customer.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          {customer.contactPerson && (
                            <div className="text-sm text-gray-500">{customer.contactPerson}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          {customer.phone}
                        </div>
                        {customer.whatsapp && (
                          <div className="flex items-center text-sm text-green-600">
                            <MessageCircle size={14} className="mr-2" />
                            {customer.whatsapp}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.address && (customer.address.street || customer.address.city) ? (
                        <div className="text-sm text-gray-900">
                          {customer.address.street && <div>{customer.address.street}</div>}
                          {customer.address.city && <div className="text-gray-500">{customer.address.city}</div>}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ₹{customer.totalReceivable?.toLocaleString() || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{customer.balance?.toLocaleString() || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setFormData({
                              name: customer.name || '',
                              contactPerson: customer.contactPerson || '',
                              phone: customer.phone || '',
                              whatsapp: customer.whatsapp || '',
                              email: customer.email || '',
                              address: customer.address || {
                                street: '',
                                city: '',
                              },
                            });
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => viewCustomerBalance(customer)}
                          className="text-purple-600 hover:text-purple-900"
                          title="View Balance"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No customers found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-purple-600 hover:text-purple-800"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-600">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, street: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>


          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Balance Modal */}
      <Modal
        isOpen={showBalanceModal}
        onClose={() => {
          setShowBalanceModal(false);
          setSelectedCustomer(null);
          setCustomerBalance(null);
        }}
        title="Customer Balance Details"
      >
        {customerBalance && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{customerBalance.name}</h3>
              <p className="text-sm text-gray-600">Customer ID: {customerBalance.customerId?.slice(-8)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">₹{customerBalance.totalReceivable?.toLocaleString()}</div>
                <div className="text-sm text-green-700">Total Receivable</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">₹{customerBalance.totalReceived?.toLocaleString()}</div>
                <div className="text-sm text-blue-700">Total Received</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">₹{customerBalance.balance?.toLocaleString()}</div>
                <div className="text-sm text-orange-700">Outstanding Balance</div>
              </div>
             
            </div>
            
          
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default Customers;
