import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const { 
    items, 
    removeItem, 
    clearCart, 
    totalCost, 
    processOrder 
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (processOrder()) {
      alert(`Заказ успешно оформлен! Сумма: ${totalCost} V-баксов`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="main-content">
        <header className="page-header">
          <h1>Корзина</h1>
        </header>
        <div className="card" style={{maxWidth: '500px', margin: '0 auto'}}>
          <p>Ваша корзина пуста</p>
          <button 
            onClick={() => navigate('/catalog')}
            className="continue-shopping"
            style={{marginTop: '1rem'}}
          >
            Перейти к покупкам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <header className="page-header">
        <h1>Корзина</h1>
      </header>
      
      <div className="cart-items" style={{width: '100%', maxWidth: '800px', marginBottom: '2rem'}}>
        {items.map(item => (
          <div key={item.id} className="card" style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flexDirection: 'row',
            textAlign: 'left'
          }}>
            <img src={item.image} alt={item.name} style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '10px'
            }} />
            <div style={{flex: 1}}>
              <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.2rem'}}>{item.name}</h3>
              <p style={{margin: '0.25rem 0', color: 'var(--text-gray)'}}>
                {item.price} V-баксов × {item.quantity}
              </p>
              <p style={{fontWeight: 'bold', color: 'var(--primary-orange)', fontSize: '1.1rem', margin: 0}}>
                {item.price * item.quantity} V-баксов
              </p>
            </div>
            <button 
              onClick={() => removeItem(item.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(220, 53, 69, 0.1)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'none';
                e.target.style.transform = 'scale(1)';
              }}
              title="Удалить из корзины"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{width: '100%', maxWidth: '800px', textAlign: 'center'}}>
        <div style={{borderTop: '2px solid var(--primary-orange)', paddingTop: '2rem'}}>
          <h3 style={{fontSize: '1.5rem', color: 'var(--primary-orange)', marginBottom: '1.5rem'}}>
            Итого: {totalCost} V-баксов
          </h3>
          
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button 
              onClick={clearCart}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '150px'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Очистить корзину
            </button>
            <button 
              onClick={handleCheckout}
              className="checkout"
              style={{minWidth: '150px'}}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;