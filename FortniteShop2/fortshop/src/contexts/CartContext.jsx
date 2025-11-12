import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartManager({ children }) {
  const [cartData, setCartData] = useState(() => CartStorage.load());

  useEffect(() => {
    CartStorage.save(cartData);
  }, [cartData]);

  const addItem = useCallback((product) => {
    setCartData(prev => {
      const existingItem = prev.items.find(item => item.id === product.id);
      
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { ...product, quantity: 1 }]
        };
      }
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setCartData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== productId)
    }));
  }, []);

  const updateItemQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setCartData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setCartData(prev => ({ ...prev, items: [] }));
  }, []);

  const processOrder = useCallback(() => {
    if (cartData.items.length === 0) return false;

    const order = {
      id: `order-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cartData.items],
      total: cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    setCartData(prev => ({
      items: [],
      purchases: [...prev.purchases, order]
    }));

    return true;
  }, [cartData.items]);

  const incrementQuantity = useCallback((productId) => {
    setCartData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    }));
  }, []);

  const decrementQuantity = useCallback((productId) => {
    setCartData(prev => {
      const item = prev.items.find(i => i.id === productId);
      if (!item) return prev;

      if (item.quantity <= 1) {
        return {
          ...prev,
          items: prev.items.filter(i => i.id !== productId)
        };
      }

      return {
        ...prev,
        items: prev.items.map(i =>
          i.id === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      };
    });
  }, []);

  const totalCost = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPurchases = cartData.purchases.length;
  const totalSpent = cartData.purchases.reduce((sum, purchase) => sum + purchase.total, 0);

  const cartInfo = {

    items: cartData.items,
    purchases: cartData.purchases,

    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    processOrder,

    incrementQuantity,
    decrementQuantity,

    totalCost,
    totalItems,
    totalPurchases,
    totalSpent,
    
    isEmpty: cartData.items.length === 0,
    itemCount: cartData.items.length
  };

  return (
    <CartContext.Provider value={cartInfo}>
      {children}
    </CartContext.Provider>
  );
}

const CartStorage = {
  save: (data) => {
    try {
      localStorage.setItem('fortnite-cart-v2', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  },
  
  load: () => {
    try {
      const saved = localStorage.getItem('fortnite-cart-v2');
      return saved ? JSON.parse(saved) : { items: [], purchases: [] };
    } catch (error) {
      console.error('Failed to load cart:', error);
      return { items: [], purchases: [] };
    }
  }
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartManager');
  }
  return context;
}