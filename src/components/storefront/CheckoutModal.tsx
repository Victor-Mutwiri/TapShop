import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CustomerDetails, PaymentProof, FulfillmentType, DeliveryZoneType } from '../../types';
import { parseMpesaMessage, getSampleMpesaMessage } from '../../utils/mpesaParser';
import {
  X,
  Copy,
  Check,
  Upload,
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  MapPin,
  Store,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    store,
    placeOrder,
  } = useStore();

  // Fulfillment state: 'pickup' | 'delivery'
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [selectedStationId, setSelectedStationId] = useState<string>(
    store.pickupStations[0]?.id || ''
  );
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneType>('nairobi');

  // Customer contact fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [notes, setNotes] = useState('');

  // Payment proof states
  const [proofMode, setProofMode] = useState<'sms' | 'code' | 'screenshot'>('sms');
  const [rawSms, setRawSms] = useState('');
  const [directCode, setDirectCode] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Statuses
  const [copiedTill, setCopiedTill] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isCheckoutOpen) return null;

  // Calculate fulfillment fee dynamically
  let fulfillmentFee = 0;
  if (fulfillmentType === 'pickup') {
    const station = store.pickupStations.find((s) => s.id === selectedStationId);
    fulfillmentFee = station ? station.fee : 0;
  } else {
    if (deliveryZone === 'upcountry') {
      fulfillmentFee = store.deliveryZones.upcountryFee;
    } else {
      fulfillmentFee =
        cartSubtotal >= store.deliveryZones.freeDeliveryThreshold
          ? 0
          : store.deliveryZones.nairobiFee;
    }
  }

  const totalAmount = cartSubtotal + fulfillmentFee;
  const parsedSms = parseMpesaMessage(rawSms);

  const handleCopyTill = () => {
    navigator.clipboard.writeText(store.paymentMethods.number);
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalAmount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handlePasteSampleSms = () => {
    const sample = getSampleMpesaMessage(store.name, totalAmount, store.paymentMethods.number);
    setRawSms(sample);
    const parsed = parseMpesaMessage(sample);
    if (parsed.transactionCode) {
      setDirectCode(parsed.transactionCode);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required for verification and notification';
    } else if (phone.trim().length < 9) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!email.trim() || !email.includes('@')) {
      newErrors.email = 'Valid email address is required';
    }

    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address / landmark is required for courier dispatch';
    }

    // Proof validation
    let resolvedCode = directCode.trim().toUpperCase();
    if (proofMode === 'sms') {
      if (!rawSms.trim()) {
        newErrors.proof = 'Please paste your M-Pesa confirmation SMS or use the sample button.';
      } else if (!parsedSms.isValid && !resolvedCode) {
        newErrors.proof = 'Could not find a valid M-Pesa transaction code in the message.';
      }
    } else if (proofMode === 'code') {
      if (!directCode.trim() || directCode.trim().length < 8) {
        newErrors.proof = 'Please enter a valid 8-12 character M-Pesa transaction code.';
      }
    } else if (proofMode === 'screenshot') {
      if (!receiptImage) {
        newErrors.proof = 'Please upload your M-Pesa receipt screenshot.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const resolvedCode =
      proofMode === 'sms' && parsedSms.transactionCode
        ? parsedSms.transactionCode
        : directCode.trim().toUpperCase() || 'MPESA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const selectedStation = store.pickupStations.find((s) => s.id === selectedStationId);

    const customer: CustomerDetails = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      fulfillmentType,
      pickupStationId: fulfillmentType === 'pickup' ? selectedStationId : undefined,
      pickupStationName: fulfillmentType === 'pickup' && selectedStation ? `${selectedStation.name} (${selectedStation.building})` : undefined,
      deliveryZone: fulfillmentType === 'delivery' ? deliveryZone : undefined,
      deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress.trim() : undefined,
      city: fulfillmentType === 'delivery' ? city.trim() : 'Nairobi',
      notes: notes.trim() || undefined,
    };

    const proof: PaymentProof = {
      method: 'mpesa',
      transactionCode: resolvedCode,
      rawMessage: rawSms.trim() || undefined,
      senderPhone: phone.trim(),
      amountReported: totalAmount,
      receiptImageUrl: receiptImage || undefined,
      submittedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      placeOrder(customer, proof);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-4 sm:my-8 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Direct Bio Checkout
            </span>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 font-display">
              Review &amp; Place Your Order
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Order Summary Strip */}
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-900 font-medium">
                {cart.length} item{cart.length > 1 ? 's' : ''} from {store.name}
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                Total to Pay: <span className="font-mono text-emerald-800 tabular-nums">KES {totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              {fulfillmentType === 'pickup' ? (
                <span className="text-emerald-700 font-semibold">
                  {fulfillmentFee === 0 ? 'Free Shop Pickup' : `KES ${fulfillmentFee} shop fee`}
                </span>
              ) : (
                <span>
                  Delivery: {fulfillmentFee === 0 ? 'Free' : `KES ${fulfillmentFee}`}
                </span>
              )}
            </div>
          </div>

          {/* SECTION 1: Kenyan Fulfillment Choice (Shop Pickup vs Delivery) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Choose Fulfillment Method
              </h3>
            </div>

            {/* Segmented Fulfillment Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  fulfillmentType === 'pickup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs">CBD Shop Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  fulfillmentType === 'delivery'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs">Doorstep / Parcel</span>
              </button>
            </div>

            {/* Option A: Pickup Point Selection */}
            {fulfillmentType === 'pickup' && (
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">
                    Select Preferred Pickup Station:
                  </label>
                  <div className="space-y-2">
                    {store.pickupStations.map((station) => (
                      <label
                        key={station.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedStationId === station.id
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white/80 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickupStation"
                          value={station.id}
                          checked={selectedStationId === station.id}
                          onChange={() => setSelectedStationId(station.id)}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">
                              {station.name}
                            </span>
                            <span className="font-mono text-emerald-800 font-semibold text-[11px]">
                              {station.fee === 0 ? 'Free' : `KES ${station.fee}`}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">
                            {station.building}, {station.floorRoom} · {station.city}
                          </p>
                          <p className="text-slate-500 text-[10px] mt-0.5">
                            Hours: {station.operatingHours}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Anti-Imposter Security Explanation (Solves user's core problem) */}
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-start gap-2 text-[11px] text-emerald-950">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Imposter-Proof Verification:</strong>
                    <span>
                      Anyone can guess a name at a shop counter. TapShop generates a secure <strong>Unique Order ID</strong> and <strong>4-digit Collection PIN</strong> on your order receipt. The pickup clerk will only release your parcel when you show both.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Option B: Delivery Zone Selection */}
            {fulfillmentType === 'delivery' && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-semibold text-slate-800">
                  Select Delivery Coverage Zone:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      deliveryZone === 'nairobi'
                        ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryZone"
                      value="nairobi"
                      checked={deliveryZone === 'nairobi'}
                      onChange={() => setDeliveryZone('nairobi')}
                      className="sr-only"
                    />
                    <div className="font-bold text-slate-900">Within Nairobi</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Same-day doorstep rider ({store.deliveryZones.nairobiEstimatedTime})
                    </div>
                    <div className="font-mono font-bold text-emerald-700 mt-1">
                      {cartSubtotal >= store.deliveryZones.freeDeliveryThreshold ? (
                        <span className="uppercase text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                          Free (Over 6k)
                        </span>
                      ) : (
                        `KES ${store.deliveryZones.nairobiFee}`
                      )}
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      deliveryZone === 'upcountry'
                        ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryZone"
                      value="upcountry"
                      checked={deliveryZone === 'upcountry'}
                      onChange={() => setDeliveryZone('upcountry')}
                      className="sr-only"
                    />
                    <div className="font-bold text-slate-900">Outside Nairobi (Upcountry)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Countrywide parcel via Easy Coach/Fargo/Speedaf
                    </div>
                    <div className="font-mono font-bold text-emerald-700 mt-1">
                      KES {store.deliveryZones.upcountryFee}
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Customer Contact & Address Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Customer Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brenda Wanjiku"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 ${
                    errors.fullName ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.fullName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Phone Number (M-Pesa) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 ${
                    errors.phone ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. brenda@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 ${
                    errors.email ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  WhatsApp Number (For Order Updates)
                </label>
                <input
                  type="tel"
                  placeholder="Same as phone or 07xx..."
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Delivery Address fields only if delivery chosen */}
              {fulfillmentType === 'delivery' && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Town / City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi, Mombasa, Kisumu..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Delivery Address / Estate / Drop-off Point <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kilimani, Denis Pritt Rd, Crystal Court Apt 4B"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 ${
                        errors.deliveryAddress ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {errors.deliveryAddress && (
                      <p className="text-[10px] text-rose-500 mt-0.5">{errors.deliveryAddress}</p>
                    )}
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Special Notes / Preferred Time (Optional)
                </label>
                <input
                  type="text"
                  placeholder={
                    fulfillmentType === 'pickup'
                      ? 'e.g. Will collect around 5:00 PM'
                      : 'e.g. Call security upon arrival at gate'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: M-Pesa Payment Box */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Pay via Lipa na M-Pesa
              </h3>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Lipa na M-Pesa · Buy Goods
                </span>
                <span>Account: {store.paymentMethods.accountName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                {/* Till Number */}
                <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                      Till Number
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono tracking-wider">
                      {store.paymentMethods.number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTill}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title="Copy Till"
                  >
                    {copiedTill ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Amount to pay */}
                <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                      Amount
                    </span>
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                      KES {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAmount}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title="Copy Amount"
                  >
                    {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-normal">
                {store.paymentMethods.instructions}
              </p>
            </div>
          </div>

          {/* SECTION 4: Attach Proof of Payment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Attach Payment Confirmation <span className="text-rose-500">*</span>
                </h3>
              </div>

              {/* Mode switch pills */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setProofMode('sms')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    proofMode === 'sms'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Paste SMS
                </button>
                <button
                  type="button"
                  onClick={() => setProofMode('code')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    proofMode === 'code'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Code Only
                </button>
                <button
                  type="button"
                  onClick={() => setProofMode('screenshot')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    proofMode === 'screenshot'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Screenshot
                </button>
              </div>
            </div>

            {/* Mode 1: Paste SMS Text */}
            {proofMode === 'sms' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Paste the Safaricom M-Pesa SMS confirmation:
                  </span>
                  <button
                    type="button"
                    onClick={handlePasteSampleSms}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Paste Sample SMS</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="e.g. RK92JN182P Confirmed. Ksh2,800.00 paid to SOLARIUM VAULT..."
                  value={rawSms}
                  onChange={(e) => setRawSms(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />

                {parsedSms.isValid && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-emerald-900">
                        Code: {parsedSms.transactionCode}
                        {parsedSms.amount && ` · KES ${parsedSms.amount.toLocaleString()}`}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">
                      Parsed
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Code Only */}
            {proofMode === 'code' && (
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="e.g. RK92JN182P"
                  value={directCode}
                  onChange={(e) => setDirectCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400">
                  Enter the 10-character code at the start of your M-Pesa SMS.
                </p>
              </div>
            )}

            {/* Mode 3: Screenshot Upload */}
            {proofMode === 'screenshot' && (
              <div>
                {receiptImage ? (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <img
                      src={receiptImage}
                      alt="Receipt"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Receipt Screenshot Attached
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptImage(null)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50">
                    <input
                      type="file"
                      id="receipt-file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="receipt-file"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1"
                    >
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-700">Upload screenshot receipt</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {errors.proof && (
              <p className="text-[10px] text-rose-500 flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.proof}
              </p>
            )}
          </div>

          {/* Submission CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Order &amp; Notifying Vendor...</span>
                </div>
              ) : (
                <span>Confirm Payment &amp; Submit Order (KES {totalAmount.toLocaleString()})</span>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              No account creation required · Instant seller notification &amp; collection token
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
