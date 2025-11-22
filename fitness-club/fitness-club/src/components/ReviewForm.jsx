// src/components/ReviewForm.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function ReviewForm({ serviceId, onNewReview }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/services/${serviceId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ rating, comment })
    })
    if (res.ok) {
      const review = await res.json()
      onNewReview(review)
      setComment('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Оставить отзыв</h3>
      <select value={rating} onChange={e => setRating(+e.target.value)}>
        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} stars</option>)}
      </select>
      <textarea value={comment} onChange={e => setComment(e.target.value)} required />
      <button type="submit">Отправить</button>
    </form>
  )
}

export default ReviewForm