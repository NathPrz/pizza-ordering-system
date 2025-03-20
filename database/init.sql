CREATE DATABASE IF NOT EXISTS pizza_db;
USE pizza_db;

CREATE TABLE IF NOT EXISTS pizzas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  order_date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  pizza_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (pizza_id) REFERENCES pizzas(id)
);

-- Insertion de données de test
INSERT INTO pizzas (name, description, price, image_url) VALUES
('Margherita', 'Tomate, mozzarella, basilic', 9.99, '/images/margherita.jpg'),
('Pepperoni', 'Tomate, mozzarella, pepperoni', 11.99, '/images/pepperoni.jpg'),
('Quatre Fromages', 'Tomate, mozzarella, gorgonzola, parmesan, chèvre', 12.99, '/images/quatre-fromages.jpg'),
('Végétarienne', 'Tomate, mozzarella, poivrons, oignons, champignons, olives', 10.99, '/images/vegetarienne.jpg'),
('Hawaïenne', 'Tomate, mozzarella, jambon, ananas', 11.99, '/images/hawaienne.jpg');