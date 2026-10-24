import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { StoreHeader } from './components/storefront/StoreHeader';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductModal } from './components/storefront/ProductModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { OrderSuccessModal } from './components/storefront/OrderSuccessModal';
import { OrderTrackerView } from './components/storefront/OrderTrackerView';

import { SellerNavbar } from './components/seller/SellerNavbar';
import { SellerMobileNav } from './components/seller/SellerMobileNav';
import { SellerOrders } from './components/seller/SellerOrders';
import { SellerInventory } from './components/seller/SellerInventory';
import { SellerStoreSettings } from './components/seller/SellerStoreSettings';
import { BioLinkShareModal } from './components/seller/BioLinkShareModal';

import { LandingPage } from './components/landing/LandingPage';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';

import {
  Smartphone,
  Store,
  Layers,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    activeCustomerTab,
    toast,
    orders,
    cartCount,
    setIsCartOpen,
  } = useStore();

  const [sellerTab, setSellerTab] = useState<'orders' | 'inventory' | 'settings' | 'share'>('orders');
  const [isMobileFrameActive, setIsMobileFrameActive] = useState(false);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* GLOBAL DEMO CONTROLS BAR (Mobile-Optimized Viewport Switcher) */}
      <div className="sticky top-0 sm:relative bg-slate-950 text-white px-3 sm:px-6 py-2 flex items-center justify-between text-xs border-b border-slate-800 shadow-sm z-50">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
            <span className="w-5 h-5 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-[11px]">
              TS
            </span>
            <span className="hidden xs:inline">TapShop</span>
          </span>
          <span className="text-slate-600 hidden md:inline" aria-hidden="true">|</span>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            Social Commerce Bio-Store
          </span>
        </div>

        {/* View Switcher Segmented Tabs */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900 p-0.5 sm:p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('storefront')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 sm:gap-1.5 ${
              activeView === 'storefront'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <button
            onClick={() => setActiveView('seller_dashboard')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 sm:gap-1.5 relative ${
              activeView === 'seller_dashboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Seller Hub</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full font-bold text-[9px]">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('landing')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1 sm:gap-1.5 ${
              activeView === 'landing'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Landing</span>
            <span className="xs:hidden">About</span>
          </button>
        </div>

        {/* Phone Frame Toggle for Desktop Evaluators */}
        <div className="hidden lg:flex items-center gap-2">
          {activeView === 'storefront' && (
            <button
              onClick={() => setIsMobileFrameActive(!isMobileFrameActive)}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors flex items-center gap-1.5 ${
                isMobileFrameActive
                  ? 'bg-white text-slate-950 border-white font-bold'
                  : 'bg-transparent text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isMobileFrameActive ? 'Full Screen' : 'Phone Simulator'}</span>
            </button>
          )}
        </div>
      </div>

      {/* RENDER ACTIVE VIEW */}
      <div className="flex-1 flex flex-col">
        {activeView === 'landing' && <LandingPage />}

        {activeView === 'seller_dashboard' && (
          <div className="flex-1 bg-slate-50 flex flex-col">
            <SellerNavbar activeTab={sellerTab} setActiveTab={setSellerTab} />
            <main className="flex-1">
              {sellerTab === 'orders' && <SellerOrders />}
              {sellerTab === 'inventory' && <SellerInventory />}
              {sellerTab === 'share' && <BioLinkShareModal />}
              {sellerTab === 'settings' && <SellerStoreSettings />}
            </main>
            {/* Mobile Bottom Navigation for smartphone sellers */}
            <SellerMobileNav activeTab={sellerTab} setActiveTab={setSellerTab} />
          </div>
        )}

        {activeView === 'storefront' && (
          <div className="flex-1 flex justify-center py-0 sm:py-6 bg-slate-100/70">
            {isMobileFrameActive ? (
              /* Simulated iPhone Container on Desktop */
              <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col my-auto max-h-[880px]">
                <div className="bg-slate-900 h-6 flex justify-center items-center">
                  <div className="w-24 h-4 bg-slate-950 rounded-b-xl" />
                </div>
                <div className="flex-1 overflow-y-auto">
                  <StoreHeader />
                  {activeCustomerTab === 'catalog' ? <ProductGrid /> : <OrderTrackerView />}
                </div>
              </div>
            ) : (
              /* Responsive Full View (Flawless on real mobile devices & desktop) */
              <div className="w-full max-w-4xl bg-white shadow-xs rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 overflow-hidden flex flex-col">
                <StoreHeader />
                {activeCustomerTab === 'catalog' ? <ProductGrid /> : <OrderTrackerView />}
              </div>
            )}

            {/* Mobile Bottom Floating Bag Trigger when items exist */}
            {cartCount > 0 && (
              <div className="fixed bottom-4 left-3 right-3 sm:hidden z-30">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full h-12 bg-emerald-600 active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-between px-4 shadow-xl transition-all"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>View Bag ({cartCount})</span>
                  </div>
                  <span className="flex items-center gap-1 font-semibold">
                    Checkout Now →
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Overlays */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />

      {/* Global Toast Alert */}
      {toast && (
        <div className="fixed bottom-16 sm:bottom-5 right-4 sm:right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-emerald-950 text-emerald-100 border-emerald-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                toast.type === 'error'
                  ? 'bg-rose-400'
                  : toast.type === 'info'
                  ? 'bg-slate-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
