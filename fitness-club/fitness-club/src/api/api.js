// src/api/api.js
const API = 'http://localhost:5000/api'

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

// Каталог и категории
export const getCategories = () => fetch(`${API}/categories`).then(r => r.json())
export const getServices = (category = '') => {
    const url = category 
    ? `${API}/services?category=${category}` 
    : `${API}/services`
  return fetch(url).then(r => r.json())
}
// Отдельная услуга (для ServiceDetail)
export const getService = async (id) => {
  const res = await fetch(`${API}/services/${id}`)
  return res.json()
}

// Отзывы
export const getReviews = (id) => fetch(`${API}/services/${id}/reviews`).then(r => r.json())

// Профиль
export const getProfile = () => fetch(`${API}/profile`, { headers: headers() }).then(r => r.json())
export const updateProfile = (data) => fetch(`${API}/profile`, {
  method: 'PUT',
  headers: headers(),
  body: JSON.stringify(data)
}).then(r => r.json())

export const changePassword = (oldPassword, newPassword) => fetch(`${API}/profile/password`, {
  method: 'PUT',
  headers: headers(),
  body: JSON.stringify({ oldPassword, newPassword })
}).then(r => r.json())

export const getOrders = () => fetch(`${API}/orders`, { headers: headers() }).then(r => r.json())