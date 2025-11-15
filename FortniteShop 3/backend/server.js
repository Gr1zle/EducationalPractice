const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const helmet = require('helmet');

dotenv.config();
const SERVER = express();
const SERVER_PORT = process.env.PORT || 3001;

SERVER.use(cors());
SERVER.use(express.json());
SERVER.use(morgan('dev'));
SERVER.use(helmet());

const DB_CONNECTION = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
});

SERVER.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await DB_CONNECTION.query('SELECT * FROM Users WHERE email = $1', [email]);
        const userData = userResult.rows[0];
        
        if (!userData || !await bcrypt.compare(password, userData.password_hash)) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const authToken = jwt.sign(
            { userId: userData.user_id, role: userData.role_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token: authToken, 
            user: { 
                id: userData.user_id, 
                email: userData.email, 
                role: userData.role_id, 
                discount: userData.discount_coupon 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

SERVER.get('/api/categories', async (req, res) => {
    try {
        const categoriesResult = await DB_CONNECTION.query('SELECT * FROM Categories ORDER BY name');
        res.json(categoriesResult.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

SERVER.get('/api/services', async (req, res) => {
    try {
        const { category } = req.query;
        let servicesQuery = `
            SELECT 
                s.service_id, 
                s.name, 
                s.description, 
                s.duration_minutes, 
                s.price, 
                s.category_id, 
                s.is_discounted, 
                s.discount_percent,
                s.image,
                c.name as category_name 
            FROM Services s 
            JOIN Categories c ON s.category_id = c.category_id
        `;
        const queryParams = [];
        
        if (category) {
            servicesQuery += ' WHERE s.category_id = $1';
            queryParams.push(category);
        }
        
        servicesQuery += ' ORDER BY s.name';
        const servicesResult = await DB_CONNECTION.query(servicesQuery, queryParams);
        res.json(servicesResult.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

SERVER.get('/api/cart', async (req, res) => {
    const authHeader = req.headers.authorization?.split(' ')[1];
    try {
        const verifiedToken = jwt.verify(authHeader, process.env.JWT_SECRET);
        const userResult = await DB_CONNECTION.query(
            'SELECT cart_data FROM Users WHERE user_id = $1', 
            [verifiedToken.userId]
        );
        const userCart = userResult.rows[0];
        res.json(userCart.cart_data || { items: [], purchases: [] });
    } catch (error) {
        res.status(401).json({ error: 'Не авторизован' });
    }
});

SERVER.post('/api/cart', async (req, res) => {
    const authHeader = req.headers.authorization?.split(' ')[1];
    try {
        const verifiedToken = jwt.verify(authHeader, process.env.JWT_SECRET);
        const { items, purchases } = req.body;
        
        await DB_CONNECTION.query(
            'UPDATE Users SET cart_data = $1 WHERE user_id = $2', 
            [JSON.stringify({ items, purchases }), verifiedToken.userId]
        );
        
        res.json({ message: 'Корзина сохранена' });
    } catch (error) {
        res.status(401).json({ error: 'Не авторизован' });
    }
});

SERVER.get('/api/admin/users', async (req, res) => {
    const authHeader = req.headers.authorization?.split(' ')[1];
    try {
        const verifiedToken = jwt.verify(authHeader, process.env.JWT_SECRET);
        if (verifiedToken.role !== 2) return res.status(403).json({ error: 'Доступ запрещен' });
        
        const usersResult = await DB_CONNECTION.query('SELECT user_id, email, discount_coupon FROM Users');
        res.json(usersResult.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

SERVER.post('/api/admin/categories', async (req, res) => {
    const authHeader = req.headers.authorization?.split(' ')[1];
    try {
        const verifiedToken = jwt.verify(authHeader, process.env.JWT_SECRET);
        if (verifiedToken.role !== 2) return res.status(403).json({ error: 'Доступ запрещен' });
        
        const { name } = req.body;
        const categoryResult = await DB_CONNECTION.query(
            'INSERT INTO Categories (name) VALUES ($1) RETURNING *', 
            [name]
        );
        
        res.json(categoryResult.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

SERVER.put('/api/admin/services/:id/discount', async (req, res) => {
    const authHeader = req.headers.authorization?.split(' ')[1];
    try {
        const verifiedToken = jwt.verify(authHeader, process.env.JWT_SECRET);
        if (verifiedToken.role !== 2) return res.status(403).json({ error: 'Доступ запрещен' });
        
        const { id } = req.params;
        const { is_discounted, discount_percent } = req.body;
        
        const serviceResult = await DB_CONNECTION.query(
            'UPDATE Services SET is_discounted = $1, discount_percent = $2 WHERE service_id = $3 RETURNING *',
            [is_discounted, discount_percent, id]
        );
        
        res.json(serviceResult.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

SERVER.put('/api/admin/users/:id/discount', async (req, res) => {
    const authHeader = req.headers.authorization?.split(' ')[1];
    try {
        const verifiedToken = jwt.verify(authHeader, process.env.JWT_SECRET);
        if (verifiedToken.role !== 2) return res.status(403).json({ error: 'Доступ запрещен' });
        
        const { id } = req.params;
        const { coupon } = req.body;
        
        await DB_CONNECTION.query(
            'UPDATE Users SET discount_coupon = $1 WHERE user_id = $2', 
            [coupon, id]
        );
        
        res.json({ message: 'Купон назначен' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

SERVER.listen(SERVER_PORT, () => {
    console.log(` API запущен: http://localhost:${SERVER_PORT}`);
});