import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Filter, Search } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const UserStatusManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [activeTab, pagination.page, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        status: activeTab,
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      };
      const data = await adminService.getUsersByStatus(params);
      setUsers(data.users || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const columns = [
    {
      header: 'User Details',
      accessor: 'name',
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
          <div className="text-xs text-gray-400">
            ID: {user._id?.slice(-8)}
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: 'contact',
      render: (user) => (
        <div>
          <div className="text-sm">{user.phone}</div>
          <div className="text-sm text-gray-500">{user.businessName}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (user) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
          {user.status?.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Registration Date',
      accessor: 'createdAt',
      render: (user) => (
        <div className="text-sm">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (user) => (
        <button
          onClick={() => handleStatusToggle(user._id, user.status)}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            user.status === 'active'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {user.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      )
    }
  ];

  const stats = {
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-2 text-purple-600" size={28} />
            User Status Management
          </h1>
          <p className="text-gray-600 mt-1">Manage active and inactive users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <UserX className="text-red-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center p-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`pb-4 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Users ({stats.active})
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`pb-4 border-b-2 font-medium text-sm ${
                  activeTab === 'inactive'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Inactive Users ({stats.inactive})
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={users.filter(user => user.status === activeTab)}
          columns={columns}
          loading={loading}
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
    </motion.div>
  );
};

export default UserStatusManagement;