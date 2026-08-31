import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X, Info } from 'lucide-react';

const SweetAlert = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  showCancel = true 
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <X className="w-16 h-16 text-red-500" />;
      case 'info':
        return <Info className="w-16 h-16 text-blue-500" />;
      default:
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-yellow-600 hover:bg-yellow-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-10 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {getIcon()}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="flex gap-3 justify-center">
                {showCancel && (
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${getButtonColor()}`}
                >
                  {loading ? 'Processing...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SweetAlert;