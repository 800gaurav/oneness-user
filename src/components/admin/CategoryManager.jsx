import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Check, X, Layers, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CategoryManager({ isOpen, onClose, onCategoryUpdated }) {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    parentId: '',
    image: '',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchTree();
    }
  }, [isOpen]);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/categories/tree`);
      setTreeData(res.data || []);
      const expanded = {};
      (res.data || []).forEach(c => { expanded[c._id] = true; });
      setExpandedCats(expanded);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      level: 1,
      parentId: '',
      image: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenAddSubcategory = (parentId) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      level: 2,
      parentId,
      image: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      level: cat.level || 1,
      parentId: cat.parentId || '',
      image: cat.image || '',
      isActive: cat.isActive !== false
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const loadingToast = toast.loading('Uploading category image...');
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await axios.post(`${API_URL}/upload`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded!', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image', { id: loadingToast });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id, isSubcategory = false) => {
    const msg = isSubcategory
      ? 'Delete this subcategory?'
      : 'Delete this category and all its subcategories?';
    if (!window.confirm(msg)) return;

    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      toast.success('Deleted successfully');
      fetchTree();
      if (onCategoryUpdated) onCategoryUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Category name is required');

    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory._id}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post(`${API_URL}/categories`, formData);
        toast.success(formData.level === 2 ? 'Subcategory added' : 'Category created');
      }
      setShowModal(false);
      fetchTree();
      if (onCategoryUpdated) onCategoryUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  if (!isOpen) return null;

  const parentCat = formData.parentId ? treeData.find(c => c._id === formData.parentId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-amber-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Layers className="w-6 h-6 text-amber-300" />
            <div>
              <h2 className="text-xl font-bold">Category & Subcategory Manager</h2>
              <p className="text-xs text-amber-200">Manage Categories and their Subcategories</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-amber-50/30">
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-bold text-gray-700">Categories ({treeData.length})</span>
            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl flex items-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500 font-semibold">Loading categories...</div>
          ) : treeData.length === 0 ? (
            <div className="py-12 text-center text-gray-400">No categories found. Click "Add Category" to create one.</div>
          ) : (
            <div className="space-y-3">
              {treeData.map(main => (
                <div key={main._id} className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                  {/* Category Row */}
                  <div className="p-3.5 bg-amber-50/60 flex items-center justify-between hover:bg-amber-100/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleExpand(main._id)}
                        className="p-1 hover:bg-amber-200/60 rounded cursor-pointer"
                      >
                        {expandedCats[main._id] ? (
                          <ChevronDown className="w-4.5 h-4.5 text-amber-900" />
                        ) : (
                          <ChevronRight className="w-4.5 h-4.5 text-amber-900" />
                        )}
                      </button>

                      {main.image ? (
                        <img src={main.image} alt={main.name} className="w-9 h-9 rounded-full object-cover border border-amber-300 shadow-xs" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-black text-sm">
                          {main.name[0]}
                        </div>
                      )}

                      <div>
                        <span className="font-bold text-gray-900 text-base">{main.name}</span>
                        <span className="ml-2 text-xs font-semibold text-gray-500">
                          ({(main.subcategories || []).length} subcategories)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenAddSubcategory(main._id)}
                        className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center space-x-1 shadow-xs cursor-pointer"
                        title="Add Subcategory under this Category"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Subcategory</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(main)}
                        className="p-1.5 text-amber-800 hover:bg-amber-200 rounded-lg cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(main._id, false)}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories List */}
                  {expandedCats[main._id] && (
                    <div className="p-3 bg-white border-t border-amber-100">
                      {(!main.subcategories || main.subcategories.length === 0) ? (
                        <p className="text-xs text-gray-400 italic py-1 pl-4">No subcategories added yet. Click "+ Add Subcategory" above.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                          {main.subcategories.map(sub => (
                            <div
                              key={sub._id}
                              className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/70 transition-colors"
                            >
                              <span className="font-bold text-gray-800 text-xs truncate mr-2">
                                › {sub.name}
                              </span>
                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  onClick={() => handleOpenEditModal(sub)}
                                  className="p-1 text-gray-500 hover:text-amber-800 hover:bg-amber-100 rounded cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sub._id, true)}
                                  className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Category & Subcategory Modal */}
      {showModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-amber-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory
                  ? `Edit ${formData.level === 2 ? 'Subcategory' : 'Category'}`
                  : formData.level === 2
                    ? `Add Subcategory in "${parentCat?.name || 'Category'}"`
                    : 'Add Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {formData.level === 2 ? 'Subcategory Name *' : 'Category Name *'}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.level === 2 ? 'e.g. Birthday Cakes, Black Forest...' : 'e.g. Cakes, Breads, Pastries...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold text-sm outline-none"
                  required
                />
              </div>

              {/* Optional Category Image (for Main Categories only) */}
              {formData.level === 1 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Category Image (Optional)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {formData.image ? (
                    <div className="flex items-center gap-3 p-2 border border-amber-200 rounded-xl bg-amber-50/50">
                      <img src={formData.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg border bg-white" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">Image selected</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="text-[11px] font-bold text-amber-700 hover:underline"
                        >
                          Change photo
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-500 hover:bg-amber-50/30 text-xs font-bold text-gray-600 transition-all cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                          <span>Uploading image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-amber-700" />
                          <span>Upload Image from Device</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
