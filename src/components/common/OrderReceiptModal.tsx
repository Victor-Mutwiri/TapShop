import React, { useState } from 'react';
import { Order, Store as StoreType } from '../../types';
import {
  X,
  Printer,
  Share2,
  MessageCircle,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Store,
  Truck,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface OrderReceiptModalProps {
  order: Order;
  store: StoreType;
  onClose: () => void;
  viewerRole?: 'seller' | 'customer';
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  store,
  onClose,
  viewerRole = 'seller',
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const isPickup = order.customer.fulfillmentType === 'pickup';
  const formattedDate = new Date(order.createdAt).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Generate plain text receipt format (ideal for DM, SMS, or WhatsApp)
  const generateReceiptText = () => {
    const divider = '------------------------------------------';
    const itemsList = order.items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.title}\n   @ KES ${i.price.toLocaleString()} = KES ${(
            i.quantity * i.price
          ).toLocaleString()}`
      )
      .join('\n');

    const fulfillmentDetails = isPickup
      ? `Pickup Point: ${order.customer.pickupStationName || 'CBD Hub'}\n(Collect with Order ID #${order.id})`
      : `Doorstep Delivery: ${order.customer.deliveryAddress}, ${order.customer.city}`;

    return `🧾 *OFFICIAL SALE RECEIPT - ${store.name.toUpperCase()}*\n` +
      `Receipt No: REC-${order.id.replace('#', '')}\n` +
      `Date: ${formattedDate}\n` +
      `Status: ${order.status.toUpperCase()} (M-Pesa Verified)\n` +
      `${divider}\n` +
      `*CUSTOMER DETAILS:*\n` +
      `Name: ${order.customer.fullName}\n` +
      `Phone: ${order.customer.phone}\n` +
      `${fulfillmentDetails}\n` +
      `${divider}\n` +
      `*ITEMS ORDERED:*\n` +
      `${itemsList}\n` +
      `${divider}\n` +
      `Subtotal: KES ${order.subtotal.toLocaleString()}\n` +
      `Fulfillment Fee: KES ${order.fulfillmentFee.toLocaleString()}\n` +
      `*TOTAL PAID: KES ${order.totalAmount.toLocaleString()}*\n` +
      `${divider}\n` +
      `*PAYMENT VERIFICATION:*\n` +
      `Payment Method: M-Pesa (${store.paymentMethods.mpesaType.toUpperCase()} ${store.paymentMethods.number})\n` +
      `M-Pesa Ref Code: ${order.paymentProof.transactionCode}\n` +
      `${divider}\n` +
      `Merchant: ${store.name} | Phone: ${store.phone}\n` +
      `Storefront: tapshop.co/@${store.handle}\n` +
      `Asante sana for shopping with us! ✨`;
  };

  const handleCopyReceiptText = () => {
    navigator.clipboard.writeText(generateReceiptText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const handleSendViaWhatsApp = () => {
    const text = encodeURIComponent(generateReceiptText());
    // If seller is viewing, send to customer's WhatsApp
    // If customer is viewing, send to seller's WhatsApp
    const targetNumber =
      viewerRole === 'seller'
        ? (order.customer.whatsapp || order.customer.phone).replace(/[^0-9]/g, '')
        : store.whatsapp.replace(/[^0-9]/g, '');

    if (!targetNumber) {
      alert('Recipient WhatsApp number is not available.');
      return;
    }

    window.open(`https://wa.me/${targetNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareToSocials = async () => {
    const receiptText = generateReceiptText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt #${order.id} - ${store.name}`,
          text: receiptText,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopyReceiptText();
      }
    } else {
      // Fallback: Copy to clipboard and show toast
      navigator.clipboard.writeText(receiptText);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold font-display">
              Official Sales Receipt &amp; Voucher
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Print Receipt or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable / Viewable Receipt Slip Content */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-5 bg-slate-50/50 print:p-0 print:bg-white text-xs">
          {/* RECEIPT PAPER CONTAINER */}
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto print:border-none print:shadow-none print:p-0">
            {/* Header: Company Logo & Identity */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              {store.logo ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white p-1">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg font-display">
                  {store.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <h2 className="text-base sm:text-xl font-bold text-slate-900 font-display">
                {store.name}
              </h2>
              {store.slogan && (
                <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-2">
                  "{store.slogan}"
                </p>
              )}

              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div>📞 Tel: {store.phone} | WhatsApp: {store.whatsapp}</div>
                {store.physicalLocation && (
                  <div className="text-slate-500">📍 {store.physicalLocation}</div>
                )}
                <div className="font-mono text-emerald-700 font-medium">
                  tapshop.co/@{store.handle}
                </div>
              </div>
            </div>

            {/* Receipt Metadata Badge */}
            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Receipt No:
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  REC-{order.id.replace('#', '')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Date &amp; Time:
                </span>
                <span className="text-slate-700 font-medium">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Billed To:</span>
                <span className="font-bold text-slate-900">{order.customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Phone:</span>
                <span className="font-mono font-semibold text-slate-800">{order.customer.phone}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Fulfillment:</span>
                <span className="font-semibold text-slate-900">
                  {isPickup ? (
                    <span className="text-emerald-800 inline-flex items-center gap-1">
                      <Store className="w-3 h-3" /> Pickup: {order.customer.pickupStationName}
                    </span>
                  ) : (
                    <span className="text-indigo-800 inline-flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Doorstep Delivery ({order.customer.city})
                    </span>
                  )}
                </span>
              </div>
              {!isPickup && order.customer.deliveryAddress && (
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Address:</span>
                  <span className="font-medium text-right max-w-[240px] truncate">
                    {order.customer.deliveryAddress}
                  </span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="space-y-1">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-slate-400 pb-1.5 border-b border-slate-200">
                <span className="col-span-7">Item Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Amount</span>
              </div>

              <div className="divide-y divide-slate-100 py-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-2 text-xs items-center">
                    <div className="col-span-7 pr-2">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        @ KES {item.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="col-span-2 text-center font-medium text-slate-700">
                      {item.quantity}
                    </div>
                    <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">KES {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  {isPickup ? 'Pickup Station Handling' : 'Delivery Rider Fee'}
                </span>
                <span className="font-mono">
                  {order.fulfillmentFee === 0 ? 'FREE' : `KES ${order.fulfillmentFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-300 text-sm sm:text-base font-bold text-slate-900">
                <span>Total Amount Paid</span>
                <span className="font-mono text-emerald-700">
                  KES {order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* M-PESA PAYMENT VERIFICATION STAMP */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] space-y-1 text-emerald-950">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  M-Pesa Verified Transaction
                </span>
                <span className="font-mono text-emerald-700 text-xs font-bold">
                  {order.paymentProof.transactionCode}
                </span>
              </div>
              <div className="text-slate-600 text-[10px] flex justify-between">
                <span>Method: {store.paymentMethods.mpesaType.toUpperCase()} ({store.paymentMethods.number})</span>
                <span>Account: {store.paymentMethods.accountName}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center pt-3 border-t border-dashed border-slate-200 text-[10px] text-slate-400 space-y-0.5">
              <p>Official computer-generated receipt issued via TapShop Kenya.</p>
              <p className="font-semibold text-slate-500">Asante sana for your business! ✨</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls (Hidden on print) */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2 print:hidden">
          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* WhatsApp Send button */}
            <button
              onClick={handleSendViaWhatsApp}
              className="w-full h-10 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {viewerRole === 'seller' ? 'Send to Customer WhatsApp' : 'Send to Store WhatsApp'}
              </span>
            </button>

            {/* Social Media / Web Share button */}
            <button
              onClick={handleShareToSocials}
              className="w-full h-10 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Socials / DM</span>
            </button>

            {/* Copy Receipt Text button */}
            <button
              onClick={handleCopyReceiptText}
              className="w-full h-10 px-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copiedText ? 'Receipt Text Copied!' : 'Copy Formatted Slip'}</span>
            </button>
          </div>

          {sharedToast && (
            <div className="text-center text-[11px] font-semibold text-indigo-700 bg-indigo-50 py-1 rounded-lg animate-in fade-in">
              Receipt summary copied! Ready to paste into Instagram, TikTok, or Twitter DMs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
