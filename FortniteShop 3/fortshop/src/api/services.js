const API_URL = 'http://localhost:3001/api';

export async function getCategories() {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Ошибка загрузки категорий');
    return await response.json();
}

export async function getServices(categoryId = null) {
    const url = categoryId ? `${API_URL}/services?category=${categoryId}` : `${API_URL}/services`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка загрузки услуг');
    return await response.json();
}

