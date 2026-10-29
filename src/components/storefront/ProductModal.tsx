import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Sparkles, Check } from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!selectedProduct) return null;

  const isOutOfStock = !selectedProduct.isAvailable || selectedProduct.inventoryCount <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(selectedProduct, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setSelectedProduct(null);
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedProduct(null);
      }}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-xs text-slate-600 hover:text-slate-900 rounded-full shadow-xs transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto">
          {/* Main Product Image */}
          <div className="relative aspect-4/3 w-full bg-slate-100">
            {selectedProduct.images[0] ? (
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Sparkles className="w-8 h-8" />
              </div>
            )}
            {selectedProduct.badge && (
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900 bg-white/95 backdrop-blur-xs rounded-lg shadow-sm">
                  {selectedProduct.badge}
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                {selectedProduct.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-display">
                {selectedProduct.title}
              </h2>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  KES {selectedProduct.price.toLocaleString()}
                </span>
                {selectedProduct.compareAtPrice && selectedProduct.compareAtPrice > selectedProduct.price && (
                  <>
                    <span className="text-sm font-mono text-slate-400 line-through tabular-nums">
                      KES {selectedProduct.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save KES {(selectedProduct.compareAtPrice - selectedProduct.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Quality specs */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>UV400 Polarized Lenses</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Microfiber Pouch & Case</span>
              </div>
            </div>

            {/* Stock status */}
            <div className="text-xs flex items-center justify-between text-slate-600 pt-1">
              <span>Availability:</span>
              {isOutOfStock ? (
                <span className="font-semibold text-rose-600">Currently Out of Stock</span>
              ) : (
                <span className="font-medium text-emerald-700">
                  In Stock ({selectedProduct.inventoryCount} units ready to ship)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center gap-3">
          {/* Quantity Stepper */}
          {!isOutOfStock && (
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold font-mono text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(selectedProduct.inventoryCount, q + 1))}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Add to Bag Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ${
              isAdded
                ? 'bg-emerald-700 text-white'
                : isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-98'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? 'Sold Out'
                    : `Add to Bag · KES ${(selectedProduct.price * quantity).toLocaleString()}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
