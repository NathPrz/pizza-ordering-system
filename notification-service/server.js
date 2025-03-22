const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());

// Route pour envoyer une notification
app.post('/notify', (req, res) => {
  const { orderId, customerName, phone, message } = req.body;
  
  if (!orderId || !customerName || !phone || !message) {
    return res.status(400).json({ error: 'Données incomplètes' });
  }
  
  console.log(`🔔 Notification pour la commande ${orderId} envoyée à ${customerName} (${phone}) : ${message}`);
  
  // Simulation d'envoi de notification 
  setTimeout(() => {
    res.json({ 
      success: true, 
      message: 'Notification envoyée avec succès',
      notification_id: Date.now()
    });
  }, 500);
});

// Route pour vérifier l'état du service
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Service de notification démarré sur le port ${PORT}`);
});