const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET inscription
router.get('/register', (req, res) => {
  res.render('register');
});

// POST inscription
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.send('Email déjà utilisé');

    const user = new User({ username, email, password });
    await user.save();

    req.session.userId = user._id;
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Erreur serveur');
  }
});

// GET login
router.get('/login', (req, res) => {
  res.render('login');
});

// POST login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.send('Utilisateur non trouvé');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.send('Mot de passe incorrect');

    req.session.userId = user._id;
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.send('Erreur serveur');
  }
});

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erreur de déconnexion :', err);
      return res.redirect('/dashboard'); // Ou une autre page si tu veux
    }
    res.clearCookie('connect.sid'); // Facultatif : supprime le cookie de session
    res.redirect('/login'); // Redirige vers la page de connexion
  });
});


module.exports = router;
