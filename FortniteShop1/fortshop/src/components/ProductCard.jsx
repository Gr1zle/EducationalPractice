import { useState, useEffect } from 'react';

function ProductCard({ name, price, image }) {
  const storageKey = `fortnite_${name.replace(/\s+/g, '_')}_count`;

  const [count, setCount] = useState(() => {
    const savedCount = localStorage.getItem(storageKey);
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, count.toString());
  }, [count, storageKey]);

  const handleAddToCart = () => {
    setCount(count + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div className="product-card">
      <div className="image-container">
        <img src={image} alt={name} className="product-image" />
      </div>
      <h3 className="product-name">{name}</h3>
      <p className="product-price">{price} V-баксов</p>
      <div className="cart-controls">
        <button 
          onClick={handleAddToCart} 
          className="add-button"
        >
          Добавить в корзину
        </button>
        <div className="counter-section">
          <span className="counter">Количество: {count}</span>
          {count > 0 && (
            <button 
              onClick={handleReset}
              className="reset-button"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;