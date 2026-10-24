import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const SellerInventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductStock } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formComparePrice, setFormComparePrice] = useState('');
  const [formCategory, setFormCategory] = useState('Aviator');
  const [formStock, setFormStock] = useState('10');
  const [formImageUrl, setFormImageUrl] = useState('/src/assets/images/product_sunglasses_aviator_1792844117998.jpg');
  const [formBadge, setFormBadge] = useState('');

  const categories = ['All', 'Aviator', 'Wayfarer', 'Cat-Eye', 'Geometric', 'Accessories'];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormDesc('');
    setFormPrice('2500');
    setFormComparePrice('3000');
    setFormCategory('Aviator');
    setFormStock('12');
    setFormImageUrl('/src/assets/images/product_sunglasses_aviator_1792844117998.jpg');
    setFormBadge('New');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormDesc(p.description);
    setFormPrice(p.price.toString());
    setFormComparePrice(p.compareAtPrice ? p.compareAtPrice.toString() : '');
    setFormCategory(p.category);
    setFormStock(p.inventoryCount.toString());
    setFormImageUrl(p.images[0] || '');
    setFormBadge(p.badge || '');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrice) return;

    const priceNum = parseFloat(formPrice) || 0;
    const compareNum = formComparePrice ? parseFloat(formComparePrice) : undefined;
    const stockNum = parseInt(formStock, 10) || 0;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        title: formTitle.trim(),
        description: formDesc.trim(),
        price: priceNum,
        compareAtPrice: compareNum,
        category: formCategory,
        inventoryCount: stockNum,
        isAvailable: stockNum > 0,
        images: [formImageUrl],
        badge: formBadge.trim() || undefined,
      });
      setEditingProduct(null);
    } else {
      addProduct({
        title: formTitle.trim(),
        description: formDesc.trim(),
        price: priceNum,
        compareAtPrice: compareNum,
        category: formCategory,
        inventoryCount: stockNum,
        isAvailable: stockNum > 0,
        images: [formImageUrl],
        featured: false,
        badge: formBadge.trim() || undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 sm:pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
            Catalog &amp; Live Stock
          </h2>
          <p className="text-xs text-slate-500">
            Items added here appear immediately in your Instagram bio link.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* MOBILE PRODUCT CARDS (Optimized for smartphone sellers) */}
      <div className="block sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-4">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No products found</h4>
          </div>
        ) : (
          filtered.map((product) => {
            const isOutOfStock = !product.isAvailable || product.inventoryCount <= 0;

            return (
              <div key={product.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-14 h-14 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {product.category}
                    </div>
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {product.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        KES {product.price.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Stock: {product.inventoryCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => toggleProductStock(product.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      product.isAvailable && product.inventoryCount > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {product.isAvailable && product.inventoryCount > 0 ? 'In Stock' : 'Out of Stock'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="px-2.5 py-1 text-slate-700 bg-slate-100 rounded-lg font-medium text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${product.title}"?`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP PRODUCT TABLE */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No products found</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting search or add a new item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (KES)</th>
                  <th className="py-3 px-4">Stock Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((product) => {
                  const isOutOfStock = !product.isAvailable || product.inventoryCount <= 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product image and title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-xl bg-slate-100 border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {product.title}
                            </div>
                            {product.badge && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          KES {product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && (
                          <div className="text-[11px] font-mono text-slate-400 line-through">
                            KES {product.compareAtPrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock count */}
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-semibold ${
                            product.inventoryCount <= 4
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {product.inventoryCount} units
                        </span>
                      </td>

                      {/* Availability toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleProductStock(product.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                            product.isAvailable && product.inventoryCount > 0
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {product.isAvailable && product.inventoryCount > 0 ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>

                      {/* Edit / Delete Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${product.title}" from catalog?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monaco Polarized Aviators"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Selling Price (KES)</label>
                  <input
                    type="number"
                    required
                    placeholder="2800"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Compare Price (Optional)</label>
                  <input
                    type="number"
                    placeholder="3400"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Aviator">Aviator</option>
                    <option value="Wayfarer">Wayfarer</option>
                    <option value="Cat-Eye">Cat-Eye</option>
                    <option value="Geometric">Geometric</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Image URL / Path</label>
                <input
                  type="text"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('/src/assets/images/product_sunglasses_aviator_1792844117998.jpg')}
                    className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded"
                  >
                    Use Aviator Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('/src/assets/images/product_sunglasses_cat_eye_1792844119202.jpg')}
                    className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded"
                  >
                    Use Cat-Eye Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('/src/assets/images/product_sunglasses_wayfarer_1792844118647.jpg')}
                    className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded"
                  >
                    Use Wayfarer Photo
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe lens UV rating, frame material, aesthetics..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Badge Tag (e.g. Best Seller)</label>
                <input
                  type="text"
                  placeholder="e.g. Limited Edition"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
