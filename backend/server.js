const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://pizza.local',
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'mysql-service',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pizza_db'
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Service de commande de pizzas opérationnel!' });
});

// Récupérer toutes les pizzas
app.get('/pizzas', async (req, res) => {
  try {
    console.log('Tentative de connexion à la base de données...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connexion réussie, exécution de la requête...');
    const [rows] = await connection.execute('SELECT * FROM pizzas');
    console.log('Résultats de la requête:', rows);
    await connection.end();

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Aucune pizza trouvée' });
    }

    res.json(rows);
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des pizzas', 
      details: error.message 
    });
  }
});

// Récupérer une pizza par ID
app.get('/pizzas/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM pizzas WHERE id = ?',
      [req.params.id]
    );
    await connection.end();
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Pizza non trouvée' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la pizza:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une nouvelle commande
app.post('/orders', async (req, res) => {
  const { customer_name, address, phone_number, pizzas } = req.body;
  
  if (!customer_name || !address || !phone_number || !pizzas || !pizzas.length) {
    return res.status(400).json({ error: 'Données incomplètes' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Commencer une transaction
    await connection.beginTransaction();
    
    // Insérer la commande
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (customer_name, address, phone_number, status, order_date) VALUES (?, ?, ?, ?, NOW())',
      [customer_name, address, phone_number, 'pending']
    );
    
    const orderId = orderResult.insertId;
    
    // Insérer les détails de la commande
    for (const pizza of pizzas) {
      await connection.execute(
        'INSERT INTO order_items (order_id, pizza_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, pizza.id, pizza.quantity, pizza.price]
      );
    }
    
    // Valider la transaction
    await connection.commit();
    await connection.end();
    
    // Envoyer une notification
    sendNotification(
      orderId,
      customer_name,
      phone_number,
      `Votre commande #${orderId} a été reçue et est en cours de préparation.`
    );
    
    res.status(201).json({ 
      message: 'Commande créée avec succès', 
      order_id: orderId 
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer le statut d'une commande
app.get('/orders/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    const order = rows[0];
    
    // Récupérer les détails de la commande
    const [orderItems] = await connection.execute(
      'SELECT oi.*, p.name FROM order_items oi JOIN pizzas p ON oi.pizza_id = p.id WHERE oi.order_id = ?',
      [req.params.id]
    );
    
    await connection.end();
    
    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction pour envoyer une notification
async function sendNotification(orderId, customerName, phone, message) {
  try {
    const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://pizza-app-notification-service';
    const response = await fetch(`${notificationServiceUrl}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        customerName,
        phone,
        message
      }),
    });
    
    const data = await response.json();
    console.log('Réponse du service de notification:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return null;
  }
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});