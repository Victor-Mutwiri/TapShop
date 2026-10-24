import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PWAInstallBanner } from '../common/PWAInstallBanner';
import {
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Sparkles,
  Layers,
  X,
  Package,
  Store,
  Truck,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, updateStore, showToast } = useStore();

  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreHandle, setNewStoreHandle] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreTill, setNewStoreTill] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('Eyewear & Sunglasses');

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    const handle =
      newStoreHandle.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') ||
      newStoreName.toLowerCase().replace(/[^a-z0-9]/g, '');

    updateStore({
      name: newStoreName.trim(),
      handle,
      phone: newStorePhone.trim() || '+254 700 000 000',
      whatsapp: (newStorePhone.trim() || '254700000000').replace(/[^0-9]/g, ''),
      paymentMethods: {
        mpesaType: 'till',
        number: newStoreTill.trim() || '849201',
        accountName: newStoreName.toUpperCase(),
        instructions: `Pay via Lipa na M-Pesa Buy Goods Till ${newStoreTill || '849201'} and attach your confirmation message below.`,
      },
    });

    setIsNewStoreModalOpen(false);
    showToast(`Store "${newStoreName}" created! Opening your Seller Hub.`);
    setActiveView('seller_dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar (Complies with 3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#hero"
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 font-display"
          >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
              TS
            </span>
            <span>TapShop</span>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#problem" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Why TapShop
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#fulfillment" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
              Pickup &amp; Delivery
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallBanner variant="compact" />
            <button
              onClick={() => setActiveView('seller_dashboard')}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Seller Hub
            </button>
            <button
              onClick={() => setIsNewStoreModalOpen(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0"
            >
              Create Store
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="hero" className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6">
            <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-[11px] sm:text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant Bio Storefronts for Instagram, TikTok &amp; Facebook</span>
              </div>

              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.15] text-balance">
                Turn Social Media DMs into Automated Sales.
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Stop losing customers to "is this still available?" and manual payment verification. Give your followers a frictionless link-in-bio storefront with shop pickup points, doorstep delivery, and instant M-Pesa proof checkout.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2">
                <button
                  onClick={() => setActiveView('storefront')}
                  className="w-full sm:w-auto h-12 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Test Demo Eyewear Store (As Buyer)</span>
                </button>

                <button
                  onClick={() => setActiveView('seller_dashboard')}
                  className="w-full sm:w-auto h-12 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Package className="w-4 h-4 text-slate-600" />
                  <span>Open Mobile Seller Hub</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-500 pt-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero buyer account creation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CBD Shop Pickup + PIN verification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Works 100% on smartphones (PWA)</span>
                </div>
              </div>
            </div>

            {/* Interactive Hero Visual Showcase */}
            <div className="mt-10 sm:mt-14 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-3.5 sm:p-6">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2 font-mono font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>tapshop.co/@solarium</span>
                </div>
                <button
                  onClick={() => setActiveView('storefront')}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Launch full bio storefront</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Store mockup preview card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4">
                <div className="md:col-span-1 p-3.5 sm:p-4 bg-slate-50 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src="/src/assets/images/product_sunglasses_aviator_1792844117998.jpg"
                      alt="Solarium"
                      className="w-12 h-12 rounded-xl object-cover border"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Solarium Eyewear</div>
                      <div className="text-[11px] text-slate-500">M-Pesa Till: 849201</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>📍 Veteran House, 2nd Floor Room 214</div>
                    <div>🚚 Nairobi Rider + Upcountry Parcel</div>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold">
                    ✓ Verified Kenyan Social Merchant
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl">
                    <img
                      src="/src/assets/images/product_sunglasses_cat_eye_1792844119202.jpg"
                      alt="Cat Eye"
                      className="aspect-4/3 w-full object-cover rounded-lg mb-1.5"
                    />
                    <div className="font-semibold text-slate-900 text-xs truncate">
                      Aurélia Cat-Eye
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900">
                      KES 2,800
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl">
                    <img
                      src="/src/assets/images/product_sunglasses_aviator_1792844117998.jpg"
                      alt="Aviator"
                      className="aspect-4/3 w-full object-cover rounded-lg mb-1.5"
                    />
                    <div className="font-semibold text-slate-900 text-xs truncate">
                      Apex Gold Aviator
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900">
                      KES 3,200
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section id="problem" className="py-12 sm:py-16 bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                The DM Selling Dilemma
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
                Stop Losing Buyers to Manual DMs and Fake Pickups
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
              {/* The Old Way */}
              <div className="p-5 sm:p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3.5">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs">
                    ✕
                  </span>
                  <span>The Painful DM Maze (Old Way)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>Buyers message in DM: "Is this still available?" and wait hours for answers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>Pickup shop counters only ask for customer names: anyone can fake a name and take the parcel.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>Manually matching blurry M-Pesa screenshots across 30 different chat threads.</span>
                  </li>
                </ul>
              </div>

              {/* The TapShop Way */}
              <div className="p-5 sm:p-6 bg-emerald-50/50 rounded-3xl border border-emerald-200 space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>The TapShop Flow (New Way)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>1-click link in Instagram/TikTok bio opens instant mobile catalog with live stock.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span><strong>Imposter-Proof Pickup:</strong> Generates unique Order ID + 4-digit Collection PIN for counter pickup.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>Delivery zones for Nairobi doorstep riders and countrywide upcountry parcel couriers.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES SECTION */}
        <section id="features" className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Built For Social Media Merchants
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
                Everything You Need on Your Smartphone
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Feature 1 */}
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  Installable PWA for Sellers
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Run your business directly from your Android phone or iPhone. No laptop required. Get instant order alerts, update stock on the go, and review payment proofs.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  Shop Pickup &amp; Collection PIN
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Partner with Nairobi CBD shops (Veteran House, Star Mall, Jamia). Orders are secured with a 4-digit Collection PIN so only the real customer can collect.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                  Multi-Zone Delivery Routes
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Configure flat rates for within-city rider delivery, countrywide parcel couriers (Easy Coach/Fargo/Speedaf), and free delivery thresholds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-12 sm:py-16 bg-slate-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
            <h2 className="text-xl sm:text-3xl font-extrabold font-display">
              Ready to Upgrade Your Instagram Bio Link?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Join sunglasses, fashion, and beauty merchants automating their social commerce in Kenya.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsNewStoreModalOpen(true)}
                className="h-12 px-6 sm:px-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-all"
              >
                Create Your Store Now — Free
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 font-display">TapShop</span>
            <span>· Instant Social Commerce Bio Stores</span>
          </div>
          <div>
            Nairobi CBD Shop Pickups &amp; Doorstep Deliveries.
          </div>
        </div>
      </footer>

      {/* Create New Store Modal */}
      {isNewStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-6 border border-slate-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Create Your Social Store
              </h3>
              <button
                onClick={() => setIsNewStoreModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-3.5 pt-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Brand / Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nairobi Shades Vault"
                  value={newStoreName}
                  onChange={(e) => {
                    setNewStoreName(e.target.value);
                    if (!newStoreHandle) {
                      setNewStoreHandle(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bio Handle (tapshop.co/@handle)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nairobishades"
                  value={newStoreHandle}
                  onChange={(e) => setNewStoreHandle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Phone (Calls &amp; WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="0712 345 678"
                  value={newStorePhone}
                  onChange={(e) => setNewStorePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  M-Pesa Buy Goods Till Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 849201"
                  value={newStoreTill}
                  onChange={(e) => setNewStoreTill(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Launch Store &amp; Open Mobile Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
