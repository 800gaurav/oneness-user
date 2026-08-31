import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard } from 'lucide-react';
import { customerTransactionsAPI, customersAPI } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import useApi from '../../hooks/useApi';

const CustomerPayments = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const { loading, execute } = useApi();

  const [formData, setFormData] = useState({
    customerId: customerId || '',
    amount: '',
    paymentMethod: 'cash',
    note: ''
  });

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' }
  ];

  useEffect(() => {
    fetchCustomers();
    fetchPayments();
  }, [customerId]);

  const fetchCustomers = async () => {
    await execute(
      () => customersAPI.getAll(),
      { errorMessage: 'Failed to load customers', showSuccess: false }
    ).then(response => {
      setCustomers(response.data.customers || []);
    });
  };

  const fetchPayments = async () => {
    const params = customerId ? { customerId } : {};
    await execute(
      () => customerTransactionsAPI.getAllPayments(params),
      { errorMessage: 'Failed to load payments', showSuccess: false }
    ).then(response => {
      setPayments(response.data.payments || []);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      () => customerTransactionsAPI.createPayment(formData),
      { successMessage: 'Payment recorded successfully', errorMessage: 'Failed to record payment' }
    ).then(() => {
      setShowModal(false);
      resetForm();
      fetchPayments();
    });
  };

  const resetForm = () => {
    setFormData({
      customerId: customerId || '',
      amount: '',
      paymentMethod: 'cash',
      note: ''
    });
  };

  const handleFilterByCustomer = (custId) => {
    setSelectedCustomerId(custId);
    if (custId) {
      execute(
        () => customerTransactionsAPI.getAllPayments({ customerId: custId }),
        { errorMessage: 'Failed to load payments', showSuccess: false }
      ).then(response => {
        setPayments(response.data.payments || []);
      });
    } else {
      fetchPayments();
    }
  };

  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Payments</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage payments received from customers</p>
        </div>
        <div className="flex gap-2">
          {customerId && (
            <Button variant="outline" onClick={() => navigate('/dashboard/customers')}>
              Back to Customers
            </Button>
          )}
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus size={20} />
            Add Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{payments.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Payments</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Received</div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Note</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {payment.customerId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {payment.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {payment.note || '-'}
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
        title="Add New Payment"
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
            label="Amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <FormField
            label="Payment Method"
            type="select"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            options={paymentMethods}
            required
          />
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
            <Button type="submit">Add Payment</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default CustomerPayments;
