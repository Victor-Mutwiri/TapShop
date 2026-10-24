import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Package, Layers, Settings, Share2, MapPin } from 'lucide-react';

interface SellerMobileNavProps {
  activeTab: 'orders' | 'inventory' | 'settings' | 'share';
  setActiveTab: (tab: 'orders' | 'inventory' | 'settings' | 'share') => void;
}

export const SellerMobileNav: React.FC<SellerMobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { orders } = useStore();
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 sm:hidden pb-safe">
      <div className="grid grid-cols-4 h-16 items-center px-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
            activeTab === 'orders' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px] font-bold">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'inventory' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-1">Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('share')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'share' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Share2 className="w-5 h-5" />
          <span className="text-[10px] mt-1">Bio Link</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'settings' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
