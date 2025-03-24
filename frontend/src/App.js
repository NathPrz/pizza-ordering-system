import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pizzas, setPizzas] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

 /* useEffect(() => {
    // Récupérer la liste des pizzas depuis l'API
    setLoading(true);
    fetch(process.env.REACT_APP_API_BASE_URL + '/pizzas'){
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des pizzas');
      }
      return response.json();
    })
    .then(data => {
      setPizzas(data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des pizzas:', error);
      setLoading(false);
    });
}, []);*/
useEffect(() => {
  const fetchPizzas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/pizzas`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPizzas(data);
    } catch (error) {
      console.error('Erreur API:', {
        message: error.message,
        stack: error.stack,
        url: `${process.env.REACT_APP_API_BASE_URL}/pizzas`
      });
      // Solution de repli (mock data)
      setPizzas([
        {
          id: 0,
          name: "Pizza d'urgence",
          description: "Données temporaires - API indisponible",
          price: 15.5,
          image_url: "/images/placeholder.jpg"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  fetchPizzas();
}, []);

  const addToCart = (pizza) => {
    const existingItem = cart.find(item => item.id === pizza.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === pizza.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...pizza, quantity: 1 }]);
    }
  };

  const removeFromCart = (pizzaId) => {
    const existingItem = cart.find(item => item.id === pizzaId);
    
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== pizzaId));
    } else {
      setCart(cart.map(item => 
        item.id === pizzaId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const placeOrder = () => {
    // Vérifier que toutes les informations sont présentes
    if (!customerInfo.name || !customerInfo.address || !customerInfo.phone || cart.length === 0) {
      alert('Veuillez remplir tous les champs et ajouter au moins une pizza au panier.');
      return;
    }

    // Préparer les données de la commande
    const orderData = {
      customer_name: customerInfo.name,
      address: customerInfo.address,
      phone_number: customerInfo.phone,
      pizzas: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    // Envoyer la commande à l'API
    fetch(process.env.REACT_APP_API_BASE_URL + '/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Commande créée:', data);
        setOrderPlaced(true);
        setOrderId(data.order_id);
        setShowConfirmation(true);
        setCart([]);
      })
      .catch(error => console.error('Erreur lors de la création de la commande:', error));
  };

  // Calculer le total du panier
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pizza Express</h1>
      </header>

      <main>
        {orderPlaced ? (
          <div className="order-confirmation">
            <h2>Merci pour votre commande!</h2>
            <p>Votre commande #{orderId} a été enregistrée et est en cours de préparation.</p>
            <p>Vous recevrez bientôt une notification par SMS.</p>
            <button onClick={() => setOrderPlaced(false)}>Passer une nouvelle commande</button>
          </div>
        ) : (
          <div className="container">
            <div className="menu">
              <h2>Notre Menu</h2>
              
              {loading ? (
                <div className="loading">Chargement des pizzas...</div>
              ) : (
                <div className="pizzas-list">
                  {pizzas.map(pizza => (
                    <div key={pizza.id} className="pizza-card">
                      <h3>{pizza.name}</h3>
                      <p>{pizza.description}</p>
                      <p className="price">{pizza.price.toFixed(2)} €</p>
                      <img 
                        src={process.env.PUBLIC_URL + pizza.image_url} 
                        alt={pizza.name} 
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = process.env.PUBLIC_URL + "/images/placeholder.jpg";
                        }}
                      />
                      <button onClick={() => addToCart(pizza)}>Ajouter au panier</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cart">
              <h2>Votre Panier</h2>
              {cart.length === 0 ? (
                <p>Votre panier est vide</p>
              ) : (
                <>
                  <ul>
                    {cart.map(item => (
                      <li key={item.id}>
                        <div className="item-info">
                          <strong>{item.name}</strong> x {item.quantity}
                          <div>{(item.price * item.quantity).toFixed(2)} €</div>
                        </div>
                        <div className="item-actions">
                          <button onClick={() => removeFromCart(item.id)}>-</button>
                          <button onClick={() => addToCart(item)}>+</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="cart-total">
                    Total: {cartTotal.toFixed(2)} €
                  </div>
                </>
              )}

              <div className="customer-info">
                <h3>Vos Informations</h3>
                <form>
                  <div className="form-group">
                    <label htmlFor="name">Nom</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Adresse</label>
                    <textarea
                      id="address"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      placeholder="Adresse de livraison"
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Téléphone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Numéro de téléphone"
                      required
                    />
                  </div>
                </form>
              </div>

              <button
                className="order-button"
                onClick={placeOrder}
                disabled={cart.length === 0}
              >
                Passer la Commande
              </button>
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>&copy; 2025 Pizza Express - Service de Commande en Ligne</p>
      </footer>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="modal">
          <div className="modal-content">
            <h2>Merci pour votre commande!</h2>
            <p>Votre commande #{orderId} a été enregistrée et est en cours de préparation.</p>
            <p>Vous recevrez bientôt une notification par SMS.</p>
            <button onClick={() => setShowConfirmation(false)}>Fermer</button>
          </div>
        </div>
      )}  
    </div>
  );
}

export default App;