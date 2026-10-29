import React, { useState } from 'react';
import { Order, Store as StoreType } from '../../types';
import { jsPDF } from 'jspdf';
import { buildWhatsAppLink } from '../../utils/phoneUtils';
import {
  X,
  Printer,
  Share2,
  MessageCircle,
  Download,
  CheckCircle2,
  Store,
  Truck,
  ShieldCheck,
  FileCheck,
  AlertCircle,
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
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isPickup = order.customer.fulfillmentType === 'pickup';
  const formattedDate = new Date(order.createdAt).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Generate standardized, professional vector PDF using jsPDF
  const generatePdf = (): jsPDF => {
    // Standard A5 receipt slip format (148mm x 210mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const pageWidth = 148;
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    // 1. Dark Merchant Banner Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Accent line
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 27, pageWidth, 1.5, 'F');

    // Store Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(store.name, margin, 12);

    // Store Handle & Verification
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(`tapshop.co/@${store.handle}  |  VERIFIED KENYAN SOCIAL MERCHANT`, margin, 18);

    if (store.slogan) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(store.slogan.slice(0, 70), margin, 23);
    }

    // 2. Business Contact strip
    let currentY = 34;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105); // slate-600

    const contactLine = `Tel: ${store.phone}   |   WhatsApp: ${store.whatsapp}${
      store.physicalLocation ? `   |   Location: ${store.physicalLocation.slice(0, 45)}` : ''
    }`;
    doc.text(contactLine, margin, currentY);

    // 3. Receipt Metadata Box
    currentY += 4;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('OFFICIAL CASH SALE RECEIPT', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(`REC-${order.id.replace('#', '')}`, margin + 4, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${formattedDate}`, margin + 70, currentY + 6);
    doc.text(`Payment: M-PESA VERIFIED`, margin + 70, currentY + 12);

    // 4. Customer & Fulfillment Information
    currentY += 22;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('BILLED / ISSUED TO:', margin + 4, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(order.customer.fullName, margin + 4, currentY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Phone: ${order.customer.phone}`, margin + 4, currentY + 15);

    // Fulfillment Details
    const fulfillmentLabel = isPickup
      ? `Pickup: ${order.customer.pickupStationName || 'CBD Hub'} (Order #${order.id})`
      : `Delivery: ${order.customer.deliveryAddress}, ${order.customer.city}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(fulfillmentLabel.slice(0, 48), margin + 60, currentY + 10);

    // 5. Items Table Header
    currentY += 24;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ITEM DESCRIPTION', margin + 3, currentY + 4.2);
    doc.text('QTY', margin + 78, currentY + 4.2);
    doc.text('PRICE', margin + 92, currentY + 4.2);
    doc.text('TOTAL', margin + 110, currentY + 4.2);

    // 6. Items Table Body
    currentY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    order.items.forEach((item) => {
      doc.text(item.title.slice(0, 36), margin + 3, currentY + 3.5);
      doc.text(item.quantity.toString(), margin + 80, currentY + 3.5);
      doc.text(`${item.price.toLocaleString()}`, margin + 92, currentY + 3.5);
      doc.text(`${(item.price * item.quantity).toLocaleString()}`, margin + 110, currentY + 3.5);

      currentY += 6;
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY, margin + contentWidth, currentY);
    });

    // 7. Totals Section
    currentY += 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Subtotal:', margin + 75, currentY + 3.5);
    doc.text(`KES ${order.subtotal.toLocaleString()}`, margin + 105, currentY + 3.5);

    currentY += 5;
    doc.text(isPickup ? 'Pickup Station Fee:' : 'Delivery Rider Fee:', margin + 75, currentY + 3.5);
    doc.text(
      order.fulfillmentFee === 0 ? 'FREE' : `KES ${order.fulfillmentFee.toLocaleString()}`,
      margin + 105,
      currentY + 3.5
    );

    currentY += 5.5;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin + 65, currentY, contentWidth - 65, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL PAID:', margin + 68, currentY + 5);
    doc.setTextColor(5, 150, 105);
    doc.text(`KES ${order.totalAmount.toLocaleString()}`, margin + 103, currentY + 5);

    // 8. Official M-Pesa Stamp Box
    currentY += 12;
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.text('✓ M-PESA PAYMENT VERIFIED & CONFIRMED', margin + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    doc.text(`Ref Code: ${order.paymentProof.transactionCode}`, margin + 4, currentY + 11.5);
    doc.text(
      `Account: ${store.paymentMethods.mpesaType.toUpperCase()} ${store.paymentMethods.number} (${store.paymentMethods.accountName})`,
      margin + 50,
      currentY + 11.5
    );

    // 9. Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Official computer-generated sales voucher issued via TapShop Kenya. Asante sana for your business!',
      pageWidth / 2,
      202,
      { align: 'center' }
    );

    return doc;
  };

  const handleDownloadPdf = () => {
    try {
      const doc = generatePdf();
      doc.save(`Receipt-${order.id}.pdf`);
      setDownloadSuccess(true);
      setStatusMessage(`PDF Receipt downloaded as Receipt-${order.id}.pdf`);
      setTimeout(() => {
        setDownloadSuccess(false);
        setStatusMessage(null);
      }, 3500);
    } catch (err) {
      console.error('PDF generation error', err);
      alert('Unable to generate PDF receipt. Please try printing instead.');
    }
  };

  const handleSendPdfToWhatsApp = () => {
    try {
      // 1. Download the PDF document immediately to merchant's files
      const doc = generatePdf();
      doc.save(`Receipt-${order.id}.pdf`);

      // 2. Open WhatsApp to customer with prefilled notification
      const buyerPhone = order.customer.whatsapp || order.customer.phone;
      const text =
        `Hello ${order.customer.fullName}! 👋\n\n` +
        `This is ${store.name}. Your payment for Order #${order.id} has been verified! ✅\n\n` +
        `📄 We have generated your official Sales Receipt (Receipt #REC-${order.id.replace('#', '')}).\n` +
        `💰 Total Paid: KES ${order.totalAmount.toLocaleString()}\n` +
        `📱 M-Pesa Code: ${order.paymentProof.transactionCode}\n\n` +
        `Attached is your official PDF receipt. Asante sana for shopping with us!`;

      const waLink = buildWhatsAppLink(buyerPhone, text);
      if (!waLink) {
        alert('Buyer WhatsApp number is not available.');
        return;
      }

      setStatusMessage(
        `Receipt-${order.id}.pdf has been downloaded! You can now attach this PDF in the opened WhatsApp chat.`
      );

      setTimeout(() => {
        window.open(waLink, '_blank', 'noopener,noreferrer');
      }, 500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSharePdf = async () => {
    try {
      const doc = generatePdf();
      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], `Receipt-${order.id}.pdf`, {
        type: 'application/pdf',
      });

      // Check if browser Web Share API supports file sharing
      if (
        navigator.canShare &&
        navigator.canShare({ files: [pdfFile] })
      ) {
        await navigator.share({
          files: [pdfFile],
          title: `Receipt #${order.id} - ${store.name}`,
          text: `Official sales receipt for Order #${order.id} from ${store.name}.`,
        });
        setStatusMessage('Receipt PDF shared successfully!');
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        // Fallback for browsers that don't support file sharing
        doc.save(`Receipt-${order.id}.pdf`);
        setStatusMessage(
          `PDF Receipt downloaded to your device! You can now send it to Instagram DMs, TikTok DMs, or WhatsApp.`
        );
        setTimeout(() => setStatusMessage(null), 4500);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        handleDownloadPdf();
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs sm:text-sm font-bold font-display">
              Official Verified Sales Receipt (PDF)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
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

        {/* Status / Instruction Notification Banner */}
        {statusMessage && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Viewable Receipt Slip Content (Preview) */}
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
                  Official Receipt No:
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  REC-{order.id.replace('#', '')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Date Verified:
                </span>
                <span className="text-slate-700 font-medium">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Billed / Issued To:</span>
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
              <p>Official vector PDF receipt generated via TapShop Kenya.</p>
              <p className="font-semibold text-slate-500">Asante sana for your business! ✨</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls (Hidden on print) */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2.5 print:hidden">
          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* WhatsApp Send button */}
            <button
              onClick={handleSendPdfToWhatsApp}
              className="w-full h-11 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Send PDF to Buyer's WhatsApp</span>
            </button>

            {/* Social Media / Native PDF Share */}
            <button
              onClick={handleSharePdf}
              className="w-full h-11 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Share PDF to Instagram / Socials</span>
            </button>

            {/* Download PDF button */}
            <button
              onClick={handleDownloadPdf}
              className="w-full h-11 px-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Download className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{downloadSuccess ? 'PDF Downloaded!' : 'Download PDF Receipt'}</span>
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-500">
            Exported as a clean vector <strong className="text-slate-700 font-semibold">.pdf</strong> file formatted for mobile and desktop screens.
          </div>
        </div>
      </div>
    </div>
  );
};
