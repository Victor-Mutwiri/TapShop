import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PWAInstallBanner } from '../common/PWAInstallBanner';
import {
  Package,
  Layers,
  Settings,
  Bell,
  ExternalLink,
  Share2,
  RefreshCw,
  Store as StoreIcon,
} from 'lucide-react';

interface SellerNavbarProps {
  activeTab: 'orders' | 'inventory' | 'settings' | 'share';
  setActiveTab: (tab: 'orders' | 'inventory' | 'settings' | 'share') => void;
}

export const SellerNavbar: React.FC<SellerNavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    store,
    orders,
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    setActiveView,
    resetToDemo,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand & Store Profile */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-slate-900 text-white flex items-center justify-center font-bold font-display shadow-xs shrink-0 text-xs sm:text-base border border-slate-200">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              store.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-base font-bold text-slate-900 truncate">
                {store.name}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                Hub
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-mono truncate">
              tapshop.co/@{store.handle}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallBanner variant="compact" />

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Live Order Alerts ({notifications.length})
                    </span>
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-medium text-emerald-700 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No alerts yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`py-2 px-1 rounded-xl text-xs ${
                          !n.read ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Switch to Customer Storefront Button */}
          <button
            onClick={() => setActiveView('storefront')}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={resetToDemo}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            title="Reset to fresh demo data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Tab navigation strip (hidden on mobile; mobile uses fixed bottom bar) */}
      <div className="hidden sm:flex max-w-7xl mx-auto px-6 items-center gap-2 border-t border-slate-100 h-12">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders</span>
          {pendingOrdersCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-white rounded-full">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Products &amp; Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('share')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'share'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Bio Link &amp; IG Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Store &amp; Pickup/Delivery Setup</span>
        </button>
      </div>
    </header>
  );
};
