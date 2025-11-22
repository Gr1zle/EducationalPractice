// src/pages/AdminPanel.jsx — ПОЛНАЯ АДМИНКА (услуги + категории + заказы + пользователи)
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState('services')
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])

  // Формы
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', description: '', duration_minutes: '', category_id: '', image_url: '' })
  const [categoryForm, setCategoryForm] = useState({ name: '' })

  useEffect(() => {
    loadData()
  }, [tab])

  const loadData = async () => {
    try {
      if (tab === 'services') {
        const res = await fetch('http://localhost:5000/api/services')
        setServices(await res.json())
      }
      if (tab === 'categories') {
        const res = await fetch('http://localhost:5000/api/categories')
        setCategories(await res.json())
      }
      if (tab === 'orders') {
        const res = await fetch('http://localhost:5000/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        setOrders(await res.ok ? await res.json() : [])
      }
      if (tab === 'users') {
        const res = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        setUsers(await res.ok ? await res.json() : [])
      }
    } catch (err) { console.error(err) }
  }

  const addService = async (e) => {
    e.preventDefault()
    await fetch('http://localhost:5000/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(serviceForm)
    })
    setServiceForm({ name: '', price: '', description: '', duration_minutes: '', category_id: '', image_url: '' })
    loadData()
  }

  const deleteService = async (id) => {
    if (!confirm('Удалить услугу?')) return
    await fetch(`http://localhost:5000/api/services/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
    loadData()
  }

  const addCategory = async (e) => {
    e.preventDefault()
    await fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(categoryForm)
    })
    setCategoryForm({ name: '' })
    loadData()
  }

  if (user?.role !== 'admin') return <div className="container"><h1>Доступ запрещён</h1></div>

  return (
    <div className="container">
      <h1>Панель администратора</h1>

      <div className="admin-tabs">
        <button onClick={() => setTab('services')} className={tab === 'services' ? 'active' : ''}>Услуги</button>
        <button onClick={() => setTab('categories')} className={tab === 'categories' ? 'active' : ''}>Категории</button>
        <button onClick={() => setTab('orders')} className={tab === 'orders' ? 'active' : ''}>Заказы</button>
        <button onClick={() => setTab('users')} className={tab === 'users' ? 'active' : ''}>Пользователи</button>
      </div>

      {/* УСЛУГИ */}
      {tab === 'services' && (
        <div className="admin-section">
          <h2>Добавить услугу</h2>
          <form onSubmit={addService} className="admin-form">
            <input placeholder="Название" value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} required />
            <input type="number" placeholder="Цена ₽" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} required />
            <input placeholder="Описание" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} required />
            <input type="number" placeholder="Длительность (мин)" value={serviceForm.duration_minutes} onChange={e => setServiceForm({...serviceForm, duration_minutes: e.target.value})} required />
            <select value={serviceForm.category_id} onChange={e => setServiceForm({...serviceForm, category_id: e.target.value})} required>
              <option value="">Выберите категорию</option>
              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </select>
            <input placeholder="URL изображения" value={serviceForm.image_url} onChange={e => setServiceForm({...serviceForm, image_url: e.target.value})} />
            <button type="submit">Добавить</button>
          </form>

          <h2>Все услуги</h2>
          <table className="admin-table">
            <thead><tr><th>Название</th><th>Цена</th><th>Длительность</th><th>Категория</th><th>Действия</th></tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s.service_id}>
                  <td>{s.name}</td>
                  <td>{s.price} ₽</td>
                  <td>{s.duration_minutes} мин</td>
                  <td>{s.category_name}</td>
                  <td><button onClick={() => deleteService(s.service_id)} style={{background: '#e74c3c'}}>Удалить</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* КАТЕГОРИИ */}
      {tab === 'categories' && (
        <div className="admin-section">
          <h2>Добавить категорию</h2>
          <form onSubmit={addCategory} className="admin-form">
            <input placeholder="Название категории" value={categoryForm.name} onChange={e => setCategoryForm({name: e.target.value})} required />
            <button type="submit">Добавить</button>
          </form>

          <h2>Все категории</h2>
          <div className="grid">
            {categories.map(c => (
              <div key={c.category_id} className="feature-card">
                <h3>{c.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ЗАКАЗЫ */}
      {tab === 'orders' && (
        <div className="admin-section">
          <h2>Все заказы</h2>
          <div className="orders-grid">
            {orders.map(o => (
              <div key={o.order_id} className="order-card">
                <div className="order-header">
                  <strong>Заказ №{o.order_id}</strong>
                  <span>{new Date(o.order_date).toLocaleString('ru-RU')}</span>
                </div>
                <p><strong>Клиент:</strong> {o.full_name || 'Неизвестно'}</p>
                <p><strong>Сумма:</strong> {o.total_amount} ₽</p>
                <p><strong>Адрес:</strong> {o.delivery_address}</p>
                <p><strong>Статус:</strong> <span className="status-paid">Оплачен</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ПОЛЬЗОВЫВАТЕЛИ */}
      {tab === 'users' && (
        <div className="admin-section">
          <h2>Все пользователи</h2>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>ФИО</th><th>Email</th><th>Телефон</th><th>Роль</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.full_name || '-'}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.role_name === 'admin' ? 'Админ' : 'Клиент'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminPanel