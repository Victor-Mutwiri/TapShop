import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PickupStation } from '../../types';
import {
  Store,
  CreditCard,
  Truck,
  Instagram,
  Phone,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Save,
  Check,
  Smartphone,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Building,
  Tag,
  Briefcase,
} from 'lucide-react';
import { MpesaPaymentType } from '../../types';

export const SellerStoreSettings: React.FC = () => {
  const { store, updateStore } = useStore();

  const [logo, setLogo] = useState(store.logo);
  const [name, setName] = useState(store.name);
  const [handle, setHandle] = useState(store.handle);
  const [slogan, setSlogan] = useState(store.slogan);
  const [description, setDescription] = useState(store.description);
  const [phone, setPhone] = useState(store.phone);
  const [whatsapp, setWhatsapp] = useState(store.whatsapp);
  const [physicalLocation, setPhysicalLocation] = useState(store.physicalLocation || '');
  const [operatingHours, setOperatingHours] = useState(store.operatingHours || '');
  const [instagram, setInstagram] = useState(store.instagram);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Please choose an image under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogo(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Kenyan M-Pesa Options (Till, Paybill, Send Money, Pochi La Biashara)
  const [mpesaType, setMpesaType] = useState<MpesaPaymentType>(store.paymentMethods.mpesaType || 'till');
  const [mpesaNumber, setMpesaNumber] = useState(store.paymentMethods.number);
  const [accountName, setAccountName] = useState(store.paymentMethods.accountName);
  const [paybillAccount, setPaybillAccount] = useState(store.paymentMethods.paybillAccount || '');
  const [instructions, setInstructions] = useState(store.paymentMethods.instructions);

  // Delivery Zones
  const [nairobiFee, setNairobiFee] = useState(store.deliveryZones.nairobiFee.toString());
  const [nairobiEstimatedTime, setNairobiEstimatedTime] = useState(store.deliveryZones.nairobiEstimatedTime);
  const [upcountryFee, setUpcountryFee] = useState(store.deliveryZones.upcountryFee.toString());
  const [upcountryEstimatedTime, setUpcountryEstimatedTime] = useState(store.deliveryZones.upcountryEstimatedTime);
  const [freeThreshold, setFreeThreshold] = useState(store.deliveryZones.freeDeliveryThreshold.toString());

  // Pickup Stations
  const [pickupStations, setPickupStations] = useState<PickupStation[]>(store.pickupStations);

  // Add station modal
  const [newStationName, setNewStationName] = useState('');
  const [newStationBuilding, setNewStationBuilding] = useState('');
  const [newStationFloor, setNewStationFloor] = useState('');
  const [newStationFee, setNewStationFee] = useState('0');
  const [newStationHours, setNewStationHours] = useState('Mon-Sat: 9:00 AM - 6:30 PM');
  const [showAddStation, setShowAddStation] = useState(false);

  const [isSaved, setIsSaved] = useState(false);

  const handleAddStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim() || !newStationBuilding.trim()) return;

    const newStation: PickupStation = {
      id: `pickup_${Date.now()}`,
      name: newStationName.trim(),
      building: newStationBuilding.trim(),
      floorRoom: newStationFloor.trim(),
      city: 'Nairobi CBD',
      fee: parseFloat(newStationFee) || 0,
      operatingHours: newStationHours.trim(),
    };

    setPickupStations([...pickupStations, newStation]);
    setNewStationName('');
    setNewStationBuilding('');
    setNewStationFloor('');
    setShowAddStation(false);
  };

  const handleDeleteStation = (id: string) => {
    setPickupStations(pickupStations.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateStore({
      logo: logo.trim(),
      name: name.trim(),
      handle: handle.trim().toLowerCase().replace(/[^a-z0-9-_]/g, ''),
      slogan: slogan.trim(),
      description: description.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim().replace(/[^0-9]/g, ''),
      physicalLocation: physicalLocation.trim(),
      operatingHours: operatingHours.trim(),
      instagram: instagram.trim(),
      paymentMethods: {
        mpesaType,
        number: mpesaNumber.trim(),
        accountName: accountName.trim(),
        paybillAccount: mpesaType === 'paybill' ? paybillAccount.trim() : undefined,
        instructions: instructions.trim(),
      },
      pickupStations,
      deliveryZones: {
        nairobiFee: parseFloat(nairobiFee) || 0,
        nairobiEstimatedTime: nairobiEstimatedTime.trim(),
        upcountryFee: parseFloat(upcountryFee) || 0,
        upcountryEstimatedTime: upcountryEstimatedTime.trim(),
        freeDeliveryThreshold: parseFloat(freeThreshold) || 6000,
        notes: store.deliveryZones.notes,
      },
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 pb-24 sm:pb-12 text-xs">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
            Business, Pickup &amp; Delivery Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Configure mandatory contact details, CBD pickup stations, and delivery coverage zones.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Changes Saved!' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BUSINESS ICON & BRAND LOGO UPLOADER */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Business Icon &amp; Brand Logo</span>
            </h3>
            <span className="text-[11px] text-slate-500">Appears on Storefront, Header &amp; Receipts</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-1">
            {/* Logo Preview */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-emerald-500/40 p-1 bg-white shadow-md overflow-hidden flex items-center justify-center">
                {logo ? (
                  <img
                    src={logo}
                    alt="Store Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-md shadow-xs">
                Active
              </span>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-xs transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Custom Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo('')}
                    className="px-3 py-2 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-xl font-medium text-xs transition-colors"
                  >
                    Remove Logo
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                Recommended: Square PNG, JPG or WEBP (at least 300x300px, max 4MB).
              </p>

              {/* Direct Image URL input option */}
              <div className="pt-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  Or Image Web URL:
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={logo.startsWith('data:') ? '' : logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MANDATORY BUSINESS CONTACT & PHYSICAL LOCATION */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>Store Profile &amp; Contact Details (Mandatory)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bio Link Handle (tapshop.co/@handle)
              </label>
              <div className="flex items-center">
                <span className="px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono text-[11px]">
                  tapshop.co/@
                </span>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-r-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business Phone Number (Mandatory) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="+254 712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp DM Number (Mandatory) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="254712345678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Physical Shop / Hub Location (Visible to Customers)
              </label>
              <input
                type="text"
                placeholder="e.g. Veteran House, 2nd Floor Room 214, Moi Avenue, Nairobi CBD"
                value={physicalLocation}
                onChange={(e) => setPhysicalLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                placeholder="e.g. Mon - Sat: 9:00 AM - 6:30 PM (Closed Sundays)"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* CBD SHOP PICKUP STATIONS MANAGER (Solving Kenyan Shop Partner Flow) */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Partner Shop Pickup Stations ({pickupStations.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddStation(!showAddStation)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-semibold flex items-center gap-1 hover:bg-emerald-100"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Station</span>
            </button>
          </div>

          <p className="text-slate-500 text-[11px]">
            Partner with CBD shops in Nairobi (e.g. Veteran House, Star Mall, Jamia Mall) where customers collect items with their unique Order ID &amp; 4-digit PIN.
          </p>

          {/* Add Station Subform */}
          {showAddStation && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-900">Add New Pickup Station</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Station Name (e.g. Imenti House Hub)"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="px-3 py-1.5 bg-white border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Building (e.g. Imenti House)"
                  value={newStationBuilding}
                  onChange={(e) => setNewStationBuilding(e.target.value)}
                  className="px-3 py-1.5 bg-white border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Floor / Room (e.g. 1st Floor Shop 12)"
                  value={newStationFloor}
                  onChange={(e) => setNewStationFloor(e.target.value)}
                  className="px-3 py-1.5 bg-white border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Pickup Fee (0 if Free)"
                  value={newStationFee}
                  onChange={(e) => setNewStationFee(e.target.value)}
                  className="px-3 py-1.5 bg-white border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStation(false)}
                  className="px-3 py-1 bg-white border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddStation}
                  className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded-lg"
                >
                  Save Station
                </button>
              </div>
            </div>
          )}

          {/* Existing Stations List */}
          <div className="space-y-2">
            {pickupStations.map((station) => (
              <div
                key={station.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-slate-900">{station.name}</div>
                  <div className="text-[11px] text-slate-600">
                    {station.building}, {station.floorRoom} · Fee: KES {station.fee}
                  </div>
                  <div className="text-[10px] text-slate-400">Hours: {station.operatingHours}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteStation(station.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                  title="Remove station"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* DELIVERY ZONES MANAGER (Nairobi vs Upcountry) */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Delivery Zones &amp; Pricing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Within Nairobi Delivery</span>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Rider Fee (KES)</label>
                <input
                  type="number"
                  value={nairobiFee}
                  onChange={(e) => setNairobiFee(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Estimated Arrival</label>
                <input
                  type="text"
                  value={nairobiEstimatedTime}
                  onChange={(e) => setNairobiEstimatedTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Outside Nairobi (Upcountry Parcel)</span>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Parcel Courier Fee (KES)</label>
                <input
                  type="number"
                  value={upcountryFee}
                  onChange={(e) => setUpcountryFee(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Estimated Arrival</label>
                <input
                  type="text"
                  value={upcountryEstimatedTime}
                  onChange={(e) => setUpcountryEstimatedTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border rounded-lg"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Free Delivery Threshold (KES)
              </label>
              <input
                type="number"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Orders with subtotal above this amount get free Nairobi delivery.
              </p>
            </div>
          </div>
        </div>

        {/* KENYAN M-PESA PAYMENT SETUP (Till, Paybill, Send Money, Pochi La Biashara) */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Kenyan Payment Method Options</span>
            </h3>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Pick Your Preferred Method
            </span>
          </div>

          <p className="text-slate-500 text-[11px]">
            Choose how your customers will pay when placing orders via your social media link in bio.
          </p>

          {/* 4 Method Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Till Number */}
            <button
              type="button"
              onClick={() => {
                setMpesaType('till');
                if (!instructions || instructions.includes('Pochi') || instructions.includes('Paybill') || instructions.includes('Send Money')) {
                  setInstructions('Go to M-Pesa > Lipa na M-Pesa > Buy Goods and Services > Enter Till: ' + (mpesaNumber || '[Till]') + ' > Enter Amount > Enter PIN > Attach M-Pesa message below.');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                mpesaType === 'till'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  mpesaType === 'till' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Tag className="w-4 h-4" />
                </div>
                {mpesaType === 'till' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Buy Goods</div>
                <div className="text-[10px] text-slate-500">Till Number</div>
              </div>
            </button>

            {/* 2. Paybill */}
            <button
              type="button"
              onClick={() => {
                setMpesaType('paybill');
                if (!instructions || instructions.includes('Buy Goods') || instructions.includes('Pochi') || instructions.includes('Send Money')) {
                  setInstructions('Go to M-Pesa > Lipa na M-Pesa > Paybill > Enter Business No: ' + (mpesaNumber || '[Paybill]') + ' > Account No: ' + (paybillAccount || '[Account/Name]') + ' > Enter Amount > Enter PIN > Attach M-Pesa message below.');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                mpesaType === 'paybill'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  mpesaType === 'paybill' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Building className="w-4 h-4" />
                </div>
                {mpesaType === 'paybill' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Paybill</div>
                <div className="text-[10px] text-slate-500">Business &amp; Account No</div>
              </div>
            </button>

            {/* 3. Send Money */}
            <button
              type="button"
              onClick={() => {
                setMpesaType('send_money');
                if (!instructions || instructions.includes('Buy Goods') || instructions.includes('Paybill') || instructions.includes('Pochi')) {
                  setInstructions('Go to M-Pesa > Send Money > Enter Phone: ' + (mpesaNumber || '[Phone]') + ' > Enter Amount > Confirm name: ' + (accountName || '[Name]') + ' > Enter PIN > Attach M-Pesa message below.');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                mpesaType === 'send_money'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  mpesaType === 'send_money' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                {mpesaType === 'send_money' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Send Money</div>
                <div className="text-[10px] text-slate-500">Direct Phone Transfer</div>
              </div>
            </button>

            {/* 4. Pochi La Biashara */}
            <button
              type="button"
              onClick={() => {
                setMpesaType('pochi');
                if (!instructions || instructions.includes('Buy Goods') || instructions.includes('Paybill') || instructions.includes('Send Money')) {
                  setInstructions('Go to M-Pesa > Lipa na M-Pesa > Pochi La Biashara > Enter Phone: ' + (mpesaNumber || '[Phone]') + ' > Enter Amount > Confirm ' + (accountName || '[Business Name]') + ' > Enter PIN > Attach M-Pesa message below.');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                mpesaType === 'pochi'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  mpesaType === 'pochi' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                {mpesaType === 'pochi' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Pochi La Biashara</div>
                <div className="text-[10px] text-slate-500">Merchant Phone Wallet</div>
              </div>
            </button>
          </div>

          {/* Dynamic Configuration Form based on Selected Method */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
            {mpesaType === 'till' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Till Number (5 to 7 digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 849201"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Customers pay via Lipa na M-Pesa &gt; Buy Goods and Services
                  </p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store / Till Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOLARIUM VAULT"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl uppercase font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Name that appears on customer's phone to verify recipient
                  </p>
                </div>
              </div>
            )}

            {mpesaType === 'paybill' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Paybill Business No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 247247 or 522522"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Number / Reference <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOLARIUM or YOUR_NAME"
                    value={paybillAccount}
                    onChange={(e) => setPaybillAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Business / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solarium Eyewear Ltd"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
            )}

            {mpesaType === 'send_money' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    M-Pesa Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0712 345 678"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Customers pay via M-Pesa &gt; Send Money
                  </p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Recipient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victor Mutwiri (as on M-Pesa)"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Name that appears during confirmation to prevent sending to wrong person
                  </p>
                </div>
              </div>
            )}

            {mpesaType === 'pochi' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pochi Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0712 345 678"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Customers pay via Lipa na M-Pesa &gt; Pochi La Biashara
                  </p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Business / Owner Name on Pochi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solarium Shades Pochi"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Confirmation name shown before PIN prompt
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Customer Payment Instructions Note (Auto-generated or customize)
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
