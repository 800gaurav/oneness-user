import { useState } from 'react';
import { Plus, Edit, Trash2, Copy, Eye, Cake, Heart, Sparkles, Gift } from 'lucide-react';

const Templates = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const templates = [
    {
      id: 1,
      name: 'Birthday Special Offer',
      category: 'Birthday',
      icon: Cake,
      color: 'from-pink-500 to-pink-600',
      message: '🎂 Happy Birthday {{CustomerName}}! 🎉\n\nWishing you a wonderful day filled with joy! Get 20% OFF on your birthday cake order today.\n\nUse code: BIRTHDAY20\n\nVisit: www.yourbakery.com',
      usageCount: 234,
    },
    {
      id: 2,
      name: 'Anniversary Celebration',
      category: 'Anniversary',
      icon: Heart,
      color: 'from-red-500 to-red-600',
      message: '💕 Happy Anniversary {{CustomerName}}! 🎊\n\nCelebrate your special day with our exclusive anniversary cake collection. Get 25% OFF today!\n\nUse code: ANNIVERSARY25',
      usageCount: 156,
    },
    {
      id: 3,
      name: 'Festival Special',
      category: 'Festival',
      icon: Sparkles,
      color: 'from-yellow-500 to-yellow-600',
      message: '✨ Happy Diwali {{CustomerName}}! 🪔\n\nSpread sweetness this festive season with our special mithai collection. Flat 30% OFF on all orders!\n\nUse code: DIWALI30',
      usageCount: 1234,
    },
    {
      id: 4,
      name: 'Weekend Discount',
      category: 'Promotion',
      icon: Gift,
      color: 'from-purple-500 to-purple-600',
      message: '🎁 Weekend Special for {{CustomerName}}!\n\nEnjoy 15% OFF on all cakes and pastries this weekend. Order now and make your weekend sweeter!\n\nUse code: WEEKEND15',
      usageCount: 567,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--color-brown))]">Message Templates</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-1">Create and manage reusable message templates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[rgb(var(--color-brown))] text-white rounded-xl hover:bg-[rgb(var(--color-light-brown))] transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Templates', value: '12', color: 'from-blue-500 to-blue-600' },
          { label: 'Birthday Templates', value: '3', color: 'from-pink-500 to-pink-600' },
          { label: 'Promotion Templates', value: '5', color: 'from-purple-500 to-purple-600' },
          { label: 'Total Usage', value: '2.1K', color: 'from-green-500 to-green-600' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-[rgb(var(--color-border))]">
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">{stat.label}</p>
            <h3 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[rgb(var(--color-border))] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center`}>
                  <template.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">{template.name}</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">{template.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[rgb(var(--color-surface))] rounded-lg transition-colors" title="Preview">
                  <Eye className="w-4 h-4 text-blue-600" />
                </button>
                <button className="p-2 hover:bg-[rgb(var(--color-surface))] rounded-lg transition-colors" title="Duplicate">
                  <Copy className="w-4 h-4 text-green-600" />
                </button>
                <button className="p-2 hover:bg-[rgb(var(--color-surface))] rounded-lg transition-colors" title="Edit">
                  <Edit className="w-4 h-4 text-purple-600" />
                </button>
                <button className="p-2 hover:bg-[rgb(var(--color-surface))] rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="bg-[rgb(var(--color-surface))] rounded-xl p-4 mb-4">
              <p className="text-sm text-[rgb(var(--color-text-primary))] whitespace-pre-wrap line-clamp-4">
                {template.message}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                <span>Used {template.usageCount} times</span>
              </div>
              <button className="px-4 py-2 bg-[rgb(var(--color-brown))] text-white rounded-lg hover:bg-[rgb(var(--color-light-brown))] transition-colors text-sm font-medium">
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[rgb(var(--color-brown))] mb-6">Create New Template</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g., Birthday Special Offer"
                  className="w-full px-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">Category</label>
                <select className="w-full px-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]">
                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Festival</option>
                  <option>Promotion</option>
                  <option>Custom</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">Message Content</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs px-3 py-1 bg-[rgb(var(--color-surface))] rounded-lg hover:bg-[rgb(var(--color-surface-dark))] transition-colors"
                    >
                      + Name
                    </button>
                    <button
                      type="button"
                      className="text-xs px-3 py-1 bg-[rgb(var(--color-surface))] rounded-lg hover:bg-[rgb(var(--color-surface-dark))] transition-colors"
                    >
                      + Discount
                    </button>
                    <button
                      type="button"
                      className="text-xs px-3 py-1 bg-[rgb(var(--color-surface))] rounded-lg hover:bg-[rgb(var(--color-surface-dark))] transition-colors"
                    >
                      + Link
                    </button>
                  </div>
                </div>
                <textarea
                  rows="8"
                  placeholder="Type your message here... Use {{CustomerName}} for personalization"
                  className="w-full px-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                ></textarea>
                <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
                  Available variables: {'{{CustomerName}}'}, {'{{DiscountCode}}'}, {'{{OfferLink}}'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">Add Image (Optional)</label>
                <div className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-xl p-8 text-center hover:border-[rgb(var(--color-brown))] transition-colors cursor-pointer">
                  <Plus className="w-12 h-12 mx-auto text-[rgb(var(--color-text-tertiary))] mb-2" />
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">Click to upload image</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g., BIRTHDAY20"
                    className="w-full px-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">Offer Link</label>
                  <input
                    type="url"
                    placeholder="https://yourbakery.com/offer"
                    className="w-full px-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-brown))]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[rgb(var(--color-brown))] text-white rounded-xl hover:bg-[rgb(var(--color-light-brown))] transition-colors font-medium"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
