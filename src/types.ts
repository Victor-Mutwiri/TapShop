export type MpesaPaymentType = 'till' | 'paybill' | 'send_money' | 'pochi';

export interface PaymentMethods {
  mpesaType: MpesaPaymentType;
  number: string;
  accountName: string;
  paybillAccount?: string; // Specific account number for Paybill
  instructions: string;
}

export interface PickupStation {
  id: string;
  name: string;
  building: string;
  floorRoom: string;
  city: string;
  fee: number; // usually 0 or small fee like 50 KES
  operatingHours: string;
  directions?: string;
}

export interface DeliveryZones {
  nairobiFee: number;
  nairobiEstimatedTime: string;
  upcountryFee: number;
  upcountryEstimatedTime: string;
  freeDeliveryThreshold: number;
  notes: string;
}

export interface Store {
  id: string;
  handle: string; // e.g. "solarium" -> tapshop.co/@solarium
  name: string;
  slogan: string;
  description: string;
  logo: string;
  bannerImage: string;
  currency: string; // "KES"
  phone: string; // Mandatory seller phone
  whatsapp: string; // Mandatory WhatsApp number
  physicalLocation?: string; // Physical shop or main hub
  operatingHours?: string; // e.g. "Mon - Sat: 9:00 AM - 6:30 PM"
  instagram: string;
  tiktok?: string;
  facebook?: string;
  paymentMethods: PaymentMethods;
  pickupStations: PickupStation[];
  deliveryZones: DeliveryZones;
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  inventoryCount: number;
  images: string[];
  isAvailable: boolean;
  featured?: boolean;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type FulfillmentType = 'pickup' | 'delivery';
export type DeliveryZoneType = 'nairobi' | 'upcountry' | 'custom';

export interface CustomerDetails {
  fullName: string;
  phone: string; // Required for M-Pesa & delivery
  isPhoneOnWhatsApp?: boolean;
  email: string;
  whatsapp?: string;
  fulfillmentType: FulfillmentType;
  // If pickup:
  pickupStationId?: string;
  pickupStationName?: string;
  // If delivery:
  deliveryZone?: DeliveryZoneType;
  deliveryAddress?: string;
  city?: string;
  notes?: string;
}

export interface PaymentProof {
  method: 'mpesa';
  transactionCode: string;
  rawMessage?: string;
  senderPhone?: string;
  amountReported?: number;
  receiptImageUrl?: string;
  submittedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'ready_for_pickup' | 'completed' | 'declined';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // e.g. "TAP-9402"
  storeId: string;
  createdAt: string;
  status: OrderStatus;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  fulfillmentFee: number;
  totalAmount: number;
  collectionPin?: string; // 4-digit security PIN for shop pickup
  paymentProof: PaymentProof;
  declineReason?: string;
  trackingNotes?: string;
}

export interface StoreNotification {
  id: string;
  orderId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'new_order' | 'order_confirmed' | 'order_declined' | 'low_stock' | 'pickup_ready';
}

export type AppViewMode = 'storefront' | 'seller_dashboard' | 'landing';
