import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

function cartReducer(state, action) {
  console.log('Cart Action:', action.type, action.payload);
  
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        const newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log('Updated items:', newItems);
        return { ...state, items: newItems };
      }
      const newItems = [...state.items, { ...action.payload, quantity: 1 }];
      console.log('New items:', newItems);
      return { ...state, items: newItems };

    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      console.log('After remove:', filteredItems);
      return { ...state, items: filteredItems };

    case 'CLEAR_CART':
      console.log('Clearing cart');
      return { ...state, items: [] };

    case 'SET_CART':
      console.log('Setting cart:', action.payload);
      return { ...state, items: action.payload };

    case 'ADD_PURCHASE_STATS':
      return {
        ...state,
        totalPurchases: state.totalPurchases + 1,
        totalSpent: state.totalSpent + action.payload
      };
    case 'UPDATE_QUANTITY':
        return {
        ...state,
        items: state.items.map(item =>
            item.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
    )
  };
    

    default:
      return state;
  }
}

// Функция для загрузки состояния из localStorage
const loadState = () => {
  try {
    const savedCart = localStorage.getItem('fortnite-cart');
    const savedStats = localStorage.getItem('fortnite-stats');
    
    console.log('Loading from localStorage - cart:', savedCart);
    console.log('Loading from localStorage - stats:', savedStats);
    
    return {
      items: savedCart ? JSON.parse(savedCart) : [],
      totalPurchases: savedStats ? JSON.parse(savedStats).totalPurchases : 0,
      totalSpent: savedStats ? JSON.parse(savedStats).totalSpent : 0
    };
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return {
      items: [],
      totalPurchases: 0,
      totalSpent: 0
    };
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, loadState());

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    console.log('Saving cart to localStorage:', state.items);
    localStorage.setItem('fortnite-cart', JSON.stringify(state.items));
  }, [state.items]);

  // Сохранение статистики в localStorage при изменении
  useEffect(() => {
    const stats = {
      totalPurchases: state.totalPurchases,
      totalSpent: state.totalSpent
    };
    console.log('Saving stats to localStorage:', stats);
    localStorage.setItem('fortnite-stats', JSON.stringify(stats));
  }, [state.totalPurchases, state.totalSpent]);

  const addToCart = (product) => {
    console.log('Adding to cart:', product);
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    console.log('Removing from cart:', productId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const addPurchaseStats = (amount) => {
    console.log('Adding purchase stats:', amount);
    dispatch({ type: 'ADD_PURCHASE_STATS', payload: amount });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } else {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    }
    };

  const value = {
    cart: state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addPurchaseStats,
    getTotalPrice,
    getTotalItems,
    totalPurchases: state.totalPurchases,
    totalSpent: state.totalSpent
  };

  console.log('Cart Context Value:', value);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;

}
