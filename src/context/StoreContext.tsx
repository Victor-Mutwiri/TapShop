import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Store,
  Product,
  Order,
  CartItem,
  StoreNotification,
  AppViewMode,
  OrderStatus,
  CustomerDetails,
  PaymentProof,
  PickupStation,
  DeliveryZones,
} from '../types';
import {
  INITIAL_STORE,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';

interface StoreContextType {
  activeView: AppViewMode;
  setActiveView: (view: AppViewMode) => void;
  store: Store;
  updateStore: (updated: Partial<Store>) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'storeId'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStock: (id: string) => void;
  orders: Order[];
  placeOrder: (customer: CustomerDetails, proof: PaymentProof) => Order;
  confirmOrder: (orderId: string, notes?: string) => void;
  markReadyForPickup: (orderId: string, notes?: string) => void;
  declineOrder: (orderId: string, reason: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNotes?: string) => void;
  notifications: StoreNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activePlacedOrder: Order | null;
  setActivePlacedOrder: (order: Order | null) => void;
  activeCustomerTab: 'catalog' | 'track';
  setActiveCustomerTab: (tab: 'catalog' | 'track') => void;
  resetToDemo: () => void;
  toast: { message: string; type?: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Resolve initial view from URL hash, pathname, or localStorage to prevent refresh reset
  const getInitialView = (): AppViewMode => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      if (hash.includes('seller') || pathname.includes('seller')) return 'seller_dashboard';
      if (hash.includes('landing') || pathname.includes('landing')) return 'landing';
      if (hash.includes('store') || pathname.includes('store')) return 'storefront';
      try {
        const saved = localStorage.getItem('tapshop_active_view');
        if (saved === 'seller_dashboard' || saved === 'storefront' || saved === 'landing') {
          return saved as AppViewMode;
        }
      } catch {}
    }
    return 'storefront';
  };

  const getInitialCustomerTab = (): 'catalog' | 'track' => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('track')) return 'track';
    }
    return 'catalog';
  };

  const [activeView, setActiveView] = useState<AppViewMode>(getInitialView);
  const [activeCustomerTab, setActiveCustomerTab] = useState<'catalog' | 'track'>(getInitialCustomerTab);

  // Sync route and hash on view change to ensure refresh stays on current page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tapshop_active_view', activeView);
      const targetHash =
        activeView === 'seller_dashboard'
          ? '#/seller'
          : activeView === 'landing'
          ? '#/landing'
          : activeCustomerTab === 'track'
          ? '#/track'
          : '#/store';
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [activeView, activeCustomerTab]);

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('seller')) {
        setActiveView('seller_dashboard');
      } else if (hash.includes('landing')) {
        setActiveView('landing');
      } else if (hash.includes('track')) {
        setActiveView('storefront');
        setActiveCustomerTab('track');
      } else if (hash.includes('store')) {
        setActiveView('storefront');
        setActiveCustomerTab('catalog');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [store, setStore] = useState<Store>(() => {
    try {
      const saved = localStorage.getItem('tapshop_store_v2');
      return saved ? JSON.parse(saved) : INITIAL_STORE;
    } catch {
      return INITIAL_STORE;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('tapshop_products_v2');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('tapshop_orders_v2');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [notifications, setNotifications] = useState<StoreNotification[]>(() => {
    try {
      const saved = localStorage.getItem('tapshop_notifications_v2');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tapshop_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activePlacedOrder, setActivePlacedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tapshop_store_v2', JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    localStorage.setItem('tapshop_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tapshop_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('tapshop_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('tapshop_cart_v2', JSON.stringify(cart));
  }, [cart]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const updateStore = (updated: Partial<Store>) => {
    setStore((prev) => ({ ...prev, ...updated }));
    showToast('Store profile updated');
  };

  const addProduct = (newProd: Omit<Product, 'id' | 'storeId'>) => {
    const id = `prod_${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      storeId: store.id,
    };
    setProducts((prev) => [product, ...prev]);
    showToast(`Added "${product.title}" to catalog`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('Product updated');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    showToast('Product removed from catalog', 'info');
  };

  const toggleProductStock = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextAvailable = !item.isAvailable;
          return {
            ...item,
            isAvailable: nextAvailable,
            inventoryCount: nextAvailable && item.inventoryCount === 0 ? 5 : item.inventoryCount,
          };
        }
        return item;
      })
    );
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    if (!product.isAvailable || product.inventoryCount <= 0) {
      showToast('Item is currently out of stock', 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.inventoryCount);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.inventoryCount) }];
    });

    showToast(`Added ${product.title} to bag`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const max = item.product.inventoryCount;
          return { ...item, quantity: Math.min(quantity, max) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Order placement with Pickup or Delivery fee calculation
  const placeOrder = (customer: CustomerDetails, proof: PaymentProof): Order => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `TAP-${orderNum}`;

    // Determine fulfillment fee
    let fulfillmentFee = 0;
    if (customer.fulfillmentType === 'pickup') {
      const station = store.pickupStations.find((s) => s.id === customer.pickupStationId);
      fulfillmentFee = station ? station.fee : 0;
    } else {
      // Delivery
      if (customer.deliveryZone === 'upcountry') {
        fulfillmentFee = store.deliveryZones.upcountryFee;
      } else {
        // Nairobi
        fulfillmentFee =
          cartSubtotal >= store.deliveryZones.freeDeliveryThreshold
            ? 0
            : store.deliveryZones.nairobiFee;
      }
    }

    const totalAmount = cartSubtotal + fulfillmentFee;

    const newOrder: Order = {
      id: orderId,
      storeId: store.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      customer,
      items: cart.map((c) => ({
        productId: c.product.id,
        title: c.product.title,
        price: c.product.price,
        quantity: c.quantity,
        image: c.product.images[0] || '',
      })),
      subtotal: cartSubtotal,
      fulfillmentFee,
      totalAmount,
      paymentProof: proof,
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((c) => c.product.id === p.id);
        if (cartMatch) {
          const newCount = Math.max(0, p.inventoryCount - cartMatch.quantity);
          return {
            ...p,
            inventoryCount: newCount,
            isAvailable: newCount > 0,
          };
        }
        return p;
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // Notification
    const isPickup = customer.fulfillmentType === 'pickup';
    const notifMessage = isPickup
      ? `${customer.fullName} placed pickup order ${orderId} (${customer.pickupStationName}). Verify M-Pesa proof.`
      : `${customer.fullName} placed delivery order ${orderId} (${customer.city}). Total KES ${totalAmount.toLocaleString()}. Verify M-Pesa proof.`;

    const newNotif: StoreNotification = {
      id: `notif_${Date.now()}`,
      orderId: newOrder.id,
      title: isPickup ? 'New Shop Pickup Order' : 'New Delivery Order',
      message: notifMessage,
      timestamp: 'Just now',
      read: false,
      type: 'new_order',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Finish checkout
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActivePlacedOrder(newOrder);

    showToast(`Order ${orderId} placed! Seller alerted.`, 'success');

    return newOrder;
  };

  const confirmOrder = (orderId: string, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'confirmed',
              trackingNotes: notes || 'Payment verified. Order is being processed.',
            }
          : ord
      )
    );

    const notif: StoreNotification = {
      id: `notif_${Date.now()}`,
      orderId,
      title: 'Order Confirmed',
      message: `Order ${orderId} payment verified by seller.`,
      timestamp: 'Just now',
      read: false,
      type: 'order_confirmed',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Order ${orderId} verified and confirmed!`);
  };

  const markReadyForPickup = (orderId: string, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'ready_for_pickup',
              trackingNotes: notes || 'Package delivered to pickup shop counter. Ready for customer collection with Order ID & PIN.',
            }
          : ord
      )
    );

    const notif: StoreNotification = {
      id: `notif_${Date.now()}`,
      orderId,
      title: 'Ready for Shop Pickup',
      message: `Order ${orderId} is now at pickup point counter.`,
      timestamp: 'Just now',
      read: false,
      type: 'pickup_ready',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Order ${orderId} marked ready for pickup!`);
  };

  const declineOrder = (orderId: string, reason: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (target && target.status === 'pending') {
      setProducts((prev) =>
        prev.map((p) => {
          const item = target.items.find((i) => i.productId === p.id);
          if (item) {
            return {
              ...p,
              inventoryCount: p.inventoryCount + item.quantity,
              isAvailable: true,
            };
          }
          return p;
        })
      );
    }

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'declined',
              declineReason: reason,
            }
          : ord
      )
    );

    const notif: StoreNotification = {
      id: `notif_${Date.now()}`,
      orderId,
      title: 'Order Declined',
      message: `Order ${orderId} was declined: ${reason}`,
      timestamp: 'Just now',
      read: false,
      type: 'order_declined',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Order ${orderId} declined`, 'error');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNotes?: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status,
              ...(trackingNotes ? { trackingNotes } : {}),
            }
          : ord
      )
    );
    showToast(`Order ${orderId} status updated to ${status}`);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDemo = () => {
    setStore(INITIAL_STORE);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCart([]);
    localStorage.removeItem('tapshop_store_v2');
    localStorage.removeItem('tapshop_products_v2');
    localStorage.removeItem('tapshop_orders_v2');
    localStorage.removeItem('tapshop_notifications_v2');
    localStorage.removeItem('tapshop_cart_v2');
    showToast('Reset data to demo store');
  };

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        store,
        updateStore,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        orders,
        placeOrder,
        confirmOrder,
        markReadyForPickup,
        declineOrder,
        updateOrderStatus,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        setSelectedProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activePlacedOrder,
        setActivePlacedOrder,
        activeCustomerTab,
        setActiveCustomerTab,
        resetToDemo,
        toast,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
