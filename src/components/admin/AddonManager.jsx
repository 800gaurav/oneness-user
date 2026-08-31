import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Gift, X, Check, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AddonManager({ isOpen, onClose }) {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 49,
    category: 'Candles',
    image: '',
    description: '',
    inStock: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchAddons();
    }
  }, [isOpen]);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/addons`);
      setAddons(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load add-ons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAddon(null);
    setFormData({
      name: '',
      price: 49,
      category: 'Candles',
      image: '',
      description: '',
      inStock: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (addon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name || '',
      price: addon.price || 0,
      category: addon.category || 'Candles',
      image: addon.image || '',
      description: addon.description || '',
      inStock: addon.inStock !== false
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const loadingToast = toast.loading('Uploading add-on image...');
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await axios.post(`${API_URL}/upload`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded successfully!', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image', { id: loadingToast });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this add-on item?')) return;
    try {
      await axios.delete(`${API_URL}/addons/${id}`);
      toast.success('Add-on deleted');
      fetchAddons();
    } catch (err) {
      toast.error('Failed to delete add-on');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Name is required');

    try {
      if (editingAddon) {
        await axios.put(`${API_URL}/addons/${editingAddon._id}`, formData);
        toast.success('Add-on updated');
      } else {
        await axios.post(`${API_URL}/addons`, formData);
        toast.success('Add-on created');
      }
      setShowModal(false);
      fetchAddons();
    } catch (err) {
      toast.error('Failed to save add-on');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Gift className="w-6 h-6 text-amber-300" />
            <div>
              <h2 className="text-xl font-bold">Store Add-on Items Manager</h2>
              <p className="text-xs text-amber-200">Manage party candles, cake toppers, balloons, cards & extras for Single Product view</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-amber-50/30">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-semibold text-gray-600">Available Add-ons ({addons.length})</span>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium rounded-xl flex items-center space-x-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Add-on</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading add-ons...</div>
          ) : addons.length === 0 ? (
            <div className="py-12 text-center text-gray-400">No add-ons found. Click "Add New Add-on" to create one.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addons.map(item => (
                <div key={item._id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold">
                        <Gift className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs font-bold text-amber-800">₹{item.price}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-medium">{item.category}</span>
                        {!item.inStock && (
                          <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-medium">Out of stock</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleOpenEditModal(item)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Addon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-amber-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingAddon ? 'Edit Add-on' : 'Add New Store Add-on'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Add-on Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sparkler Candle, Happy Birthday Topper"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  >
                    <option value="Candles">Candles</option>
                    <option value="Toppers">Toppers</option>
                    <option value="Balloons">Balloons</option>
                    <option value="Party Wear">Party Wear</option>
                    <option value="Cards">Greeting Cards</option>
                    <option value="Extras">Extras</option>
                  </select>
                </div>
              </div>

              {/* Add-on Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Add-on Image</label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {formData.image ? (
                  <div className="flex items-center gap-3 p-2.5 border border-amber-200 rounded-xl bg-amber-50/50">
                    <img
                      src={formData.image}
                      alt="Add-on preview"
                      className="w-14 h-14 object-cover rounded-lg border border-amber-200 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">Image uploaded</p>
                      <p className="text-[11px] text-gray-500 truncate">{formData.image}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-2.5 py-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-xs"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-500 hover:bg-amber-50/30 cursor-pointer transition-all"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2 text-amber-700">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-xs font-bold">Uploading image...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-1.5">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-gray-700">Click to upload add-on image</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 5MB (auto-compressed)</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of this add-on item..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={formData.inStock}
                  onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-4 h-4 text-amber-700 rounded border-gray-300 focus:ring-amber-500"
                />
                <label htmlFor="inStockCheck" className="text-xs font-semibold text-gray-700">In Stock</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-medium shadow-md"
                >
                  Save Add-on
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
