// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

require('dotenv').config();

const SERVER = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-2025';

SERVER.use(cors({ origin: 'http://localhost:5173' }));
SERVER.use(express.json());

const DB_CONNECTION = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fitness_club',
  password: 'postgres',           // ← замени на свой пароль от PostgreSQL
  port: 5433,
});


// ==================== АВТОРИЗАЦИЯ ====================
SERVER.post('/api/auth/register', async (req, res) => {
  const { full_name, email, password, phone } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await DB_CONNECTION.query(
      `INSERT INTO users (full_name, email, password_hash, phone) 
       VALUES ($1, $2, $3, $4) 
       RETURNING user_id, full_name, email, phone`,
      [full_name, email, hash, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email уже занят' });
    }
    res.status(500).json({ error: err.message });
  }
});

SERVER.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await DB_CONNECTION.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE email = $1`, [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role_name
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== МИДЛВАРЬ АУТЕНТИФИКАЦИИ ====================
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет доступа' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// Middleware: только админ
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Только для админа' });
  }
  next();
};

// ==================== КАТАЛОГ ====================
SERVER.get('/api/categories', async (req, res) => {
  const { rows } = await DB_CONNECTION.query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

SERVER.get('/api/services', async (req, res) => {
  const { category } = req.query;
  let query = `
    SELECT s.*, c.name as category_name 
    FROM services s 
    JOIN categories c ON s.category_id = c.category_id
  `;
  const params = [];
  if (category) {
    query += ` WHERE s.category_id = $1`;
    params.push(category);
  }
  query += ` ORDER BY s.name`;
  const { rows } = await DB_CONNECTION.query(query, params);
  res.json(rows);
});

// ==================== ОТЗЫВЫ ====================
SERVER.get('/api/services/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { rows } = await DB_CONNECTION.query(
    `SELECT r.*, u.full_name 
     FROM reviews r 
     JOIN users u ON r.user_id = u.user_id 
     WHERE r.service_id = $1 
     ORDER BY r.created_at DESC`,
    [id]
  );
  res.json(rows);
});

SERVER.post('/api/services/:id/reviews', authenticate, async (req, res) => {
  const { rating, comment } = req.body;
  const { id } = req.params;
  const { rows } = await DB_CONNECTION.query(
    'INSERT INTO reviews (service_id, user_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *, (SELECT full_name FROM users WHERE user_id = $2) as full_name',
    [id, req.user.userId, rating, comment]
  );
  res.status(201).json(rows[0]);
});

// ==================== КОРЗИНА ====================
// === КОРЗИНА — ИСПРАВЛЕННЫЕ РОУТЫ ===
SERVER.get('/api/cart', authenticate, async (req, res) => {
  try {
    const { rows } = await DB_CONNECTION.query(
      'SELECT cart_data FROM users WHERE user_id = $1', 
      [req.user.userId]
    );
    const cartData = rows[0]?.cart_data || { items: [] };
    res.json(cartData);
  } catch (err) {
    console.error('Ошибка загрузки корзины:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

SERVER.post('/api/cart', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    await DB_CONNECTION.query(
      'UPDATE users SET cart_data = $1 WHERE user_id = $2',
      [JSON.stringify({ items }), req.user.userId]
    );
    res.json({ message: 'Корзина сохранена' });
  } catch (err) {
    console.error('Ошибка сохранения корзины:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ==================== ОФОРМЛЕНИЕ ЗАКАЗА ====================
SERVER.post('/api/orders', authenticate, async (req, res) => {
  const { delivery_address, delivery_date, items } = req.body;
  const client = await DB_CONNECTION.connect();
  
  try {
    await client.query('BEGIN');

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Исправлено: orderRes вместо order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, delivery_address, delivery_date, total_amount)
       VALUES ($1, $2, $3, $4) 
       RETURNING order_id`,
      [req.user.userId, delivery_address, delivery_date || null, total]
    );

    const orderId = orderRes.rows[0].order_id;  // ← было order.rows — падало!

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, service_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.service_id, item.quantity, item.price]
      );
    }

    // Очищаем корзину
    await client.query(
      'UPDATE users SET cart_data = $1 WHERE user_id = $2',
      [JSON.stringify({ items: [] }), req.user.userId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Заказ успешно оформлен!', orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Ошибка заказа:', err);
    res.status(500).json({ error: 'Не удалось оформить заказ' });
  } finally {
    client.release();
  }
});

// ==================== ЛИЧНЫЙ КАБИНЕТ ====================
SERVER.get('/api/profile', authenticate, async (req, res) => {
  const { rows } = await DB_CONNECTION.query(
    'SELECT user_id, full_name, email, phone, address FROM users WHERE user_id = $1',
    [req.user.userId]
  );
  res.json(rows[0]);
});

SERVER.put('/api/profile', authenticate, async (req, res) => {
  const { full_name, phone, address } = req.body;
  await DB_CONNECTION.query(
    'UPDATE users SET full_name = $1, phone = $2, address = $3 WHERE user_id = $4',
    [full_name, phone, address, req.user.userId]
  );
  res.json({ message: 'Профиль обновлён' });
});

SERVER.put('/api/profile/password', authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { rows } = await DB_CONNECTION.query('SELECT password_hash FROM users WHERE user_id = $1', [req.user.userId]);
  if (!(await bcrypt.compare(oldPassword, rows[0].password_hash))) {
    return res.status(400).json({ error: 'Неверный старый пароль' });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await DB_CONNECTION.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [hash, req.user.userId]);
  res.json({ message: 'Пароль изменён' });
});

SERVER.get('/api/orders', authenticate, async (req, res) => {
  const { rows } = await DB_CONNECTION.query(
    `SELECT o.*, 
       array_agg(json_build_object('name', s.name, 'quantity', oi.quantity, 'price', oi.price_at_purchase)) as items
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN services s ON oi.service_id = s.service_id
     WHERE o.user_id = $1
     GROUP BY o.order_id
     ORDER BY o.order_date DESC`,
    [req.user.userId]
  );
  res.json(rows);
});
// ==================== АДМИНКА — ВСЕ РЕСУРСЫ ====================

// Все заказы для админа
SERVER.get('/api/admin/orders', authenticate, isAdmin, async (req, res) => {
  try {
    const { rows } = await DB_CONNECTION.query(`
      SELECT o.*, u.full_name, u.email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.user_id 
      ORDER BY o.order_date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Все пользователи для админа
SERVER.get('/api/admin/users', authenticate, isAdmin, async (req, res) => {
  try {
    const { rows } = await DB_CONNECTION.query(`
      SELECT u.user_id, u.full_name, u.email, u.phone, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.role_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавление/удаление категорий
SERVER.post('/api/categories', authenticate, isAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await DB_CONNECTION.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удаление услуги
SERVER.delete('/api/services/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await DB_CONNECTION.query('DELETE FROM services WHERE service_id = $1', [id]);
    res.json({ message: 'Услуга удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавление услуги
SERVER.post('/api/services', authenticate, isAdmin, async (req, res) => {
  const { name, price, description, duration_minutes, category_id, image_url } = req.body;
  try {
    const { rows } = await DB_CONNECTION.query(
      `INSERT INTO services (name, price, description, duration_minutes, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, price, description, duration_minutes, category_id, image_url || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ЗАПУСК СЕРВЕРА ====================
SERVER.listen(PORT, () => {
  console.log(`Бэкенд запущен: http://localhost:${PORT}`);
  console.log(`Админ: admin@fit.ru / admin123`);
  console.log(`Пользователь: user@fit.ru / user123`);
});