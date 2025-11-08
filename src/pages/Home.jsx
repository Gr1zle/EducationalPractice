import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Home() {
  const { totalPurchases, totalSpent } = useCart();

  const stats = [
    {
      icon: '🎮',
      title: 'Товаров в каталоге',
      value: '6',
      description: 'уникальных предметов'
    },
    {
      icon: '💰',
      title: 'Сумма покупок',
      value: `${totalSpent}`,
      description: 'V-баксов потрачено'
    },
    {
      icon: '📦',
      title: 'Совершено сделок',
      value: `${totalPurchases}`,
      description: 'успешных заказов'
    }
  ];

  const features = [
    {
      icon: '⚡',
      title: 'Мгновенная доставка',
      description: 'Предметы появляются в вашем аккаунте сразу после покупки'
    },
    {
      icon: '🛡️',
      title: 'Безопасные платежи',
      description: 'Все транзакции защищены и безопасны'
    },
    {
      icon: '🎁',
      title: 'Ежедневные обновления',
      description: 'Новые предметы добавляются каждый день'
    }
  ];

  return (
    <div className="main-content">
      <div className="home-content">
        {/* Заголовок */}
        <header className="page-header">
          <h1>Магазин предметов Fortnite</h1>
          <p>Лучшие скины и эмоции для вашего игрового опыта!</p>
        </header>

        {/* Статистика */}
        <section className="section">
          <h2 className="section-title">Наша статистика</h2>
          <div className="cards-grid">
            {stats.map((stat, index) => (
              <div key={index} className="card">
                <div className="card-icon">{stat.icon}</div>
                <h3 className="card-title">{stat.title}</h3>
                <div className="card-value">{stat.value}</div>
                <p className="card-description">{stat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Преимущества */}
        <section className="section">
          <h2 className="section-title">Почему выбирают нас</h2>
          <div className="cards-grid">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="card-icon">{feature.icon}</div>
                <h3 className="card-title">{feature.title}</h3>
                <p className="card-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Кнопка перехода */}
        <div className="section">
          <Link to="/catalog" className="cta-button">
            Перейти к каталогу
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;