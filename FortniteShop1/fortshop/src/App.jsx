import './App.css';
import ProductCard from './components/ProductCard';

function App() {
  const fortniteItems = [
    {
      id: 1,
      name: "Боевой пропуск",
      price: 1000,
      image: "https://avatars.mds.yandex.net/i?id=2a0000019a44ea2b00b9a7a33eab4bc54222-1392821-fast-images&n=13"
    },
    {
      id: 2,
      name: "Набор 'Темный рыцарь'",
      price: 2000,
      image: "https://i.pinimg.com/originals/4a/0c/c4/4a0cc4f060459a4686e4fa2f1d6408d7.jpg"
    },
    {
      id: 3,
      name: "Кирка 'Кайло минти'",
      price: 1200,
      image: "https://avatars.mds.yandex.net/i?id=ec790aebd9ced1ed6ff695a2d0ebd975_l-7751470-images-thumbs&n=13"
    },
    {
      id: 4,
      name: "Эмоция 'Признание поражения'",
      price: 10000,
      image: "https://www.dexerto.com/cdn-image/wp-content/uploads/2024/04/23/Fortnite-Take-The-L-emote-header-img.jpg?width=1200&quality=75&format=auto"
    },
    {
      id: 5,
      name: "Набор'Айконик'",
      price: 10000,
      image: "https://i.ytimg.com/vi/smGqh64KvX8/maxresdefault.jpg"
    },
    {
      id: 6,
      name: "Джем-трек 'd4vd'",
      price: 500,
      image: "https://i.scdn.co/image/ab67616d0000b273dbad5abeb49c5018ed65354b"
    }
  ];

  return (
    <div className="App">
      <header className="app-header">
        <h1>Магазин предметов Fortnite</h1>
        <p>Лучшие скины и эмоции для вашего игрового опыта!</p>
      </header>
      
      <main className="main-content">
        <div className="products-container">
          {fortniteItems.map(item => (
            <ProductCard
              key={item.id}
              name={item.name}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>© 2024 Магазин Fortnite. Все права защищены.</p>
      </footer>
    </div>
  );
}

export default App;