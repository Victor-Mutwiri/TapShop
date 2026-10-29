import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { PWAInstallBanner } from '../common/PWAInstallBanner';
import { OrderReceiptModal } from '../common/OrderReceiptModal';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  MessageCircle,
  Eye,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  Search,
  Store,
  ChevronRight,
  Lock,
  X,
  Share2,
  AlertTriangle,
} from 'lucide-react';

export const SellerOrders: React.FC = () => {
  const { orders, confirmOrder, markReadyForPickup, declineOrder, updateOrderStatus, store } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const [dispatchNote, setDispatchNote] = useState('');
  const [declineTargetOrder, setDeclineTargetOrder] = useState<Order | null>(null);
  const [selectedDeclineReason, setSelectedDeclineReason] = useState('Payment not reflecting in M-Pesa account');
  const [customDeclineNote, setCustomDeclineNote] = useState('');
  const [openWhatsAppOnDecline, setOpenWhatsAppOnDecline] = useState(true);
  const [isShipping, setIsShipping] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'declined')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery) ||
      order.paymentProof.transactionCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCustomerWhatsApp = (order: Order) => {
    const cleanPhone = (order.customer.whatsapp || order.customer.phone).replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert('Buyer did not provide a phone number for WhatsApp.');
      return;
    }

    const isPickup = order.customer.fulfillmentType === 'pickup';
    const message = encodeURIComponent(
      `Hi ${order.customer.fullName}! 👋 Thank you for ordering from ${store.name} (Order #${order.id}).\n\n` +
      (isPickup
        ? `Your order will be available for pickup at ${order.customer.pickupStationName}.\n📋 To collect your parcel, simply present Order ID #${order.id} to the shop counter clerk.`
        : `Your order is confirmed for delivery to ${order.customer.deliveryAddress}, ${order.customer.city}. We are packing your item for dispatch!`)
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleDeclineWhatsApp = (order: Order, reason?: string) => {
    const cleanPhone = (order.customer.whatsapp || order.customer.phone).replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert('Buyer did not provide a phone number for WhatsApp.');
      return;
    }

    const r = reason || order.declineReason || 'Payment could not be verified in our M-Pesa account';
    const message = encodeURIComponent(
      `Hello ${order.customer.fullName}! 👋\n\n` +
      `This is ${store.name} regarding your order #${order.id}.\n\n` +
      `Unfortunately, we are unable to process this order due to the following reason:\n` +
      `❌ ${r}\n\n` +
      `If you have already sent payment or have questions, please reply directly with your M-Pesa SMS confirmation and we will be happy to assist you!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleConfirm = (orderId: string) => {
    confirmOrder(orderId, 'M-Pesa payment received & verified.');
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'confirmed' });
    }
  };

  const handlePickupReady = (orderId: string) => {
    markReadyForPickup(orderId, 'Package ready at pickup shop counter. Customer can collect with Order ID.');
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'ready_for_pickup' });
    }
  };

  const handleConfirmDeclineSubmit = () => {
    if (!declineTargetOrder) return;
    const finalReason = customDeclineNote.trim()
      ? `${selectedDeclineReason} (${customDeclineNote.trim()})`
      : selectedDeclineReason;

    declineOrder(declineTargetOrder.id, finalReason);

    if (openWhatsAppOnDecline) {
      handleDeclineWhatsApp(declineTargetOrder, finalReason);
    }

    if (selectedOrder && selectedOrder.id === declineTargetOrder.id) {
      setSelectedOrder({ ...selectedOrder, status: 'declined', declineReason: finalReason });
    }

    setDeclineTargetOrder(null);
    setCustomDeclineNote('');
  };

  const handleShipSubmit = (orderId: string) => {
    const note = dispatchNote.trim() || 'Dispatched via city rider. Delivery expected in 2 hours.';
    updateOrderStatus(orderId, 'shipped', note);
    setIsShipping(false);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'shipped', trackingNotes: note });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 sm:pb-12">
      {/* PWA Seller Banner (Crucial for mobile-only business owners) */}
      <PWAInstallBanner variant="seller" />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Sales
          </span>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            KES {totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-800 font-medium">
            {orders.length} orders received
          </span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
            Pending Proofs
          </span>
          <div className="text-base sm:text-2xl font-bold font-mono text-amber-600 mt-1 tabular-nums flex items-center gap-1.5">
            <span>{pendingOrders.length}</span>
            {pendingOrders.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md animate-pulse">
                Action
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Needs M-Pesa check</span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
            Ready / Dispatched
          </span>
          <div className="text-base sm:text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {orders.filter((o) => o.status === 'confirmed' || o.status === 'ready_for_pickup' || o.status === 'shipped').length}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400">Verified &amp; active</span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
            Pickup vs Delivery
          </span>
          <div className="text-sm sm:text-base font-bold text-slate-800 mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-700">
              <Store className="w-3.5 h-3.5" />
              {orders.filter((o) => o.customer.fulfillmentType === 'pickup').length}
            </span>
            <span className="text-slate-300">/</span>
            <span className="flex items-center gap-1 text-indigo-700">
              <Truck className="w-3.5 h-3.5" />
              {orders.filter((o) => o.customer.fulfillmentType === 'delivery').length}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400">CBD Pickups / Deliveries</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            Pending ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveFilter('ready_for_pickup')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeFilter === 'ready_for_pickup'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            At Pickup Shop ({orders.filter((o) => o.status === 'ready_for_pickup').length})
          </button>
          <button
            onClick={() => setActiveFilter('shipped')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeFilter === 'shipped'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-indigo-800 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            Shipped ({orders.filter((o) => o.status === 'shipped').length})
          </button>
          <button
            onClick={() => setActiveFilter('declined')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              activeFilter === 'declined'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            Declined ({orders.filter((o) => o.status === 'declined').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, PIN, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* MOBILE ORDER CARDS (Touch-friendly layout on smartphones) */}
      <div className="block sm:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-4">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No orders found</h4>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPickup = order.customer.fulfillmentType === 'pickup';

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 bg-white rounded-2xl border shadow-xs space-y-3 cursor-pointer active:scale-99 transition-all ${
                  order.status === 'pending'
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        #{order.id}
                      </span>
                      {isPickup ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                          <Store className="w-3 h-3" /> Pickup
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-0.5">
                          <Truck className="w-3 h-3" /> Delivery
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {order.customer.fullName} · {order.customer.phone}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      KES {order.totalAmount.toLocaleString()}
                    </span>
                    <div className="mt-0.5">
                      {order.status === 'pending' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Verify Proof
                        </span>
                      )}
                      {order.status === 'ready_for_pickup' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          At Pickup Shop
                        </span>
                      )}
                      {order.status === 'confirmed' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Confirmed
                        </span>
                      )}
                      {order.status === 'shipped' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          Dispatched
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items & Location snippet */}
                <div className="text-xs text-slate-600 line-clamp-1">
                  {order.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                </div>

                {/* Shop Pickup Location Info */}
                {isPickup && order.customer.pickupStationName && (
                  <div className="p-2 bg-emerald-50 rounded-xl text-xs flex items-center justify-between text-emerald-950 border border-emerald-200">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-900">
                      <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Pickup Hub:
                    </span>
                    <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[180px]">
                      {order.customer.pickupStationName}
                    </span>
                  </div>
                )}

                {/* Bottom Quick Action Strip */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCustomerWhatsApp(order);
                      }}
                      className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    {/* Verified Receipt Button - Only shown when payment is verified */}
                    {order.status !== 'pending' && order.status !== 'declined' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceiptOrder(order);
                        }}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1 font-semibold text-[11px] transition-colors border border-emerald-200/60"
                        title="Generate and send verified PDF receipt"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PDF Receipt</span>
                      </button>
                    )}
                    <a
                      href={`tel:${order.customer.phone.replace(/\s+/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-slate-100 text-slate-700 rounded-lg"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <span className="font-mono text-xs font-semibold text-emerald-800">
                    M-Pesa: {order.paymentProof.transactionCode}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP ORDERS TABLE (Rendered on tablet & desktop) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No orders match this filter</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID &amp; Type</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Fulfillment Details</th>
                  <th className="py-3 px-4">M-Pesa Proof</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isPickup = order.customer.fulfillmentType === 'pickup';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        order.status === 'pending' ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* ID & Fulfillment Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          #{order.id}
                        </div>
                        <div className="mt-0.5">
                          {isPickup ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-flex items-center gap-1">
                              <Store className="w-3 h-3" /> CBD Pickup
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 inline-flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Delivery
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {order.customer.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {order.customer.phone}
                        </div>
                      </td>

                      {/* Fulfillment Details */}
                      <td className="py-3.5 px-4">
                        {isPickup ? (
                          <div>
                            <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                              {order.customer.pickupStationName}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                              <Store className="w-3 h-3" /> Pickup with Order #{order.id}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-slate-800 truncate max-w-[200px]">
                              {order.customer.deliveryAddress}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {order.customer.city} ({order.customer.deliveryZone === 'upcountry' ? 'Upcountry' : 'Nairobi'})
                            </div>
                          </div>
                        )}
                      </td>

                      {/* M-Pesa Proof */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {order.paymentProof.transactionCode}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          KES {order.totalAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {order.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Pending Verify
                          </span>
                        )}
                        {order.status === 'ready_for_pickup' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <Store className="w-3 h-3" /> At Pickup Counter
                          </span>
                        )}
                        {order.status === 'confirmed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        )}
                        {order.status === 'shipped' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                            <Truck className="w-3 h-3" /> Dispatched
                          </span>
                        )}
                        {order.status === 'declined' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" /> Declined
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status !== 'pending' && order.status !== 'declined' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptOrder(order);
                              }}
                              className="px-2 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1 transition-colors border border-emerald-200/60"
                              title="Generate and send verified PDF receipt"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>PDF Receipt</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL-SCREEN RESPONSIVE ORDER INSPECTION DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-16">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Order #{selectedOrder.id}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        selectedOrder.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedOrder.status === 'ready_for_pickup' || selectedOrder.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedOrder.status === 'shipped'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
                {/* PROOF OF PAYMENT HIGHLIGHT BOX */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      M-Pesa Verification
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      Total: KES {selectedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Transaction Code copy strip */}
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block">
                        Transaction Code
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {selectedOrder.paymentProof.transactionCode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(selectedOrder.paymentProof.transactionCode)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Raw SMS */}
                  {selectedOrder.paymentProof.rawMessage && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Pasted M-Pesa SMS Confirmation:
                      </span>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed break-words">
                        {selectedOrder.paymentProof.rawMessage}
                      </div>
                    </div>
                  )}

                  {/* Receipt Image */}
                  {selectedOrder.paymentProof.receiptImageUrl && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        Uploaded Receipt:
                      </span>
                      <img
                        src={selectedOrder.paymentProof.receiptImageUrl}
                        alt="Receipt"
                        className="w-full h-40 object-contain rounded-xl border border-slate-200 bg-slate-900/5"
                      />
                    </div>
                  )}
                </div>

                {/* KENYAN FULFILLMENT VERIFICATION */}
                {selectedOrder.customer.fulfillmentType === 'pickup' ? (
                  <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-500/30 space-y-2.5">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-white/10">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Store className="w-4 h-4" />
                        CBD Shop Pickup Fulfillment
                      </span>
                      <span className="text-[10px] text-slate-400">Order ID Verification</span>
                    </div>

                    <div className="p-2.5 bg-white/10 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-emerald-300 block font-bold">
                          Pickup Order Reference
                        </span>
                        <span className="text-xl font-bold font-mono text-emerald-400 tracking-wider">
                          #{selectedOrder.id}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-slate-300">
                        Customer shows Order ID<br />to shop counter clerk
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300">
                      Station: <strong>{selectedOrder.customer.pickupStationName}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-900 block text-xs">
                      🚚 Doorstep Delivery Details
                    </span>
                    <div className="text-slate-700">
                      Address: <strong>{selectedOrder.customer.deliveryAddress}</strong>
                    </div>
                    <div className="text-slate-600">
                      City: {selectedOrder.customer.city} ({selectedOrder.customer.deliveryZone === 'upcountry' ? 'Outside Nairobi' : 'Nairobi'})
                    </div>
                  </div>
                )}

                {/* Customer Contact & WhatsApp Action */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Customer Name</span>
                    <span className="font-bold text-slate-900">{selectedOrder.customer.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phone Contact</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900">{selectedOrder.customer.phone}</span>
                      <button
                        onClick={() => handleCustomerWhatsApp(selectedOrder)}
                        className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold text-[11px] flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp Customer</span>
                      </button>
                    </div>
                  </div>
                  {selectedOrder.customer.notes && (
                    <div className="pt-2 border-t border-slate-200 text-slate-600">
                      <span className="font-semibold block text-slate-800">Customer Instructions:</span>
                      {selectedOrder.customer.notes}
                    </div>
                  )}
                </div>

                {/* Purchased Items */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Items in Order ({selectedOrder.items.length})
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-white">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded-lg bg-slate-100 border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{item.title}</div>
                            <div className="text-slate-400">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-slate-900">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-white border-t border-slate-200 space-y-2">
                {selectedOrder.status === 'pending' && (
                  <div className="flex gap-2">
                    {selectedOrder.customer.fulfillmentType === 'pickup' ? (
                      <button
                        onClick={() => handlePickupReady(selectedOrder.id)}
                        className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <Store className="w-4 h-4" />
                        <span>Confirm &amp; Ready at Pickup Shop</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConfirm(selectedOrder.id)}
                        className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Payment &amp; Pack Order</span>
                      </button>
                    )}
                    <button
                      onClick={() => setDeclineTargetOrder(selectedOrder)}
                      className="px-4 h-11 bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                )}

                {selectedOrder.status === 'confirmed' && selectedOrder.customer.fulfillmentType === 'delivery' && (
                  <button
                    onClick={() => setIsShipping(!isShipping)}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Mark as Shipped / Assign Rider</span>
                  </button>
                )}

                {selectedOrder.status === 'declined' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Order Declined</span>
                    </div>
                    <p className="text-rose-700 text-[11px]">
                      Reason: <strong>{selectedOrder.declineReason || 'Payment not verified'}</strong>
                    </p>
                    <button
                      onClick={() => handleDeclineWhatsApp(selectedOrder)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-all shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send / Resend Decline Reason to Buyer on WhatsApp</span>
                    </button>
                  </div>
                )}

                {/* Shipping prompt */}
                {isShipping && (
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2 text-xs">
                    <label className="font-semibold text-indigo-900 block">
                      Courier / Rider Dispatch Note:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dispatched with Rider Peter (0722-000111) / Coast Bus Waybill #4902"
                      value={dispatchNote}
                      onChange={(e) => setDispatchNote(e.target.value)}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsShipping(false)}
                        className="px-3 py-1 bg-white border rounded text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleShipSubmit(selectedOrder.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded font-semibold"
                      >
                        Confirm Dispatch
                      </button>
                    </div>
                  </div>
                )}

                {/* Verified Order Receipt Generation - Only available after merchant verifies payment proof */}
                {selectedOrder.status !== 'pending' && selectedOrder.status !== 'declined' ? (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setReceiptOrder(selectedOrder)}
                      className="flex-1 h-10 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <FileText className="w-4 h-4 text-white" />
                      <span>Generate &amp; Send PDF Receipt</span>
                    </button>
                    <button
                      onClick={() => handleCustomerWhatsApp(selectedOrder)}
                      className="h-10 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors border border-emerald-200"
                      title="Direct WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                ) : selectedOrder.status === 'pending' ? (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Official PDF receipt unlocks once you verify M-Pesa proof and confirm order above.
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT & ELEGANT DECLINE ORDER MODAL */}
      {declineTargetOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Decline Order #{declineTargetOrder.id}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Buyer: {declineTargetOrder.customer.fullName} ({declineTargetOrder.customer.phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeclineTargetOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Select Reason for Declining:
              </label>
              <div className="space-y-2">
                {[
                  {
                    title: 'Payment not reflecting in M-Pesa account',
                    desc: 'No matching transaction code found in statement',
                  },
                  {
                    title: 'Incorrect amount paid',
                    desc: `Amount received is less than total KES ${declineTargetOrder.totalAmount.toLocaleString()}`,
                  },
                  {
                    title: 'Item out of stock',
                    desc: 'Product sold out or inventory unavailable',
                  },
                  {
                    title: 'Invalid transaction code',
                    desc: 'Code appears invalid, expired, or duplicate',
                  },
                ].map((item) => (
                  <label
                    key={item.title}
                    onClick={() => setSelectedDeclineReason(item.title)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedDeclineReason === item.title
                        ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="declineReasonRadio"
                      checked={selectedDeclineReason === item.title}
                      onChange={() => setSelectedDeclineReason(item.title)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{item.title}</div>
                      <div className="text-[10px] text-slate-500">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Optional note to buyer:
              </label>
              <input
                type="text"
                placeholder="e.g. Please check transaction code or send balance of KES 200"
                value={customDeclineNote}
                onChange={(e) => setCustomDeclineNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Direct WhatsApp notify checkbox */}
            <label className="flex items-start gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={openWhatsAppOnDecline}
                onChange={(e) => setOpenWhatsAppOnDecline(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300"
              />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">
                  Send Decline Reason to Buyer via WhatsApp
                </span>
                <span className="text-[11px] text-emerald-800">
                  Automatically launches WhatsApp with a polite explanation and prompt to verify.
                </span>
              </div>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeclineTargetOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeclineSubmit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {openWhatsAppOnDecline ? (
                  <>
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Decline &amp; WhatsApp</span>
                  </>
                ) : (
                  <span>Confirm Decline</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMAL DIGITAL SALES RECEIPT MODAL */}
      {receiptOrder && (
        <OrderReceiptModal
          order={receiptOrder}
          store={store}
          viewerRole="seller"
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
};
