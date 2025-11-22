// src/pages/Profile.jsx — ИСПРАВЛЕННЫЙ + СТИЛЬНЫЙ
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'  // ← ВОТ ЭТО БЫЛО ПРОПУЩЕНО!

function Profile() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' })

  useEffect(() => {
    if (user) {
      setForm({ 
        full_name: user.full_name || '', 
        phone: user.phone || '', 
        address: user.address || '' 
      })
      if (user.role === 'user') {
        fetch('http://localhost:5000/api/orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(r => r.json())
        .then(setOrders)
        .catch(() => setOrders([]))
      }
    }
  }, [user])

  const saveProfile = async () => {
    await fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    })
    alert('Данные сохранены!')
  }

  if (!user) return <div className="container">Войдите в аккаунт</div>

  return (
    <div className="container">
      <h1>Личный кабинет</h1>

      {/* ДЛЯ ПОЛЬЗОВАТЕЛЯ */}
      {user.role === 'user' && (
        <>
          <div className="profile-section">
            <h2>Личные данные</h2>
            <input placeholder="ФИО" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            <input placeholder="Телефон" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <input placeholder="Адрес доставки по умолчанию" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <button onClick={saveProfile} className="btn">Сохранить изменения</button>
          </div>

          <div className="profile-section">
            <h2>Мои заказы</h2>
            {orders.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666'}}>У вас пока нет заказов</p>
            ) : (
              <div className="orders-grid">
                {orders.map(o => (
                  <div key={o.order_id} className="order-card">
                    <div className="order-header">
                      <strong>Заказ №{o.order_id}</strong>
                      <span>{new Date(o.order_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <p><strong>Сумма:</strong> {o.total_amount} ₽</p>
                    <p><strong>Адрес:</strong> {o.delivery_address}</p>
                    <p><strong>Статус:</strong> <span className="status-paid">Оплачен</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ДЛЯ АДМИНА */}
      {user.role === 'admin' && (
        <div className="profile-section">
          <h2>Администратор</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роль:</strong> Администратор системы</p>
          <Link to="/admin" className="btn" style={{display: 'inline-block', marginTop: '20px'}}>
            Перейти в панель управления
          </Link>
        </div>
      )}
    </div>
  )
}

export default Profile