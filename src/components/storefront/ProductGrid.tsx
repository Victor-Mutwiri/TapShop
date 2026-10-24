import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { Search, Plus, Eye, Sparkles, AlertCircle } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { products, addToCart, setSelectedProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-12">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between mb-4 sm:mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sunglasses by frame or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Buttons (Smooth Horizontal Scroll on Mobile) */}
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
      </div>

      {/* Product Listings Grid: 2 columns on mobile, 2 columns on tablet/desktop */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold text-slate-800">No items match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Try adjusting your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 px-4 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-5">
          {filteredProducts.map((product) => {
            const isOutOfStock = !product.isAvailable || product.inventoryCount <= 0;
            const isLowStock = product.inventoryCount > 0 && product.inventoryCount <= 5;

            return (
              <div
                key={product.id}
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Product Image Container */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="relative aspect-4/3 bg-slate-100 cursor-pointer overflow-hidden"
                >
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1">
                    {product.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-emerald-950 bg-white/95 backdrop-blur-xs rounded-md shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase text-rose-700 bg-rose-50/95 backdrop-blur-xs rounded-md">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Quick Preview Hover Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 bg-white/90 backdrop-blur-xs text-slate-700 rounded-xl shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    title="Quick preview"
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                      {product.category}
                    </div>
                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 cursor-pointer line-clamp-1 hover:text-emerald-700 transition-colors"
                    >
                      {product.title}
                    </h3>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-xs sm:text-sm md:text-base font-bold font-mono text-slate-900 tabular-nums">
                          KES {product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 line-through tabular-nums hidden xs:inline">
                            {product.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {isLowStock && !isOutOfStock && (
                        <div className="text-[9px] sm:text-[10px] text-amber-600 font-medium">
                          Only {product.inventoryCount} left
                        </div>
                      )}
                    </div>

                    {/* Add to Cart button */}
                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={isOutOfStock}
                      className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shrink-0 ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
                      }`}
                      aria-label={`Add ${product.title} to bag`}
                    >
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
