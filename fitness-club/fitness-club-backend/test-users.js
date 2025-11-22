// test-users.js — создаёт пользователей с правильным хешем
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const DB_CONNECTION = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fitness_club',
  password: 'postgres', 
  port: 5433,
});

async function createTestUsers() {
  try {
    // Очищаем старых пользователей (если были)
    await DB_CONNECTION.query('DELETE FROM users WHERE email LIKE $1', ['%@fit.ru']);

    // Создаём админа
    const adminHash = await bcrypt.hash('admin123', 10);
    await DB_CONNECTION.query(
      `INSERT INTO users (full_name, email, password_hash, role_id) 
       VALUES ('Администратор', 'admin@fit.ru', $1, 2)`,
      [adminHash]
    );

    // Создаём обычного пользователя
    const userHash = await bcrypt.hash('user123', 10);
    await DB_CONNECTION.query(
      `INSERT INTO users (full_name, email, password_hash, role_id) 
       VALUES ('Иван Иванов', 'user@fit.ru', $1, 1)`,
      [userHash]
    );

    console.log('Пользователи успешно созданы!');
    console.log('Админ: admin@fit.ru / admin123');
    console.log('Пользователь: user@fit.ru / user123');
  } catch (err) {
    console.error('Ошибка:', err.message);
  } finally {
    DB_CONNECTION.end();
  }
}

createTestUsers();