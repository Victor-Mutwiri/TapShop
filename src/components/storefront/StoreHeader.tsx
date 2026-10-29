import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  MessageCircle,
  Instagram,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  X,
  Store,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';

export const StoreHeader: React.FC = () => {
  const { store, cartCount, setIsCartOpen, activeCustomerTab, setActiveCustomerTab } = useStore();
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Sanitize WhatsApp number for reliable link
  const cleanWhatsAppNumber = store.whatsapp.replace(/[^0-9]/g, '');
  const hasValidWhatsApp = cleanWhatsAppNumber.length >= 9;

  const handleWhatsAppContact = () => {
    if (!hasValidWhatsApp) {
      alert('The seller has not configured a valid WhatsApp number yet.');
      return;
    }
    const text = encodeURIComponent(
      `Hi ${store.name}! 👋 I am browsing your bio storefront on TapShop and I would like to inquire about your products & pickup/delivery options.`
    );
    window.open(`https://wa.me/${cleanWhatsAppNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handlePhoneCall = () => {
    if (!store.phone) return;
    window.location.href = `tel:${store.phone.replace(/\s+/g, '')}`;
  };

  return (
    <header className="relative bg-white border-b border-slate-200">
      {/* Cover Banner */}
      <div className="relative h-32 sm:h-44 md:h-52 w-full bg-slate-900 overflow-hidden">
        {store.bannerImage ? (
          <img
            src={store.bannerImage}
            alt={store.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        {/* Top Floating Controls inside Banner */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-full text-slate-900 font-bold text-xs shadow-md hover:bg-white transition-all active:scale-95"
            aria-label="View shopping bag"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Bag</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-emerald-600 rounded-full tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile & Store Info Container */}
      <div className="relative z-20 max-w-4xl mx-auto px-3.5 sm:px-6 pb-4">
        {/* Avatar + Main Identity Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-3 sm:mb-4 gap-3">
          <div className="flex items-end gap-3 w-full sm:w-auto">
            {/* Avatar Badge - ONLY the avatar floats over banner seam */}
            <div className="-mt-10 sm:-mt-14 relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-white shadow-lg border-2 border-white overflow-hidden shrink-0">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                  {store.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Store Name & Handle - clearly in white content area below banner */}
            <div className="pt-2 sm:pb-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">
                  {store.name}
                </h1>
                <span title="Verified Kenyan Social Merchant" className="inline-flex">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                </span>
              </div>
              <p className="text-xs font-mono font-medium text-slate-500 truncate">
                tapshop.co/@{store.handle}
              </p>
            </div>
          </div>

          {/* Social & Contact Actions (Mobile-Optimized Touch Grid) */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            {/* Direct Phone Call */}
            <button
              onClick={handlePhoneCall}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all"
              title={`Call ${store.phone}`}
            >
              <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Call</span>
            </button>

            {/* WhatsApp DM */}
            <button
              onClick={handleWhatsAppContact}
              disabled={!hasValidWhatsApp}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                hasValidWhatsApp
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 active:scale-95'
                  : 'text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed'
              }`}
              title="Chat with seller on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>WhatsApp</span>
            </button>

            {/* Store Location Info Modal Trigger */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100 active:scale-95 rounded-xl transition-all"
              title="View Physical Shop & Pickup Locations"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Location</span>
            </button>
          </div>
        </div>

        {/* Bio Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mb-3">
          {store.description}
        </p>

        {/* Business Highlights Strip (Pickup + Delivery + Till) */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            {/* Physical Location Snippet */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-medium truncate">
                {store.physicalLocation || 'Nairobi CBD Shop'}
              </span>
            </div>

            {/* Operating Hours Snippet */}
            {store.operatingHours && (
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{store.operatingHours}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600">
            <span className="font-semibold text-emerald-800 flex items-center gap-1">
              <Store className="w-3 h-3 text-emerald-600" />
              CBD Pickup Available ({store.pickupStations.length} Stations)
            </span>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">•</span>
            <span>Nairobi Rider: KES {store.deliveryZones.nairobiFee}</span>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">•</span>
            <span>Upcountry Parcel: KES {store.deliveryZones.upcountryFee}</span>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">•</span>
            <span className="font-mono text-slate-800 font-semibold">Till: {store.paymentMethods.number}</span>
          </div>
        </div>

        {/* Navigation Tabs (Catalog vs Track My Order) */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setActiveCustomerTab('catalog')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeCustomerTab === 'catalog'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Store Catalog
          </button>
          <button
            onClick={() => setActiveCustomerTab('track')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeCustomerTab === 'track'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Track Existing Order
          </button>
        </div>
      </div>

      {/* Business Details & Pickup Station Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-5 sm:p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Business & Pickup Details
                </h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs">
              {/* Physical Shop Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Physical Shop / Head Office
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {store.name}
                </div>
                <div className="text-slate-700 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{store.physicalLocation || 'Nairobi CBD Shop'}</span>
                </div>
                {store.operatingHours && (
                  <div className="text-slate-600 flex items-center gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{store.operatingHours}</span>
                  </div>
                )}
                <div className="text-slate-700 flex items-center gap-2 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Call: <strong className="font-mono text-slate-900">{store.phone}</strong></span>
                </div>
              </div>

              {/* Pickup Stations */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    Designated Shop Pickup Points ({store.pickupStations.length})
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Order ID & PIN required for collection
                  </span>
                </div>

                {store.pickupStations.map((station) => (
                  <div
                    key={station.id}
                    className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-200/70 space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{station.name}</span>
                      <span className="font-mono text-emerald-800 text-[11px]">
                        {station.fee === 0 ? 'Free Pickup' : `KES ${station.fee} shop fee`}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      {station.building}, {station.floorRoom} · {station.city}
                    </p>
                    {station.directions && (
                      <p className="text-slate-500 text-[10px] italic">
                        Directions: {station.directions}
                      </p>
                    )}
                    <p className="text-slate-500 text-[10px]">
                      Hours: {station.operatingHours}
                    </p>
                  </div>
                ))}
              </div>

              {/* Security Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Pickup Security Rule:</strong> To prevent unauthorized collections, our partner pickup shops will ask for your unique <strong>Order ID (e.g. TAP-9402)</strong> and <strong>4-digit Collection PIN</strong> generated upon checkout.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={handleWhatsAppContact}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
