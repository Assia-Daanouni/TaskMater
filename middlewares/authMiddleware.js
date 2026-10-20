// middlewares/authMiddleware.js
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next(); // L'utilisateur est authentifié, passer à la suite
  } else {
    res.redirect('/login'); // L'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  }
};

module.exports = isAuthenticated;
