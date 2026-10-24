# TapShop — Instant Social Media Bio Stores & Order Management

TapShop transforms chaotic social media DM sales into a seamless bio-link storefront and automated order tracking system. Customers can browse products from Instagram/TikTok, add to cart, pay via M-Pesa with multi-modal proof of transaction, and submit orders without creating an account—while sellers manage inventory, verify payments, and fulfill orders in a dedicated merchant portal.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product decisions were aligned during Phase 1 clarification:
> - **Platform Brand**: Confirmed as **TapShop — Instant social media bio stores**.
> - **Proof-of-Payment Verification**: Confirmed support for **all three methods** seamlessly in the checkout flow:
>   1. Pasting the full M-Pesa SMS confirmation text (with auto-extraction of Transaction ID, Sender, and Amount).
>   2. Entering the M-Pesa Transaction Code directly.
>   3. Uploading a payment screenshot image with an interactive preview card.
> - **Demo & Testing Environment**: The platform will come preloaded with an authentic demo store (**Solarium Eyewear / Sunglasses Boutique**) with live inventory, allowing immediate end-to-end testing of customer bio-checkout and seller order verification, alongside a store switcher and merchant onboarding flow.

---

## 1. Overview & Core Concept

Social media merchants on Instagram, TikTok, and Facebook lose up to 60% of potential buyers due to DM friction: manual price inquiries, checking stock availability across chats, manual payment reconciliation, and typing delivery details back and forth. 

**TapShop** solves this with a two-sided platform:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TAPSHOP                                   │
├──────────────────────────┬──────────────────────────┬──────────────────┤
│    1. LANDING PAGE       │    2. CUSTOMER STORE     │ 3. SELLER PORTAL │
│  • Brand Pitch           │  • Link-in-Bio Storefront│  • Real-time Hub │
│  • Interactive Demo      │  • Frictionless Cart     │  • Order Confirm │
│  • Seller Onboarding     │  • M-Pesa Proof Checkout │  • Inventory Mgr │
│  • Bio Link Simulator    │  • Live Order Tracking   │  • Store Builder │
└──────────────────────────┴──────────────────────────┴──────────────────┘
```

- **For Buyers (Zero Friction)**: Click link in Instagram bio $\to$ instant mobile storefront $\to$ add sunglasses/items to cart $\to$ pay via displayed M-Pesa Till/Paybill $\to$ attach M-Pesa code/message/screenshot $\to$ submit order with immediate confirmation code. **No buyer login or account creation required.**
- **For Sellers (Automated Control)**: Dedicated dashboard to customize storefront branding (logo, bio, contact, delivery terms), manage catalog products with live stock controls, receive instant pending order notifications, review M-Pesa payment proof, and confirm or decline orders with automated customer status tracking.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow A: Customer Bio Checkout (Mobile-Optimized)
1. **Bio-Link Entry**: Customer taps `tapshop.co/@solarium` from Instagram or TikTok bio and lands on the branded mobile storefront.
2. **Catalog Exploration**: Clean hero banner, shop bio, category filter pills/tabs, search, and responsive product cards with clear pricing and stock badges.
3. **Cart & Purchase**: Tapping "Add to Cart" or "Buy Now" triggers an ergonomic bottom slide-out cart drawer with item counter, quantity adjusters, and subtotal.
4. **Seamless Proof Checkout**:
   - Step 1: Customer details (Full Name, Phone Number, Email, Delivery Town/Address, Drop-off notes).
   - Step 2: Payment guide displaying merchant's exact M-Pesa details (e.g. *Buy Goods Till: 849201* or *Paybill: 522522 / Acc: SOLARIUM*).
   - Step 3: Transaction proof submission (paste M-Pesa SMS, enter code, and/or upload screenshot receipt).
   - Step 4: One-click "Place Order" with validation.
5. **Order Confirmation & Tracking**: Instant visual success screen with order number (`#TAP-8291`), pending verification notice, order breakdown, and a 1-tap "Share to WhatsApp / DM" button.

#### Flow B: Seller Inventory & Order Management
1. **Merchant Overview**: Live statistics (Today's Revenue, Pending Verifications, Active Orders, Out-of-Stock warnings).
2. **Order Fulfillment Hub**:
   - Filter by status tabs: `Pending` | `Confirmed` | `Shipped` | `Completed` | `Declined`.
   - Inspection Drawer: Click order to see customer details, delivery location, item list, and side-by-side M-Pesa message text & uploaded screenshot receipt.
   - Actions: One-click **Confirm & Accept** or **Decline** (with preset reasons: *Payment not received*, *Out of stock*, *Invalid code*).
3. **Product & Inventory Manager**:
   - Add new product with image, title, price, compare-at price, stock quantity, and category.
   - Quick stock toggle (In Stock / Low Stock / Out of Stock) and delete/edit controls.
4. **Storefront Customizer**:
   - Update Store Name, handle, slogan, logo, banner, WhatsApp number, M-Pesa payment type, and delivery fees.
   - Live Instagram Bio Link preview showing how the store looks when shared on social profiles.

#### Flow C: Platform Marketing & Onboarding
1. **Landing Page**: Explains the social commerce dilemma (DM fatigue vs. instant bio checkout).
2. **Store Switcher & Quick Demo**: Test drive as customer or seller with 1 click.
3. **Merchant Registration**: Fast signup modal to create a custom storefront in under 60 seconds.

---

### Visual Identity & Theme

- **Aesthetic Direction**: Contemporary African & Global Social Commerce. High-contrast, clean typography, editorial retail clarity with warm terracotta and deep slate, avoiding generic corporate templates.
- **Typography**: 
  - Brand & Display: `Plus Jakarta Sans` / `Outfit` (bold, modern geometric).
  - Body: `DM Sans` / `Plus Jakarta Sans` for high legibility on mobile screens.
  - Figures & Codes: `font-mono tabular-nums` for M-Pesa codes, order IDs, and currency amounts (`KES`).
- **Color Palette**:
  - Dominant Canvas: Light neutral crisp white `#FFFFFF` / Slate tint `#F8FAFC`.
  - Structural Surfaces: Pure white cards with hairline borders (`#E2E8F0`), charcoal headers `#0F172A`.
  - Primary Accent: M-Pesa inspired high-trust Forest Emerald (`#059669` / `#10B981`) and Deep Indigo (`#4F46E5`).
  - Urgent/Alert: Warm Amber `#D97706` for Pending, Rose `#E11D48` for Declined.
- **Mobile Ergonomics**:
  - Touch targets $\ge 44\text{px}$ across all buttons and inputs.
  - Sticky bottom CTA bar on mobile checkout (`max 15%` viewport height).
  - Smooth bottom sheet drawers for cart and order filters.
  - Zero-pill metadata discipline: unboxed metadata separated by clean `·` characters.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Customer Authentication** | **No Account Required (Guest Checkout)** | Crucial for social media conversion rates; forced sign-in causes 70%+ dropoff in mobile bio traffic. | Compulsory buyer registration (rejected: adds massive friction). |
| **M-Pesa Verification Engine** | **Smart Client-Side SMS Parser + Code Input + Screenshot Upload** | Parses typical Safaricom M-Pesa SMS text (`QA12XY34 Confirmed. Ksh 2,400 paid to...`) to pre-fill fields, while giving sellers immediate visual receipt proof. | Requiring official Safaricom Daraja API credentials per merchant (rejected: high onboarding barrier for small social sellers). |
| **Data Persistence Architecture** | **Reactive LocalStorage + In-Memory State Layer with Seed Data** | Provides instant responsiveness, demo persistence across tabs/reloads, seamless multi-store creation, and zero backend cold starts. | Ephemeral session-only state (rejected: data lost on refresh). |
| **Store Routing & Bio Links** | **Dynamic Multi-Store State (`/@handle`) with Direct URL Hashing & Switching** | Allows sellers to copy their exact link (e.g. `tapshop.co/#/store/solarium`), while enabling users to toggle between buyer view, seller admin, and marketing landing page with zero routing friction. | Hardcoded single store (rejected: user requested multi-business platform capabilities). |

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                         TAPSHOP APPLICATION                            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
┌──────────────┐          ┌─────────────────┐         ┌─────────────────┐
│ LANDING PAGE │          │ CUSTOMER STORE  │         │ SELLER DASHBOARD│
│ • Pitch & CTA│          │ • Storefront PDP│         │ • Stats Summary │
│ • Demo Launch│          │ • Cart Drawer   │         │ • Order Tracker │
│ • Bio Preview│          │ • M-Pesa Sheet  │         │ • Inventory Mgr │
│ • New Store  │          │ • Order Success │         │ • Store Settings│
└──────────────┘          └────────┬────────┘         └────────┬────────┘
                                   │                           │
                                   ▼                           ▼
                         ┌───────────────────┐
                         │   SHARED STATE    │
                         │ • Active Store    │
                         │ • Products & Stock│
                         │ • Orders & Proofs │
                         │ • M-Pesa Parser   │
                         │ • Notification Bus│
                         └───────────────────┘
```

### Data Model & Core Entities

```typescript
// Core Store Profile
interface Store {
  id: string;
  handle: string; // e.g. "solarium-eyewear"
  name: string;
  slogan: string;
  description: string;
  logo: string;
  coverImage?: string;
  currency: string; // "KES"
  phone: string;
  instagram: string;
  tiktok?: string;
  paymentMethods: {
    mpesaType: 'till' | 'paybill' | 'send_money';
    number: string;
    accountName: string;
    instructions: string;
  };
  deliveryInfo: {
    standardFee: number;
    estimatedTime: string;
    notes: string;
  };
}

// Product Entity
interface Product {
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
}

// Order Entity with Proof of Payment
interface Order {
  id: string; // e.g. "TAP-8921"
  storeId: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'declined';
  customer: {
    fullName: string;
    phone: string;
    email: string;
    deliveryAddress: string;
    city: string;
    notes?: string;
  };
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  paymentProof: {
    method: 'mpesa';
    transactionCode: string;
    rawMessage?: string;
    senderPhone?: string;
    receiptImageUrl?: string;
    submittedAt: string;
  };
  declineReason?: string;
}
```

---

## 5. Execution Breakdown (Phased Implementation)

### Phase 1: Foundation & Data Architecture
- Initialize domain types, mock database seeded with rich eyewear boutique items, M-Pesa payment configurations, and sample pending/confirmed orders.
- Implement storage adapters with reactive event broadcasting (orders updated in customer store trigger real-time notification alerts in seller portal).
- Build the M-Pesa regex text parser capable of extracting Safaricom confirmation codes (`e.g., RK92JH12KL`), amounts, and sender names from pasted SMS alerts.

### Phase 2: Customer Bio Storefront & Mobile Checkout Experience
- Implement the high-converting link-in-bio storefront (`/@handle`):
  - Branded profile header (avatar, slogan, Instagram/WhatsApp contact pills, delivery notice).
  - Category selector, search bar, and high-fidelity responsive product catalog.
  - Interactive product detail modal with image zoom, description, and "Add to Cart".
- Implement slide-over cart drawer with live subtotal and quantity controls.
- Implement the streamlined 3-step proof-of-payment checkout modal:
  - Customer contact & delivery address form with validation.
  - Dynamic M-Pesa payment card displaying Till Number / Paybill instructions.
  - Triple-mode proof submission (paste M-Pesa SMS, enter code, or upload receipt screenshot).
- Build order submission flow with confirmation screen, tracking number, and WhatsApp direct confirmation link.

### Phase 3: Seller Management Portal & Order Fulfillment
- Implement the Seller Dashboard with key metrics (Total Sales, Pending Verification Queue, Active Orders, Low Stock Alerts).
- Build the Order Management view with tabbed status filtering (`Pending`, `Confirmed`, `Shipped`, `Declined`).
- Build the Order Verification Drawer: inspect customer details, order summary, and verify M-Pesa proof (SMS text highlight + receipt image viewer).
- Action buttons: "Confirm & Mark Paid", "Mark as Shipped", and "Decline Order" with feedback reasons.
- Build the Inventory Management hub: Add, Edit, Delete products, toggle stock availability, and adjust stock counts.
- Build the Storefront Customizer: edit logo, slogan, M-Pesa payment details, and preview how the link appears in an Instagram bio.

### Phase 4: Platform Landing Page & Demo Switcher
- Build the TapShop public landing page introducing the platform to social media vendors.
- Interactive Store Switcher allowing evaluators to switch seamlessly between:
  1. *Customer View* (testing the bio storefront and submitting an order).
  2. *Seller View* (receiving and confirming orders).
  3. *Landing View* (learning and creating a new store).
- High-fidelity product assets generated specifically for the eyewear boutique demo.

---

## 6. Verification & Quality Plan

- **Compilation & Linting**: Zero TypeScript errors, strict null checks, and clean Tailwind styling.
- **Checkout Integrity Testing**: Verify required fields validation, M-Pesa code formatting, image receipt uploads, and calculation of delivery totals.
- **Responsive Audit**: Test across viewport widths from $375\text{px}$ (iPhone mobile view) to $1440\text{px}$ desktop.
- **State Synchronicity**: Ensure newly submitted orders immediately populate the seller's Pending queue and trigger alert indicators.
