const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/authMiddleware');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Route pour afficher le dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);

    // Récupérer les projets avec leurs tâches
    const projects = await Project.find({ userId })
      .populate('tasks')
      .lean();

    // Calculer les statistiques des projets
    const projectStats = {
      ongoing: projects.filter(p => p.status === 'en cours').length,
      completed: projects.filter(p => p.status === 'terminé').length,
      total: projects.length,
    };

    // Récupérer toutes les tâches
    const tasks = await Task.find({
      projectId: { $in: projects.map(p => p._id) }
    }).lean();

    // Calculer les statistiques des tâches
    const taskStats = {
      ongoing: tasks.filter(t => t.status === 'en cours').length,
      completed: tasks.filter(t => t.status === 'terminé').length,
      total: tasks.length
    };

  

    res.render('dashboard', {
      user,
      projects,
      projectStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors du chargement du tableau de bord');
  }
});



// Route pour ajouter un projet
router.post('/add-project', isAuthenticated, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const userId = req.session.userId;

    if (!title) {
      return res.status(400).send('Le titre du projet est requis');
    }

    const newProject = new Project({
      userId,
      title,
      description: description || '',
      status: 'en cours',
      deadline: deadline ? new Date(deadline) : null
    });

    await newProject.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send(`Erreur lors de l'ajout du projet : ${err.message}`);
  }
});

// Route pour ajouter une tâche
router.post('/add-task/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).send('Le titre est requis');
    }

    const newTask = await Task.create({
      projectId: req.params.projectId,
      title,
      description,
      status: 'en cours'
    });

    await Project.findByIdAndUpdate(
      req.params.projectId,
      { $push: { tasks: newTask._id } }
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send(`Erreur lors de l'ajout de la tâche : ${err.message}`);
  }
});

// Route pour mettre à jour le statut d'une tâche
router.post('/update-task-status/:id', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: "Le statut est requis" 
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ 
        success: false,
        error: "Tâche non trouvée" 
      });
    }

    // Mettre à jour le statut du projet parent
    const project = await Project.findById(task.projectId);
    if (project) {
      await project.updateStatus();
      return res.json({ 
        success: true,
        task,
        projectStatus: project.status 
      });
    }

    return res.json({ success: true, task });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Route pour mettre à jour le statut d'un projet
router.post('/update-project-status/:id', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: "Le statut est requis" 
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: "Projet non trouvé" 
      });
    }

    // Si projet terminé, marquer toutes ses tâches comme terminées
    if (status === 'terminé') {
      await Task.updateMany(
        { projectId: project._id },
        { $set: { status: 'terminé' } }
      );
    }

    return res.json({ 
      success: true,
      project
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Routes pour l'édition
router.get('/edit-project/:id', isAuthenticated, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    res.render('edit-project', { project });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.post('/edit-project/:id', isAuthenticated, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null
      }
    );
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect(`/edit-project/${req.params.id}`);
  }
});

router.get('/edit-task/:id', isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).lean();
    res.render('edit-task', { task });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.post('/edit-task/:id', isAuthenticated, async (req, res) => {
  try {
    const { title, description } = req.body;
    await Task.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect(`/edit-task/${req.params.id}`);
  }
});

// Routes pour la suppression
router.post('/delete-project/:id', isAuthenticated, async (req, res) => {
  try {
    await Task.deleteMany({ projectId: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

router.post('/delete-task/:id', isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    await Project.findByIdAndUpdate(
      task.projectId,
      { $pull: { tasks: task._id } }
    );
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});
// Route pour afficher le formulaire d'ajout de tâche
router.get('/add-task/:projectId', isAuthenticated, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).lean();
    if (!project) {
      return res.status(404).send('Projet non trouvé');
    }
    res.render('add-task', { project });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors du chargement du formulaire');
  }
});

// Route pour traiter l'ajout de tâche
router.post('/add-task/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).send('Le titre est requis');
    }

    const newTask = await Task.create({
      projectId: req.params.projectId,
      title,
      description: description || '',
      status: 'en cours'
    });

    // Ajouter la tâche au projet
    await Project.findByIdAndUpdate(
      req.params.projectId,
      { $push: { tasks: newTask._id } }
    );

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de la création de la tâche');
  }
});

router.get('/add-project', isAuthenticated, (req, res) => {
  res.render('add-project');
});


module.exports = router;