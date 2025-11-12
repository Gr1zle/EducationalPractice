import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

function ProductCard({ product }) {
  const { 
    addItem, 
    items, 
    incrementQuantity, 
    decrementQuantity, 
    removeItem 
  } = useCart();
  
  const [localCount, setLocalCount] = useState(0);

  useEffect(() => {
    const cartItem = items.find(item => item.id === product.id);
    setLocalCount(cartItem ? cartItem.quantity : 0);
  }, [items, product.id]);

  const handleAddToCart = () => {
    addItem(product);
  };

  const handleIncrement = () => {
    incrementQuantity(product.id);
  };

  const handleDecrement = () => {
    decrementQuantity(product.id);
  };

  const handleRemove = () => {
    removeItem(product.id);
  };

  return (
    <div className="product-card">
      <div className="image-container">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{product.price} V-баксов</p>
      
      <div className="cart-controls">
        <button onClick={handleAddToCart} className="add-button">
          Добавить в корзину
        </button>
        
        {localCount > 0 && (
          <div className="counter-section">
            <span className="counter">Количество: {localCount}</span>
            <div className="counter-buttons">
              <button onClick={handleDecrement} className="counter-btn">-</button>
              <button onClick={handleIncrement} className="counter-btn">+</button>
              <button onClick={handleRemove} className="reset-button">
                Удалить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;