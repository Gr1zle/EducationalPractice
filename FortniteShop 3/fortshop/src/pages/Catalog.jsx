import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getServices, getCategories } from '../api/services';
import { useCart } from '../contexts/CartContext';

function Catalog() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addItem } = useCart();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [cats, servs] = await Promise.all([getCategories(), getServices()]);
                setCategories(cats);
                setServices(servs);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
        prev.includes(catId)
            ? prev.filter(id => id !== catId)
            : [...prev, catId]
    );
};

    const filteredServices = selectedCategories.length === 0
        ? services
        : services.filter(s => selectedCategories.includes(s.category_id));

    const handleCategoryChange = (catId) => {
        setSelectedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };

    if (loading) return <div className="main-content"><p>Загрузка...</p></div>;
    if (error) return <div className="main-content"><p style={{color: 'red'}}>Ошибка: {error}</p></div>;

    return (
        <div className="main-content">
            <header className="page-header">
                <h1>Каталог услуг</h1>
            </header>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Фильтры слева */}
                <aside className="filter-sidebar">
                    <h3>Категории</h3>
                    {categories.map(cat => (
                        <div key={cat.category_id} className="filter-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.category_id)}
                                    onChange={() => toggleCategory(cat.category_id)}
                                />
                                {cat.name}
                            </label>
                        </div>
                    ))}
                </aside>

                {/* Список услуг */}
                <div className="products-grid" style={{ flex: 1 }}>
                    {filteredServices.map(service => (
                        <ProductCard key={service.service_id} product={{
                            id: service.service_id,
                            name: service.name,
                            price: service.is_discounted
                                ? service.price * (1 - service.discount_percent / 100)
                                : service.price,
                            originalPrice: service.price,
                            discount: service.is_discounted ? service.discount_percent : 0
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Catalog;