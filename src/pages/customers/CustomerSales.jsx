import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, Calendar } from 'lucide-react';
import { customerTransactionsAPI, customersAPI, materialsAPI } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';

const CustomerSales = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const { loading, execute } = useApi();

  const [formData, setFormData] = useState({
    customerId: customerId || '',
    materialId: '',
    quantity: '',
    rate: '',
    note: ''
  });

  useEffect(() => {
    fetchCustomers();
    fetchMaterials();
    fetchSales();
  }, [customerId]);

  const fetchCustomers = async () => {
    await execute(
      () => customersAPI.getAll(),
      { errorMessage: 'Failed to load customers', showSuccess: false }
    ).then(response => {
      setCustomers(response.data.customers || []);
    });
  };

  const fetchMaterials = async () => {
    await execute(
      () => materialsAPI.getAll(),
      { errorMessage: 'Failed to load materials', showSuccess: false }
    ).then(response => {
      setMaterials(response.data.materials || []);
    });
  };

  const fetchSales = async () => {
    const params = customerId ? { customerId } : {};
    await execute(
      () => customerTransactionsAPI.getAllSales(params),
      { errorMessage: 'Failed to load sales', showSuccess: false }
    ).then(response => {
      setSales(response.data.transactions || []);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => customerTransactionsAPI.createSale(formData),
      { successMessage: 'Sale created successfully', errorMessage: 'Failed to create sale' }
    ).then(() => {
      setShowModal(false);
      resetForm();
      fetchSales();
    });
  };

  const resetForm = () => {
    setFormData({
      customerId: customerId || '',
      materialId: '',
      quantity: '',
      rate: '',
      note: ''
    });
  };

  const handleFilterByCustomer = (custId) => {
    setSelectedCustomerId(custId);
    if (custId) {
      execute(
        () => customerTransactionsAPI.getAllSales({ customerId: custId }),
        { errorMessage: 'Failed to load sales', showSuccess: false }
      ).then(response => {
        setSales(response.data.transactions || []);
      });
    } else {
      fetchSales();
    }
  };

  const totalAmount = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Sales</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage material sales to customers</p>
        </div>
        <div className="flex gap-2">
          {customerId && (
            <Button variant="outline" onClick={() => navigate('/dashboard/customers')}>
              Back to Customers
            </Button>
          )}
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus size={20} />
            Add Sale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sales.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Sales</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Amount</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          {!customerId && (
            <select
              value={selectedCustomerId}
              onChange={(e) => handleFilterByCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>{customer.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Note</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {sale.customerId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {sale.materialId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ₹{sale.rate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ₹{sale.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {sale.note || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Add New Sale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Customer"
            type="select"
            name="customerId"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            options={customers.map(c => ({ value: c._id, label: c.name }))}
            placeholder="Select Customer"
            required
          />
          <FormField
            label="Material"
            type="select"
            name="materialId"
            value={formData.materialId}
            onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
            options={materials.map(m => ({ value: m._id, label: m.name }))}
            placeholder="Select Material"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
            <FormField
              label="Rate"
              type="number"
              name="rate"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              required
            />
          </div>
          <FormField
            label="Note"
            type="textarea"
            name="note"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit">Add Sale</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default CustomerSales;
