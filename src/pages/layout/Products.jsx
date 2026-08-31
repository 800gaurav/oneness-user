import { useEffect, useState } from 'react';
import { Check, ExternalLink, Images, Layers, Percent, Plus, Search, Trash2, Upload, Weight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const emptyVariant = { label: '', price: '', originalPrice: '', inStock: true };

const Products = () => {
  const emptyForm = {
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    weight: '',
    weightUnit: 'kg',
    description: '',
    image: '',
    images: [],
    variants: [],
    inStock: true
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const weightUnits = ['kg', 'g', 'pound', 'piece', 'dozen'];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products`);
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`);
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].name }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/categories`, { name: newCategory }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category added!');
      setNewCategory('');
      setShowCategoryModal(false);
      fetchCategories();
    } catch {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted!');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const readFiles = (files) => Promise.all(Array.from(files).map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  })));

  const setImages = (images) => {
    const nextImages = [...new Set(images.filter(Boolean))].slice(0, 8);
    setFormData(prev => ({ ...prev, image: nextImages[0] || '', images: nextImages }));
    setImagePreview(nextImages[0] || '');
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const images = await readFiles(files);
    setImages([...images, ...(formData.images || [])]);
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const images = await readFiles(files);
    setImages([...(formData.images || []), ...images]);
  };

  const addImageUrl = () => {
    const url = prompt('Paste image URL');
    if (!url?.trim()) return;
    setImages([...(formData.images || []), url.trim()]);
  };

  const removeImage = (index) => {
    setImages((formData.images || []).filter((_, imageIndex) => imageIndex !== index));
  };

  const addVariant = () => {
    setFormData(prev => ({ ...prev, variants: [...prev.variants, { ...emptyVariant }] }));
  };

  const updateVariant = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, variantIndex) => (
        variantIndex === index ? { ...variant, [key]: value } : variant
      ))
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, variantIndex) => variantIndex !== index) }));
  };

  const resetForm = () => {
    setFormData({ ...emptyForm, category: categories[0]?.name || '' });
    setImagePreview('');
  };

  const normalizeProductPayload = () => ({
    ...formData,
    price: Number(formData.price),
    originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
    images: [...new Set([formData.image, ...(formData.images || [])].filter(Boolean))],
    variants: (formData.variants || [])
      .filter(variant => variant.label && variant.price)
      .map(variant => ({
        ...variant,
        price: Number(variant.price),
        originalPrice: variant.originalPrice ? Number(variant.originalPrice) : undefined
      }))
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/products`, normalizeProductPayload(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      resetForm();
      setShowAddSidebar(false);
      fetchProducts();
      toast.success('Product added successfully!');
    } catch {
      toast.error('Failed to add product');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      toast.success('Product deleted!');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const toggleStock = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/products/${id}/toggle-stock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const getDiscount = (product) => {
    if (!product.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const filteredProducts = products.filter(product => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(query);
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.sales || 0)), 0);
  const dynamicCategories = ['all', ...categories.map(c => c.name)];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--color-brown))]">Bakery Products</h1>
          <p className="mt-0.5 text-sm text-[rgb(var(--color-text-secondary))]">Manage prices, discounts, images and size variants</p>
        </div>
        <div className="flex gap-2">
          <a href="/store" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg">
            <ExternalLink className="h-4 w-4" />
            View Store
          </a>
          <button onClick={() => setShowAddSidebar(true)} className="flex items-center gap-2 rounded-lg bg-[rgb(var(--color-brown))] px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg">
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="mb-1 text-xs font-medium text-blue-700">Total Products</p>
          <h3 className="text-2xl font-bold text-blue-900">{totalProducts}</h3>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="mb-1 text-xs font-medium text-green-700">In Stock</p>
          <h3 className="text-2xl font-bold text-green-900">{inStockProducts}</h3>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="mb-1 text-xs font-medium text-red-700">Out of Stock</p>
          <h3 className="text-2xl font-bold text-red-900">{totalProducts - inStockProducts}</h3>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="mb-1 text-xs font-medium text-yellow-700">Total Revenue</p>
          <h3 className="text-2xl font-bold text-yellow-900">₹{(totalRevenue / 1000).toFixed(1)}K</h3>
        </div>
      </div>

      <div className="rounded-xl border border-[rgb(var(--color-border))] bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${filterCategory === cat ? 'bg-[rgb(var(--color-brown))] text-white shadow-md' : 'bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-dark))]'}`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="group overflow-hidden rounded-xl border border-[rgb(var(--color-border))] bg-white shadow-sm transition-all hover:shadow-lg">
            <div className="relative h-48 overflow-hidden">
              {((product.images && product.images[0]) || product.image) ? (
                <img src={(product.images && product.images[0]) || product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[rgb(var(--color-surface))] text-gray-400">No image</div>
              )}
              {getDiscount(product) > 0 && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white shadow">
                  <Percent className="h-3 w-3" />
                  {getDiscount(product)}% OFF
                </span>
              )}
              <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-white backdrop-blur-sm ${product.inStock ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="absolute bottom-2 left-2 rounded-full bg-[rgb(var(--color-brown))]/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {product.category}
              </span>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-sm font-bold text-[rgb(var(--color-text-primary))]">{product.name}</h3>
                  <div className="mt-1 flex items-center gap-1">
                    <Weight className="h-3 w-3 text-[rgb(var(--color-text-tertiary))]" />
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">{product.weight} {product.weightUnit}</p>
                  </div>
                  {(product.variants || []).length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-700">
                      <Layers className="h-3 w-3" />
                      {product.variants.length} sizes
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {product.originalPrice > product.price && <p className="text-xs text-gray-400 line-through">₹{product.originalPrice}</p>}
                  <p className="text-lg font-bold text-[rgb(var(--color-brown))]">₹{product.price}</p>
                </div>
              </div>
              <p className="mb-3 line-clamp-2 h-8 text-xs text-[rgb(var(--color-text-secondary))]">{product.description}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleStock(product._id)} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${product.inStock ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {product.inStock ? 'Out of Stock' : 'In Stock'}
                </button>
                <button onClick={() => deleteProduct(product._id)} className="rounded-lg p-1.5 transition-colors hover:bg-red-50" title="Delete">
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-xl bg-white py-12 text-center">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {showAddSidebar && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddSidebar(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-white shadow-2xl md:w-[620px]">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[rgb(var(--color-brown))] px-6 py-5 shadow-lg">
              <div>
                <h2 className="text-xl font-bold text-white">Add New Product</h2>
                <p className="mt-0.5 text-sm text-white/80">Images, discounts and sizes</p>
              </div>
              <button onClick={() => setShowAddSidebar(false)} className="rounded-lg p-2 transition-colors hover:bg-white/20">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--color-text-primary))]">Cover Image <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="imageUpload" />
                <label htmlFor="imageUpload" className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] transition-all hover:border-[rgb(var(--color-brown))]">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 h-10 w-10 text-[rgb(var(--color-text-tertiary))]" />
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">Click to upload image</p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[rgb(var(--color-text-primary))]">Multiple Images</label>
                  <button type="button" onClick={addImageUrl} className="text-xs font-bold text-blue-700">Add URL</button>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" id="galleryUpload" />
                <label htmlFor="galleryUpload" className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-3 text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                  <Images className="h-4 w-4" />
                  Upload gallery images
                </label>
                {(formData.images || []).length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-[rgb(var(--color-border))]">
                        <img src={image} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--color-text-primary))]">Product Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Chocolate Truffle Cake" className="w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" required />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">Category <span className="text-red-500">*</span></label>
                  <button type="button" onClick={() => setShowCategoryModal(true)} className="text-xs font-bold text-blue-700 flex items-center gap-1">
                    <Plus className="h-3 w-3" /> New Category
                  </button>
                </div>
                {categories.length === 0 ? (
                  <button type="button" onClick={() => setShowCategoryModal(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 transition-all hover:bg-[rgb(var(--color-surface-dark))]">
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Create First Category</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1.5 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] rounded-xl">
                      {categories.map(cat => {
                        const isSelected = formData.category === cat.name;
                        return (
                          <button
                            type="button"
                            key={cat._id}
                            onClick={() => setFormData({...formData, category: cat.name})}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                              isSelected
                                ? 'bg-[rgb(var(--color-brown))] text-white border-[rgb(var(--color-brown))] shadow-sm'
                                : 'bg-white text-[rgb(var(--color-text-primary))] border-[rgb(var(--color-border))] hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-xs font-bold truncate">{cat.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                    {formData.category && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const cat = categories.find(c => c.name === formData.category);
                            if (cat) handleDeleteCategory(cat._id);
                          }}
                          className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" /> Delete Selected ({formData.category})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2">
                  <span className="block text-sm font-semibold text-[rgb(var(--color-text-primary))]">Sale Price (₹) *</span>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="599" className="w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" required />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-semibold text-[rgb(var(--color-text-primary))]">Cut Price (₹)</span>
                  <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} placeholder="799" className="w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2">
                  <span className="block text-sm font-semibold text-[rgb(var(--color-text-primary))]">Default Weight *</span>
                  <input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="500" className="w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" required />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-semibold text-[rgb(var(--color-text-primary))]">Unit *</span>
                  <select value={formData.weightUnit} onChange={(e) => setFormData({...formData, weightUnit: e.target.value})} className="w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]">
                    {weightUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </label>
              </div>

              <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[rgb(var(--color-text-primary))]">Sizes / Variants</h3>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">Example: 500 g, 1 kg, 2 pound with different prices.</p>
                  </div>
                  <button type="button" onClick={addVariant} className="flex items-center gap-1 rounded-lg bg-[rgb(var(--color-brown))] px-3 py-2 text-xs font-bold text-white">
                    <Plus className="h-3.5 w-3.5" />
                    Size
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="rounded-lg border border-[rgb(var(--color-border))] bg-white p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input value={variant.label} onChange={(e) => updateVariant(index, 'label', e.target.value)} placeholder="Size label e.g. 500 g" className="rounded-lg border border-[rgb(var(--color-border))] px-3 py-2 text-xs" />
                        <input type="number" value={variant.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} placeholder="Sale price" className="rounded-lg border border-[rgb(var(--color-border))] px-3 py-2 text-xs" />
                        <input type="number" value={variant.originalPrice} onChange={(e) => updateVariant(index, 'originalPrice', e.target.value)} placeholder="Cut price" className="rounded-lg border border-[rgb(var(--color-border))] px-3 py-2 text-xs" />
                        <button type="button" onClick={() => removeVariant(index)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[rgb(var(--color-text-primary))]">Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Product description..." className="w-full resize-none rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3">
                <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({...formData, inStock: e.target.checked})} className="h-4 w-4 rounded text-[rgb(var(--color-brown))] focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
                <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">Product is in stock</span>
              </label>

              <div className="sticky bottom-0 flex gap-3 border-t border-[rgb(var(--color-border))] bg-white pb-4 pt-4">
                <button type="button" onClick={() => setShowAddSidebar(false)} className="flex-1 rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-300">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-[rgb(var(--color-brown))] px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg">Add Product</button>
              </div>
            </form>
          </div>
        </>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCategoryModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-xl font-bold text-[rgb(var(--color-brown))]">Add New Category</h3>
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Enter category name" className="mb-4 w-full rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]" />
            <div className="flex gap-3">
              <button onClick={() => setShowCategoryModal(false)} className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-all hover:bg-gray-300">Cancel</button>
              <button onClick={handleAddCategory} className="flex-1 rounded-lg bg-[rgb(var(--color-brown))] px-4 py-2 text-white transition-all hover:bg-[rgb(var(--color-light-brown))]">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
