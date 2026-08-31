import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Package, Calendar, Users } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const PlanForm = ({ plan, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    duration: 'monthly',
    days: 30,
    price: 0,
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    }
  }, [plan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Days *</label>
          <input
            type="number"
            value={formData.days}
            onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            placeholder="Add feature"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{feature}</span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
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
          {plan ? 'Update' : 'Create'} Plan
        </button>
      </div>
    </form>
  );
};

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllPlans();
      setPlans(data.plans || []);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingPlan) {
        await adminService.updatePlan(editingPlan._id, formData);
        toast.success('Plan updated successfully');
      } else {
        await adminService.createPlan(formData);
        toast.success('Plan created successfully');
      }
      setShowModal(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await adminService.deletePlan(planId);
        toast.success('Plan deleted successfully');
        fetchPlans();
      } catch (error) {
        toast.error('Failed to delete plan');
      }
    }
  };

  const columns = [
    {
      header: 'Plan Details',
      accessor: 'name',
      render: (plan) => (
        <div>
          <div className="font-medium text-gray-900">{plan.name}</div>
          <div className="text-sm text-gray-500">{plan.duration}</div>
        </div>
      )
    },
    {
      header: 'Duration & Price',
      accessor: 'price',
      render: (plan) => (
        <div>
          <div className="font-medium text-purple-600">₹{plan.price}</div>
          <div className="text-sm text-gray-500">{plan.days} days</div>
        </div>
      )
    },
    {
      header: 'Features',
      accessor: 'features',
      render: (plan) => (
        <div className="text-sm">
          {plan.features?.slice(0, 2).map((feature, index) => (
            <div key={index} className="text-gray-600">• {feature}</div>
          ))}
          {plan.features?.length > 2 && (
            <div className="text-gray-400">+{plan.features.length - 2} more</div>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (plan) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(plan)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(plan._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
            <Package className="mr-2 text-purple-600" size={28} />
            Plan Management
          </h1>
          <p className="text-gray-600 mt-1">Create and manage subscription plans</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={20} className="mr-2" />
          Create Plan
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={plans}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search plans..."
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlan(null);
        }}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        size="lg"
      >
        <PlanForm
          plan={editingPlan}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingPlan(null);
          }}
        />
      </Modal>
    </motion.div>
  );
};

export default PlanManagement;
