const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); //Un middleware pour stocker les sessions dans MongoDB
const path = require('path');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
// Pour servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  }),
}));

app.use(flash());//"Action réussie" ou "Erreur"

app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

app.use(authRoutes);
app.use(dashboardRoutes); // route protégée avec middleware

// Route pour /calendar
app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'calendar.html'));
});

// Route pour /calendar
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'landing.html'));
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
