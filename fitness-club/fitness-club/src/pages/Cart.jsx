// src/pages/Cart.jsx — ЧИСТАЯ КОРЗИНА БЕЗ ДАТЫ
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Cart() {
  const { cart, removeFromCart, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState(user?.address || '')
  const [date, setDate] = useState('')

  const handleOrder = async () => {
    if (!address || !date) return alert('Заполните адрес и дату')

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          delivery_address: address,
          delivery_date: date,
          items: cart.map(i => ({
            service_id: i.service_id,
            quantity: i.quantity,
            price: i.price
          }))
        })
      })

      if (res.ok) {
        clearCart()
        alert('Заказ успешно оформлен!')
        navigate('/profile')
      } else {
        const err = await res.json()
        alert(err.error || 'Ошибка оформления')
      }
    } catch (err) {
      alert('Ошибка сервера')
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Корзина пуста</h2>
        <p>Добавьте услуги из каталога</p>
        <a href="/catalog" className="btn">Перейти в каталог</a>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Корзина</h1>
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.service_id} className="cart-item">
            <div>
              <h3>{item.name}</h3>
              <p>{item.price} ₽ × {item.quantity}</p>
            </div>
            <button onClick={() => removeFromCart(item.service_id)} className="btn-delete">
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <strong>Итого: {totalPrice} ₽</strong>
      </div>

<div className="order-form">
  <h2>Оформление заказа</h2>
  
  <label>
    Адрес доставки подарочного сертификата
    <input 
      placeholder="г. Москва, ул. Пушкина, д. 10, кв. 5" 
      value={address} 
      onChange={e => setAddress(e.target.value)} 
      required 
    />
  </label>

  <label>
    Желаемая дата и время тренировки
    <input 
      type="datetime-local" 
      value={date} 
      onChange={e => setDate(e.target.value)} 
    />
    <small style={{color: '#666', fontSize: '0.9rem'}}>
    </small>
  </label>

  <button onClick={handleOrder} className="btn-order">
    Оформить заказ на {totalPrice} ₽
  </button>
</div>
    </div>
  )
}

export default Cart