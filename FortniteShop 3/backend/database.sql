CREATE TABLE Roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES Roles(role_id),
    discount_coupon VARCHAR(50) DEFAULT NULL
);

CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id INT REFERENCES Categories(category_id),
    is_discounted BOOLEAN DEFAULT FALSE,
    discount_percent DECIMAL(5,2) DEFAULT 0
);

CREATE TABLE Appointments (
    appointment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    service_id INT REFERENCES Services(service_id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Payments (
    payment_id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES Appointments(appointment_id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'completed',
    paid_at TIMESTAMP DEFAULT NOW()
);

-- Заполнение начальными данными
INSERT INTO Roles (name) VALUES ('user'), ('admin');

INSERT INTO Categories (name) VALUES 
('Скины'), ('Эмоции'), ('Кирки'), ('Наборы'), ('Музыка');

INSERT INTO Services (name, description, duration_minutes, price, category_id, is_discounted, discount_percent) VALUES
('Боевой пропуск', 'Доступ к 100+ уровням наград', 0, 1000.00, 4, FALSE, 0),
('Темный рыцарь', 'Легендарный скин', 0, 2000.00, 1, TRUE, 25),
('Кайло минти', 'Редкая кирка', 0, 1200.00, 3, FALSE, 0),
('Признание поражения', 'Эмоция', 0, 500.00, 2, TRUE, 30),
('Айконик набор', 'Полный набор скина', 0, 10000.00, 4, TRUE, 20),
('d4vd трек', 'Музыка в лобби', 0, 500.00, 5, FALSE, 0);

INSERT INTO Users (email, password_hash, role_id, discount_coupon) VALUES
('admin@fortnite.com', '$2b$10$...', 2, NULL),
('user@fortnite.com', '$2b$10$...', 1, 'WELCOME10');