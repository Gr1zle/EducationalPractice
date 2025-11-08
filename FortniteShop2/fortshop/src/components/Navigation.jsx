import { NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';

function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const { getTotalItems } = useCart();

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <NavLink to="/" className="brand-link">
          🎮 Fortnite Store
        </NavLink>
      </div>
      
      <div className="nav-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          Главная
        </NavLink>
        
        <NavLink 
          to="/catalog" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          Каталог
        </NavLink>
        
        <NavLink 
          to="/cart" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          🛒 Корзина 
          {getTotalItems() > 0 && (
            <span className="cart-count">{getTotalItems()}</span>
          )}
        </NavLink>
      </div>

      <div className="nav-controls">
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