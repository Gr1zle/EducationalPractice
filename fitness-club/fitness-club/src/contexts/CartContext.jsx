// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState([])

  // Загружаем корзину при входе
  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart([])
    }
  }, [user])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data.items || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const saveCart = async (newCart) => {
    try {
      const token = localStorage.getItem('token')
      await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: newCart })
      })
    } catch (err) {
      console.error('Ошибка сохранения корзины')
    }
  }

  const addToCart = (service) => {
    setCart(prev => {
      const existing = prev.find(i => i.service_id === service.service_id)
      let newCart
      if (existing) {
        newCart = prev.map(i =>
          i.service_id === service.service_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      } else {
        newCart = [...prev, { ...service, quantity: 1 }]
      }
      saveCart(newCart)
      return newCart
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const newCart = prev.filter(i => i.service_id !== id)
      saveCart(newCart)
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    saveCart([])
  }

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)