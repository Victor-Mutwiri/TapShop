import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Store,
  Lock,
} from 'lucide-react';

export const OrderTrackerView: React.FC = () => {
  const { orders, setActiveCustomerTab } = useStore();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const clean = query.trim().toUpperCase();
    const found = orders.find(
      (o) =>
        o.id.toUpperCase() === clean ||
        o.id.replace('#', '').toUpperCase() === clean ||
        o.customer.phone.includes(query.trim()) ||
        (o.collectionPin && o.collectionPin === clean) ||
        o.paymentProof.transactionCode.toUpperCase() === clean
    );

    setMatchedOrder(found || null);
    setSearched(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-3.5 sm:px-6 py-6 pb-24 sm:pb-12 text-xs">
      {/* Return button */}
      <button
        onClick={() => setActiveCustomerTab('catalog')}
        className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store Catalog</span>
      </button>

      {/* Tracker Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-7 shadow-xs">
        <div className="text-center max-w-sm mx-auto mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 font-display">
            Track Order &amp; Fulfillment
          </h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Enter your Order ID (e.g. <span className="font-mono font-semibold">TAP-9402</span>), phone, or Collection PIN.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. TAP-9402 or 0722819042"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs"
          >
            Track
          </button>
        </form>

        {/* Suggestion tags */}
        {!searched && (
          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Demo sample orders: </span>
            <button
              onClick={() => {
                setQuery('TAP-9402');
                setMatchedOrder(orders.find((o) => o.id === 'TAP-9402') || null);
                setSearched(true);
              }}
              className="font-mono font-bold text-emerald-700 hover:underline mx-1"
            >
              TAP-9402 (CBD Pickup)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                setQuery('TAP-9388');
                setMatchedOrder(orders.find((o) => o.id === 'TAP-9388') || null);
                setSearched(true);
              }}
              className="font-mono font-bold text-emerald-700 hover:underline mx-1"
            >
              TAP-9388 (Delivery)
            </button>
          </div>
        )}

        {/* Results */}
        {searched && !matchedOrder && (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200">
            <AlertCircle className="w-7 h-7 text-amber-500 mx-auto mb-1.5" />
            <h4 className="font-semibold text-slate-800">Order Not Found</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Please double check the Order reference number or phone number.
            </p>
          </div>
        )}

        {matchedOrder && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            {/* Status Card Header */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Order Reference
                </span>
                <div className="text-base font-bold font-mono text-slate-900">
                  #{matchedOrder.id}
                </div>
              </div>

              <div>
                {matchedOrder.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    <Clock className="w-3.5 h-3.5" /> Pending Payment Check
                  </span>
                )}
                {matchedOrder.status === 'ready_for_pickup' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <Store className="w-3.5 h-3.5" /> Ready at Pickup Counter
                  </span>
                )}
                {matchedOrder.status === 'confirmed' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified &amp; Processing
                  </span>
                )}
                {matchedOrder.status === 'shipped' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    <Truck className="w-3.5 h-3.5" /> In Transit / Out for Delivery
                  </span>
                )}
                {matchedOrder.status === 'declined' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                    <XCircle className="w-3.5 h-3.5" /> Order Declined
                  </span>
                )}
              </div>
            </div>

            {/* If Pickup: Show Security Pickup Pass */}
            {matchedOrder.customer.fulfillmentType === 'pickup' && (
              <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Store className="w-4 h-4" />
                    Shop Pickup Verification Pass
                  </span>
                  <span className="text-[10px] text-slate-400">Show to Shop Clerk</span>
                </div>

                <div className="p-3 bg-white/10 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-emerald-300 block">
                      Security Collection PIN
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-400 tracking-wider">
                      {matchedOrder.collectionPin}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    Order #{matchedOrder.id}
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 pt-1">
                  Station: <strong>{matchedOrder.customer.pickupStationName}</strong>
                </div>
              </div>
            )}

            {/* If Delivery: Show Delivery Address */}
            {matchedOrder.customer.fulfillmentType === 'delivery' && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Delivery Destination
                </span>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {matchedOrder.customer.deliveryAddress}, {matchedOrder.customer.city}
                </div>
                {matchedOrder.trackingNotes && (
                  <div className="text-indigo-800 mt-1 font-medium flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    <span>{matchedOrder.trackingNotes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Items Summary */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Order Items ({matchedOrder.items.length})
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                {matchedOrder.items.map((i, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between items-center">
                    <span>{i.quantity}x {i.title}</span>
                    <span className="font-mono font-semibold">KES {(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-bold">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-emerald-800">KES {matchedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
