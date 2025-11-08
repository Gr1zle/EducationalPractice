// src/components/ProductCard.jsx
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  const [localCount, setLocalCount] = useState(0);

  useEffect(() => {
    const cartItem = cart.items.find(item => item.id === product.id);
    setLocalCount(cartItem ? cartItem.quantity : 0);
  }, [cart.items, product.id]);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleIncrement = () => {
    const newCount = localCount + 1;
    setLocalCount(newCount);
    updateQuantity(product.id, newCount);
  };

  const handleDecrement = () => {
    const newCount = localCount - 1;
    if (newCount <= 0) {
      setLocalCount(0);
      removeFromCart(product.id);
    } else {
      setLocalCount(newCount);
      updateQuantity(product.id, newCount);
    }
  };

  const handleReset = () => {
    setLocalCount(0);
    removeFromCart(product.id);
  };

  return (
    <div className="product-card">
      <div className="image-container">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{product.price} V-баксов</p>
      <div className="cart-controls">
        <button 
          onClick={handleAddToCart}
          className="add-button"
        >
          Добавить в корзину
        </button>
        <div className="counter-section">
          <span className="counter">Количество: {localCount}</span>
          {localCount > 0 && (
            <div className="counter-buttons">
              <button 
                onClick={handleDecrement}
                className="counter-btn decrement"
              >
                -
              </button>
              <button 
                onClick={handleIncrement}
                className="counter-btn increment"
              >
                +
              </button>
              <button 
                onClick={handleReset}
                className="reset-button"
              >
                Сбросить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;