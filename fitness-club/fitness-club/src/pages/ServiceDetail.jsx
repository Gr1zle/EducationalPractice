// src/pages/ServiceDetail.jsx — КРАСИВЫЕ ОТЗЫВЫ + ЗВЁЗДЫ + АДАПТИВ
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

function ServiceDetail() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, revRes] = await Promise.all([
          fetch(`http://localhost:5000/api/services`),
          fetch(`http://localhost:5000/api/services/${id}/reviews`)
        ])
        const services = await servRes.json()
        const current = services.find(s => s.service_id === Number(id))
        setService(current)
        setReviews(await revRes.json())
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    fetchData()
  }, [id])

  const submitReview = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const rating = formData.get('rating')
    const comment = formData.get('comment')

    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, comment })
      })
      if (res.ok) {
        const newRev = await res.json()
        setReviews([newRev, ...reviews])
        e.target.reset()
      }
    } catch (err) { 
      alert('Ошибка отправки отзыва') 
    }
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ))
  }

  if (loading) return <div className="container">Загрузка...</div>
  if (!service) return <div className="container">Услуга не найдена</div>

  return (
    <div className="container">
      <Link to="/catalog" className="back-link">← Назад в каталог</Link>
      
      <div className="service-detail-wrapper">
        <div className="service-main">
          <h1>{service.name}</h1>
          
          <div className="service-image-big">
            <img 
              src={service.image_url || '/api/placeholder.jpg'} 
              alt={service.name}
            />
          </div>

          <div className="service-details">
            <div className="price-tag">{service.price} ₽</div>
            <p><strong>Длительность:</strong> {service.duration_minutes} минут</p>
            <p className="service-description">{service.description}</p>

            {user?.role === 'user' && (
              <button onClick={() => addToCart(service)} className="btn-add-big">
                Добавить в корзину
              </button>
            )}
          </div>
        </div>

        {/* ОТЗЫВЫ — КРАСИВО! */}
        <div className="reviews-container">
          <h2>Отзывы покупателей ({reviews.length})</h2>

          {/* Форма отзыва */}
          {user?.role === 'user' && (
            <div className="review-form-card">
              <h3>Оставить отзыв</h3>
              <form onSubmit={submitReview}>
                <div className="rating-select">
                  <label>Ваша оценка:</label>
                  <select name="rating" required>
                    <option value="">Выберите...</option>
                    {[5,4,3,2,1].map(n => (
                      <option key={n} value={n}>{n} звёзд</option>
                    ))}
                  </select>
                </div>
                <textarea 
                  name="comment" 
                  placeholder="Поделитесь впечатлениями от тренировки..." 
                  rows="4" 
                  required 
                />
                <button type="submit" className="btn-submit-review">
                  Отправить отзыв
                </button>
              </form>
            </div>
          )}

          {/* Список отзывов */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">Пока нет отзывов. Станьте первым!</p>
            ) : (
              reviews.map(r => (
                <div key={r.review_id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      <strong>{r.full_name || 'Аноним'}</strong>
                      <div className="review-stars">
                        {renderStars(r.rating)}
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(r.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="review-text">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail