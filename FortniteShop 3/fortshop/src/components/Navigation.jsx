import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';

function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const user = JSON.parse(localStorage.getItem('user') || 'null');



  return (
    <nav className="navigation">
      <div className="nav-brand">
        <NavLink to="/" className="brand-link">
          🎮 Fortnite Store
        </NavLink>
      </div>
      
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Главная
        </NavLink>
        
        <NavLink to="/catalog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Каталог
        </NavLink>

        <NavLink to="/cart" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          🛒 Корзина ({totalItems})
        </NavLink>

      </div>

      <div className="nav-controls">
          {user ? (<><span>Привет, {user.email}</span>
          {user.role === 2 && <NavLink to="/admin">Админ</NavLink>}
          <button onClick={() => { localStorage.clear(); window.location.reload(); }}>Выйти</button></>) : (
          <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}end>
            Войти
          </NavLink>)}
        <button 
          onClick={toggleTheme}
          className="theme-toggle"
        >
          {theme === 'light' ? '🌙 Тёмная' : '☀️ Светлая'}
        </button>
      </div>
    </nav>
  );
}

export default Navigation;