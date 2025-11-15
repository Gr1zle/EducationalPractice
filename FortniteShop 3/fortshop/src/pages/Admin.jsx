import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {

    const [servicesList, setServicesList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const navigateHook = useNavigate();
    const authToken = localStorage.getItem('token');

    useEffect(() => {
        if (!authToken) navigateHook('/login');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role !== 2) navigateHook('/');
        
        loadAdminData();
    }, [navigateHook, authToken]);

    const loadAdminData = async () => {
        try {
            const [servicesResponse, usersResponse] = await Promise.all([
                fetch('http://localhost:3001/api/services', { 
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                fetch('http://localhost:3001/api/admin/users', { 
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);
            
            const servicesData = await servicesResponse.json();
            const usersData = await usersResponse.json();
            
            setServicesList(servicesData);
            setUsersList(usersData);
        } catch (error) {
            alert('Ошибка загрузки данных');
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        
        await fetch('http://localhost:3001/api/admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: newCategoryName })
        });
        
        setNewCategoryName('');
        loadAdminData();
    };

    const handleDiscountUpdate = async (serviceId, isDiscounted, discountPercent) => {
        await fetch(`http://localhost:3001/api/admin/services/${serviceId}/discount`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                is_discounted: isDiscounted, 
                discount_percent: discountPercent 
            })
        });
        loadAdminData();
    };

    const handleCouponAssignment = async (userId, couponCode) => {
        await fetch(`http://localhost:3001/api/admin/users/${userId}/discount`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ coupon: couponCode })
        });
        loadAdminData();
    };

    return (
        <div className="main-content">
            <h1>Админ-панель</h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Добавить категорию</h2>
                <input 
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)} 
                    placeholder="Название категории" 
                />
                <button onClick={handleAddCategory} className="cta-button">
                    Добавить
                </button>
            </div>

            <div className="card">
                <h2>Управление скидками</h2>
                {servicesList.map(service => (
                    <div key={service.service_id} className="service-item">
                        <strong> {service.name}</strong>
                        <label className="discount-toggle">
                            <input
                                type="checkbox"
                                checked={service.is_discounted}
                                onChange={e => handleDiscountUpdate(
                                    service.service_id, 
                                    e.target.checked, 
                                    service.discount_percent || 0
                                )}
                            /> Скидка
                        </label>
                        {service.is_discounted && (
                            <span className="discount-controls">
                                <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    value={service.discount_percent || 0}
                                    onChange={e => handleDiscountUpdate(
                                        service.service_id, 
                                        true, 
                                        e.target.value
                                    )}
                                    className="discount-input"
                                /> %
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2>Назначение купонов</h2>
                {usersList.map(user => (
                    <div key={user.user_id} className="user-coupon-item">
                        {user.email} → 
                        <input
                            placeholder="Код купона"
                            defaultValue={user.discount_coupon || ''}
                            onBlur={(e) => {
                                const couponValue = e.target.value.trim();
                                if (couponValue) {
                                    handleCouponAssignment(user.user_id, couponValue);
                                }
                            }}
                            className="coupon-input"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPanel;