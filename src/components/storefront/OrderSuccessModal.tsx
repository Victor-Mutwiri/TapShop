import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Package,
  Store,
  Truck,
  ShieldCheck,
  Copy,
  Check,
  Lock,
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const {
    activePlacedOrder,
    setActivePlacedOrder,
    store,
    setActiveCustomerTab,
  } = useStore();

  const [copiedPin, setCopiedPin] = useState(false);

  if (!activePlacedOrder) return null;

  const isPickup = activePlacedOrder.customer.fulfillmentType === 'pickup';

  const handleCopyPin = () => {
    if (activePlacedOrder.collectionPin) {
      navigator.clipboard.writeText(activePlacedOrder.collectionPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleShareToWhatsApp = () => {
    const cleanNumber = store.whatsapp.replace(/[^0-9]/g, '');
    if (!cleanNumber) {
      alert('Seller WhatsApp number not available.');
      return;
    }

    const fulfillmentText = isPickup
      ? `📍 Pickup Station: ${activePlacedOrder.customer.pickupStationName}\n🔐 Security Collection PIN: ${activePlacedOrder.collectionPin}`
      : `🚚 Doorstep Delivery To: ${activePlacedOrder.customer.fullName}, ${activePlacedOrder.customer.deliveryAddress}, ${activePlacedOrder.customer.city}`;

    const message = encodeURIComponent(
      `Hi ${store.name}! 👋 I just placed order #${activePlacedOrder.id} through your TapShop bio portal.\n\n` +
      `📦 Items: ${activePlacedOrder.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}\n` +
      `💰 Total: KES ${activePlacedOrder.totalAmount.toLocaleString()}\n` +
      `📱 M-Pesa Code: ${activePlacedOrder.paymentProof.transactionCode}\n` +
      `${fulfillmentText}\n\n` +
      `Please confirm payment and processing. Thank you!`
    );

    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleGoToTracking = () => {
    setActivePlacedOrder(null);
    setActiveCustomerTab('track');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-5 sm:p-7 text-center my-4">
        {/* Animated Success Badge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-inner">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 mb-2">
          <Clock className="w-3.5 h-3.5" />
          Status: Pending Seller Verification
        </span>

        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 font-display">
          Order Submitted Successfully!
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
          The seller (<strong>{store.name}</strong>) has been automatically alerted to verify your M-Pesa proof.
        </p>

        {/* SECURITY PICKUP PASS (Crucial Kenyan Shop Pickup Feature) */}
        {isPickup ? (
          <div className="mt-4 p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-500/30 text-left space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                Shop Pickup Collection Pass
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Present at Counter</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <span className="text-[10px] uppercase text-slate-300 block">Order Reference</span>
                <span className="text-base sm:text-lg font-bold font-mono text-white">
                  #{activePlacedOrder.id}
                </span>
              </div>

              <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-emerald-300 block font-bold">
                    Collection PIN
                  </span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tracking-wider">
                    {activePlacedOrder.collectionPin}
                  </span>
                </div>
                <button
                  onClick={handleCopyPin}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                  title="Copy PIN"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 space-y-0.5 pt-1">
              <div className="font-semibold text-white">
                📍 {activePlacedOrder.customer.pickupStationName}
              </div>
              <div className="text-[10px] text-slate-400">
                To prevent fraud, the pickup shop clerk will ask for your Order ID and Collection PIN.
              </div>
            </div>
          </div>
        ) : (
          /* Delivery Details Pass */
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Order Reference</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                #{activePlacedOrder.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Delivery Destination</span>
              <span className="font-medium text-slate-900">
                {activePlacedOrder.customer.deliveryAddress}, {activePlacedOrder.customer.city}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">M-Pesa Code</span>
              <span className="font-mono font-semibold text-emerald-700">
                {activePlacedOrder.paymentProof.transactionCode}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          {/* Direct WhatsApp Share button */}
          <button
            onClick={handleShareToWhatsApp}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Order Pass to Seller's WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToTracking}
              className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-slate-600" />
              <span>Track Live Status</span>
            </button>
            <button
              onClick={() => setActivePlacedOrder(null)}
              className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium text-xs transition-colors"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
