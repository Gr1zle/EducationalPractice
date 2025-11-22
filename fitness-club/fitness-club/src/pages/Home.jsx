// src/pages/Home.jsx — КРАСИВАЯ ГЛАВНАЯ
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

function Home() {
  const { totalPrice } = useCart()

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <h1>Добро пожаловать в FitClub Pro</h1>
        <p>Премиум-фитнес с персональным подходом. Выберите услугу мечты и начните путь к идеальному телу уже сегодня!</p>
        <Link to="/catalog" className="btn hero-btn">
          Перейти в каталог услуг
        </Link>
      </section>

      {/* Features */}
      <section className="grid">
        <div className="feature-card">
          <h3>Персональные тренеры</h3>
          <p>Индивидуальные программы под ваши цели</p>
        </div>
        <div className="feature-card">
          <h3>Современное оборудование</h3>
          <p>Только премиум-тренажёры последнего поколения</p>
        </div>
        <div className="feature-card">
          <h3>Гибкий график</h3>
          <p>Записывайтесь на удобное время 24/7</p>
        </div>
      </section>

      {/* Призыв к действию */}
      {totalPrice > 0 && (
        <div style={{ textAlign: 'center', margin: '60px 0' }}>
          <p style={{ fontSize: '1.4rem', marginBottom: '20px' }}>
            У вас в корзине услуги на сумму <strong>{totalPrice} ₽</strong>
          </p>
          <Link to="/cart" className="btn" style={{ fontSize: '1.2rem', padding: '16px 40px' }}>
            Оформить заказ
          </Link>
        </div>
      )}
    </div>
  )
}

export default Home