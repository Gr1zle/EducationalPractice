// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        alert('Регистрация успешна! Войдите')
        navigate('/login')
      } else {
        const data = await res.json()
        setError(data.error || 'Ошибка')
      }
    } catch (err) {
      setError('Ошибка сервера')
    }
  }

  return (
    <div className="container auth-form">
      <h1>Регистрация</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="ФИО" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <input type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength="6" />
        <input placeholder="Телефон" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  )
}

export default Register