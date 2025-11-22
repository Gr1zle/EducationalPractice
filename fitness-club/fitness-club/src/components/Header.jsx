// src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

function Header() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <h2>FitClub Pro</h2>
        </Link>

        <nav className="nav">
          <Link to="/">Главная</Link>

          {/* Показываем каталог и корзину ТОЛЬКО обычным пользователям */}
          {user && user.role === 'user' && (
            <>
              <Link to="/catalog">Каталог</Link>
              <Link to="/cart" className="cart-link">
                Корзина {totalItems > 0 && <span className="badge">{totalItems}</span>}
              </Link>
            </>
          )}

          {/* Админу показываем только админку */}
          {user && user.role === 'admin' && (
            <Link to="/admin">Админка</Link>
          )}

          {user ? (
            <>
              <Link to="/profile">Профиль</Link>
              <button onClick={() => { logout(); navigate('/') }} className="btn-logout">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-login">Войти</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header