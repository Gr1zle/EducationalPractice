import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartManager({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [cartData, setCartData] = useState({ items: [], purchases: [] });

    // Загрузка корзины при смене пользователя
    useEffect(() => {
        const loadCart = async () => {
            if (!user) {
                setCartData({ items: [], purchases: [] });
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3001/api/cart', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCartData(data);
                }
            } catch (err) {
                console.error('Ошибка загрузки корзины:', err);
            }
        };
        loadCart();
    }, [user]);

    // Сохранение корзины на сервер
    const saveCartToServer = useCallback(async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:3001/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cartData)
            });
        } catch (err) {
            console.error('Ошибка сохранения корзины:', err);
        }
    }, [user, cartData]);

    useEffect(() => {
        const timeout = setTimeout(saveCartToServer, 1000);
        return () => clearTimeout(timeout);
    }, [saveCartToServer]);

    const addItem = useCallback((product) => {
        setCartData(prev => {
            const existing = prev.items.find(i => i.id === product.id);
            if (existing) {
                return {
                    ...prev,
                    items: prev.items.map(i =>
                        i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                    )
                };
            }
            return { ...prev, items: [...prev.items, { ...product, quantity: 1 }] };
        });
    }, []);

    const removeItem = useCallback((id) => {
        setCartData(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== id)
        }));
    }, []);

    const updateQuantity = useCallback((id, qty) => {
        if (qty <= 0) {
            removeItem(id);
            return;
        }
        setCartData(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === id ? { ...i, quantity: qty } : i)
        }));
    }, [removeItem]);

    const clearCart = useCallback(() => {
        setCartData(prev => ({ ...prev, items: [] }));
    }, []);

    const processOrder = useCallback(async () => {
        if (cartData.items.length === 0) return false;
        const order = {
            id: `order-${Date.now()}`,
            date: new Date().toISOString(),
            items: [...cartData.items],
            total: cartData.items.reduce((s, i) => s + i.price * i.quantity, 0)
        };
        setCartData(prev => ({
            items: [],
            purchases: [...prev.purchases, order]
        }));
        return true;
    }, [cartData.items]);

    const totalCost = cartData.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalItems = cartData.items.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider value={{
            items: cartData.items,
            purchases: cartData.purchases,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            processOrder,
            totalCost,
            totalItems,
            user,
            setUser,

            // ПРАВИЛЬНО — используем cartData.items
            incrementQuantity: (id) => {
                const item = cartData.items.find(i => i.id === id);
                updateQuantity(id, (item?.quantity || 0) + 1);
            },
            decrementQuantity: (id) => {
                const item = cartData.items.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    updateQuantity(id, item.quantity - 1);
                }
            }
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
    throw new Error('useCart must be used within CartManager');
    }

    const totalPurchases = context.purchases.length;
    const totalSpent = context.purchases.reduce((sum, p) => sum + (p.total || 0), 0);

    return {
        ...context,
        totalPurchases,
        totalSpent
    };
}