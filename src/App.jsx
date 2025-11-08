import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="App">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;