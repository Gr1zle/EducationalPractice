// src/components/ServiceCard.jsx — КРАСИВЫЕ КАРТОЧКИ С ФИКСИРОВАННЫМ РАЗМЕРОМ
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

function ServiceCard({ service }) {
  const { addToCart } = useCart()

  return (
    <div className="service-card">
      <Link to={`/service/${service.service_id}`} className="service-link">
        <div className="service-image-wrapper">
          {service.image_url ? (
            <img 
              src={service.image_url} 
              alt={service.name}
              className="service-image"
            />
          ) : (
            <div className="service-image-placeholder">
              <span>Фото скоро появится</span>
            </div>
          )}
        </div>

        <div className="service-info">
          <h3>{service.name}</h3>
          <p className="service-category">{service.category_name}</p>
          <p className="service-duration">{service.duration_minutes} минут</p>
          <div className="service-price">{service.price} ₽</div>
        </div>
      </Link>

      <div className="service-actions">
        <button onClick={() => addToCart(service)} className="btn-add-cart">
          В корзину
        </button>
        <Link to={`/service/${service.service_id}`} className="btn-details">
          Подробнее
        </Link>
      </div>
    </div>
  )
}

export default ServiceCard