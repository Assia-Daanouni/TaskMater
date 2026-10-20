document.addEventListener('DOMContentLoaded', function() {
  // Set current date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('fr-FR', options);
  
  // Sample data - in a real app, this would come from an API
  const sampleProjects = [
    {
      id: 1,
      title: "Refonte du site web",
      description: "Refonte complète du site web avec nouvelle interface utilisateur",
      priority: "high",
      status: "en cours",
      deadline: "2023-12-15",
      tasks: [
        { id: 1, title: "Créer maquettes", status: "Completed" },
        { id: 2, title: "Développement frontend", status: "In Progress" }
      ]
    },
    {
      id: 2,
      title: "Migration de base de données",
      description: "Migration de MySQL vers MongoDB",
      priority: "medium",
      status: "en cours",
      deadline: "2023-11-30",
      tasks: [
        { id: 3, title: "Backup des données", status: "Pending" }
      ]
    }
  ];
  
  // Initialize UI with sample data
  renderProjects(sampleProjects);
  updateStats(sampleProjects);
  
  // Event listeners
  document.getElementById('addProjectBtn').addEventListener('click', showProjectModal);
  document.getElementById('createFirstProject').addEventListener('click', showProjectModal);
  document.getElementById('saveProjectBtn').addEventListener('click', saveProject);
  document.getElementById('searchInput').addEventListener('input', filterProjects);
  
  // Project checkbox event delegation
  document.getElementById('projectsContainer').addEventListener('change', function(e) {
    if (e.target.classList.contains('project-checkbox')) {
      toggleProjectStatus(e.target);
    }
  });
});

function renderProjects(projects) {
  const container = document.getElementById('projectsContainer');
  const noProjectsAlert = document.getElementById('noProjectsAlert');
  
  if (projects.length === 0) {
    container.innerHTML = '';
    noProjectsAlert.style.display = 'block';
    return;
  }
  
  noProjectsAlert.style.display = 'none';
  container.innerHTML = '';
  
  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'col';
    projectCard.innerHTML = `
      <div class="card project-card">
        <div class="card-header position-relative">
          <div class="project-priority priority-${project.priority}"></div>
          <h5 class="card-title">${project.title}</h5>
          <div class="d-flex align-items-center">
            <span class="badge bg-${project.status === 'terminé' ? 'success' : project.status === 'en cours' ? 'warning' : 'secondary'} badge-status me-2">
              ${project.status}
            </span>
            <label class="checkbox-container mb-0 ms-2">
              <input type="checkbox" class="project-checkbox" 
                     data-project-id="${project.id}" 
                     ${project.status === 'terminé' ? 'checked' : ''}>
              <span class="checkmark"></span>
            </label>
          </div>
        </div>
        <div class="card-body">
          ${project.description ? `<p class="card-text text-muted mb-3">${project.description}</p>` : ''}
          <div class="deadline-info">
            <i class="far fa-calendar-alt"></i>
            ${project.deadline ? `
              <span class="${new Date(project.deadline) < new Date() && project.status !== 'terminé' ? 'deadline-warning' : ''}">
                Échéance: ${new Date(project.deadline).toLocaleDateString('fr-FR')}
                ${new Date(project.deadline) < new Date() && project.status !== 'terminé' ? '<i class="fas fa-exclamation-triangle ms-2"></i>' : ''}
              </span>
            ` : '<span>Pas de date limite définie</span>'}
          </div>
          <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-outline-primary btn-sm view-tasks-btn" data-project-id="${project.id}">
              <i class="fas fa-list me-1"></i> Voir les tâches
            </button>
            <div>
              <button class="btn btn-icon btn-outline-secondary me-2 edit-project-btn" data-project-id="${project.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-icon btn-outline-danger delete-project-btn" data-project-id="${project.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(projectCard);
  });
  
  // Add event listeners to dynamically created buttons
  document.querySelectorAll('.view-tasks-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Fonctionnalité "Voir les tâches" à implémenter');
    });
  });
  
  document.querySelectorAll('.edit-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Fonctionnalité "Modifier projet" à implémenter');
    });
  });
  
  document.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
        alert('Fonctionnalité "Supprimer projet" à implémenter');
      }
    });
  });
}

function updateStats(projects) {
  const ongoing = projects.filter(p => p.status === 'en cours').length;
  const completed = projects.filter(p => p.status === 'terminé').length;
  
  document.getElementById('ongoingProjects').textContent = ongoing;
  document.getElementById('completedProjects').textContent = completed;
}

function showProjectModal() {
  const modal = new bootstrap.Modal(document.getElementById('projectModal'));
  document.getElementById('modalTitle').textContent = 'Nouveau Projet';
  document.getElementById('projectForm').reset();
  modal.show();
}

function saveProject() {
  const title = document.getElementById('projectTitle').value;
  const description = document.getElementById('projectDescription').value;
  const priority = document.getElementById('projectPriority').value;
  const deadline = document.getElementById('projectDeadline').value;
  
  if (!title) {
    alert('Le titre du projet est requis');
    return;
  }
  
  // In a real app, you would send this to your backend
  const newProject = {
    id: Date.now(), // Temporary ID
    title,
    description,
    priority,
    status: 'en cours',
    deadline,
    tasks: []
  };
  
  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
  modal.hide();
  
  // Add to projects array and re-render
  // In a real app, you would get the updated list from the backend
  const projects = Array.from(document.querySelectorAll('.project-card')).length > 0 ? 
    [...sampleProjects, newProject] : [newProject];
  
  renderProjects(projects);
  updateStats(projects);
}

function filterProjects() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const description = card.querySelector('.card-text')?.textContent.toLowerCase() || '';
    const matches = title.includes(searchTerm) || description.includes(searchTerm);
    card.parentElement.style.display = matches ? 'block' : 'none';
  });
}

function toggleProjectStatus(checkbox) {
  const projectId = checkbox.dataset.projectId;
  const isChecked = checkbox.checked;
  const status = isChecked ? 'terminé' : 'en cours';
  
  // In a real app, you would send this update to your backend
  console.log(`Updating project ${projectId} status to ${status}`);
  
  // Update the UI
  const projectCard = checkbox.closest('.project-card');
  const statusBadge = projectCard.querySelector('.badge-status');
  
  if (statusBadge) {
    statusBadge.textContent = status;
    statusBadge.className = `badge bg-${isChecked ? 'success' : 'warning'} badge-status me-2`;
  }
  
  // Update stats
  const ongoingEl = document.getElementById('ongoingProjects');
  const completedEl = document.getElementById('completedProjects');
  
  if (isChecked) {
    ongoingEl.textContent = parseInt(ongoingEl.textContent) - 1;
    completedEl.textContent = parseInt(completedEl.textContent) + 1;
  } else {
    ongoingEl.textContent = parseInt(ongoingEl.textContent) + 1;
    completedEl.textContent = parseInt(completedEl.textContent) - 1;
  }
}