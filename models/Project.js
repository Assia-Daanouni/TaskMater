const mongoose = require('mongoose');

// Définition du schéma de projet
const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pas commencé', 'en cours', 'terminé'], default: 'pas commencé' },
  deadline: Date,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }] // Référence aux tâches associées
}, { timestamps: true });


module.exports = mongoose.model('Project', projectSchema);
