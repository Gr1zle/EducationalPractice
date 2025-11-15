// test-users.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
});

async function createUsers() {
    const adminHash = await bcrypt.hash('123', 10);
    const userHash = await bcrypt.hash('123', 10);

    await pool.query(
        'INSERT INTO Users (email, password_hash, role_id, discount_coupon) VALUES ($1, $2, $3, $4)',
        ['admin@fortnite.com', adminHash, 2, null]
    );
    await pool.query(
        'INSERT INTO Users (email, password_hash, role_id, discount_coupon) VALUES ($1, $2, $3, $4)',
        ['user@fortnite.com', userHash, 1, 'WELCOME10']
    );

    console.log('Пользователи созданы!');
    process.exit();
}

createUsers();