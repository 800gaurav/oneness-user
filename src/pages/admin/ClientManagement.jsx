import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Crown, Users, Building, Phone, Mail, Filter, LogIn, Search, Package, Calendar } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const ClientForm = ({ client, onSubmit, onClose, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    address: ''
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password {!isEdit && '*'}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
            placeholder={isEdit ? "Leave blank to keep current password" : "Set login password for client"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {isEdit ? 'Update' : 'Register'} User
        </button>
      </div>
    </form>
  );
};

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    subscriptionStatus: '',
    role: 'client'
  });

  useEffect(() => {
    fetchClients();
    fetchPlans();
  }, [pagination.page, filters]);

  const fetchPlans = async () => {
    try {
      const data = await adminService.getAllPlans();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const data = await adminService.getAllUsers(params);
      setClients(data.users || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingClient) {
        // Update existing user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Don't update password if empty
        }
        await adminService.updateUser(editingClient._id, updateData);
        toast.success('User updated successfully');
      } else {
        // Admin registers new user
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          businessName: formData.businessName,
          address: formData.address
        };
        await adminService.registerUser(userData);
        toast.success(`User registered! Email: ${formData.email}`);
      }
      setShowModal(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleAssignPlan = async (planId) => {
    try {
      await adminService.assignPlanToUser(selectedUser._id, planId);
      toast.success('Plan assigned successfully');
      setShowPlanModal(false);
      setSelectedUser(null);
      fetchClients();
    } catch (error) {
      toast.error('Failed to assign plan');
    }
  };

  const handleUpdateExpiry = async (endDate) => {
    try {
      await adminService.updateUserPlanExpiry(selectedUser._id, endDate);
      toast.success('Plan expiry updated successfully');
      setShowExpiryModal(false);
      setSelectedUser(null);
      fetchClients();
    } catch (error) {
      toast.error('Failed to update plan expiry');
    }
  };

  const handleLoginAsClient = async (clientId) => {
    try {
      const data = await adminService.loginAsClient(clientId);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Logged in as client successfully');
        window.location.href = '/admin';
      }
    } catch (error) {
      toast.error('Failed to login as client');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      email: '',
      phone: '',
      status: '',
      subscriptionStatus: '',
      role: 'client'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // await adminAPI.deleteUser(id);
        toast.success('User deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const getPlanColor = (plan) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-yellow-100 text-yellow-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      header: 'Client Details',
      accessor: 'name',
      render: (client) => (
        <div>
          <div className="font-medium text-gray-900">{client.name}</div>
          <div className="text-sm text-gray-500">{client.businessName}</div>
          <div className="text-xs text-gray-400">
            Joined: {new Date(client.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'contact',
      render: (client) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Mail size={14} className="mr-1" />
            {client.email}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone size={14} className="mr-1" />
            {client.phone}
          </div>
        </div>
      )
    },
    {
      header: 'Subscription',
      accessor: 'subscription',
      render: (client) => (
        <div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(client.subscription.plan)}`}>
            {client.subscription.plan.toUpperCase()}
          </span>
          <div className="mt-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.subscription.status)}`}>
              {client.subscription.status}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (client) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleLoginAsClient(client._id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Login as Client"
          >
            <LogIn size={16} />
          </button>
          <button
            onClick={() => handleEdit(client)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Edit User"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedUser(client);
              setShowPlanModal(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="Assign Plan"
          >
            <Package size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedUser(client);
              setShowExpiryModal(true);
            }}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
            title="Update Expiry"
          >
            <Calendar size={16} />
          </button>
          <button
            onClick={() => handleDelete(client._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete User"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-2 text-purple-600" size={28} />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage users and their access</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} className="mr-2" />
            Filters
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} className="mr-2" />
            Register User
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white p-6 rounded-lg shadow border"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Search by name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="Search by email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={filters.phone}
                onChange={(e) => handleFilterChange('phone', e.target.value)}
                placeholder="Search by phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
              <select
                value={filters.subscriptionStatus}
                onChange={(e) => handleFilterChange('subscriptionStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Subscriptions</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={clients}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search users..."
        />
        
        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(null);
        }}
        title={editingClient ? 'Edit User' : 'Register New User'}
        size="lg"
      >
        <ClientForm
          client={editingClient}
          isEdit={!!editingClient}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingClient(null);
          }}
        />
      </Modal>

      {/* Plan Assignment Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => {
          setShowPlanModal(false);
          setSelectedUser(null);
        }}
        title="Assign Plan"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Select a plan for {selectedUser?.name}</p>
          <div className="space-y-2">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAssignPlan(plan._id)}
              >
                <div>
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-sm text-gray-500">{plan.days} days - ₹{plan.price}</div>
                </div>
                <Package className="text-purple-600" size={20} />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Plan Expiry Modal */}
      <Modal
        isOpen={showExpiryModal}
        onClose={() => {
          setShowExpiryModal(false);
          setSelectedUser(null);
        }}
        title="Update Plan Expiry"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Update plan expiry for {selectedUser?.name}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const endDate = e.target.endDate.value;
              handleUpdateExpiry(endDate);
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowExpiryModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Update Expiry
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ClientManagement;