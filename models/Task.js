const mongoose = require('mongoose');

// Définition du schéma de tâche
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['pas commencé', 'en cours', 'terminé'], // assure-toi que ces valeurs sont correctes
    default: 'pas commencé',
  },
  deadline: Date,
}, {
  timestamps: true // ✅ Ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('Task', taskSchema);
