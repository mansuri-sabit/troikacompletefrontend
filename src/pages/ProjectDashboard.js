import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Settings, 
  Users, 
  MessageSquare, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
 
  Upload,
  RefreshCw,
  FileText,
  X
} from 'lucide-react';
import styles from './ProjectDashboard.module.css';

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Authentication check
  const checkAuthToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      console.error('❌ No authentication data found');
      navigate('/login');
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        console.error('❌ User is not admin');
        navigate('/login');
        return false;
      }
      
      console.log('✅ Authentication check passed for:', userData.email);
      return true;
    } catch (error) {
      console.error('❌ Invalid user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return false;
    }
  };

  // Fetch projects
const fetchProjects = async () => {
  if (!checkAuthToken()) return;
  
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/admin/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // ✅ Check content type before parsing
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ Non-JSON response:', textResponse);
      
      if (textResponse.includes('Proxy error')) {
        console.error('❌ Backend server not running');
        return;
      }
    }

    if (response.ok) {
      const data = await response.json();
      setProjects(data.projects || []);
      console.log('✅ Projects fetched successfully:', data.projects?.length || 0);
    } else if (response.status === 401) {
      console.error('❌ 401 Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  } catch (error) {
    console.error('❌ Network error fetching projects:', error);
    
    if (error.message.includes('Unexpected token')) {
      console.error('❌ Backend server not responding');
    }
  } finally {
    setLoading(false);
  }
};


  // Handle project creation with PDF support
const handleCreateProject = async (formData, hasFiles = false) => {
  if (!checkAuthToken()) return;
  
  try {
    const token = localStorage.getItem('token');
    
    console.log('🔄 Creating project...', hasFiles ? 'with files' : 'without files');
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // ✅ Only set Content-Type for JSON requests
    if (!hasFiles) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: headers,
      body: formData
    });

    console.log('📥 Response status:', response.status);
    
    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ Non-JSON response:', textResponse);
      alert('Server error: Invalid response format');
      return;
    }

    const data = await response.json();
    console.log('📥 Response data:', data);

    if (response.ok) {
      setProjects(prevProjects => [...prevProjects, data.project]);
      setShowCreateModal(false);
      alert('Project created successfully!');
      await fetchProjects();
    } else {
      console.error('❌ Project creation failed:', data);
      alert(`Error: ${data.error || data.details || 'Failed to create project'}`);
    }
  } catch (error) {
    console.error('❌ Error during project creation:', error);
    alert('Network error. Please check your connection and try again.');
  }
};



  // Handle project deletion
  const handleDeleteProject = async (projectId) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.project_id !== projectId));
        setShowDeleteModal(false);
        setSelectedProject(null);
        alert('Project deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  // Handle project status change
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setProjects(projects.map(p => 
          p.project_id === projectId ? { ...p, status: newStatus } : p
        ));
        alert(`Project ${newStatus} successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    }
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className={styles.statusIconActive} />;
      case 'suspended':
        return <AlertTriangle className={styles.statusIconSuspended} />;
      case 'expired':
        return <XCircle className={styles.statusIconExpired} />;
      default:
        return <Clock className={styles.statusIconDefault} />;
    }
  };

  // Calculate usage percentage
  const getUsagePercentage = (used, limit) => {
    return limit > 0 ? (used / limit) * 100 : 0;
  };

  // Fetch projects on component mount
  useEffect(() => {
    if (!checkAuthToken()) return;
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw className={styles.loadingIcon} />
        <span>Loading projects...</span>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Project Dashboard</h1>
            <p className={styles.subtitle}>Manage your Troika Tech chatbot projects</p>
          </div>
          <div className={styles.headerRight}>
            <button 
              className={styles.refreshBtn}
              onClick={fetchProjects}
              title="Refresh Projects"
            >
              <RefreshCw className={styles.buttonIcon} />
            </button>
            <button 
              className={styles.createBtn}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className={styles.buttonIcon} />
              Create Project
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterContainer}>
          <Filter className={styles.filterIcon} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Projects:</span>
            <span className={styles.statValue}>{projects.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Active:</span>
            <span className={styles.statValue}>
              {projects.filter(p => p.status === 'active').length}
            </span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className={styles.projectsGrid}>
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.project_id}
            project={project}
            onEdit={(project) => {
              setSelectedProject(project);
              setShowCreateModal(true);
            }}
            onDelete={(project) => {
              setSelectedProject(project);
              setShowDeleteModal(true);
            }}
            onStatusChange={handleStatusChange}
            getStatusIcon={getStatusIcon}
            getUsagePercentage={getUsagePercentage}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className={styles.emptyState}>
          <MessageSquare className={styles.emptyIcon} />
          <h3>No projects found</h3>
          <p>Create your first project to get started</p>
          <button 
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className={styles.buttonIcon} />
            Create Project
          </button>
        </div>
      )}

      {/* Create/Edit Project Modal */}
      {showCreateModal && (
        <ProjectModal
          project={selectedProject}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedProject(null);
          }}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <DeleteModal
          project={selectedProject}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
          onConfirm={() => handleDeleteProject(selectedProject.project_id)}
        />
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, onEdit, onDelete, onStatusChange, getStatusIcon, getUsagePercentage }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const usagePercentage = getUsagePercentage(project.total_tokens_used, project.monthly_token_limit);

  return (
    <div className={styles.projectCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <h3>{project.name}</h3>
          <div className={styles.statusBadge}>
            {getStatusIcon(project.status)}
            <span className={styles.statusText}>{project.status}</span>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button
            className={styles.actionButton}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <MoreVertical />
          </button>
          {showDropdown && (
            <div className={styles.dropdown}>
              <button onClick={() => onEdit(project)}>
                <Edit className={styles.dropdownIcon} />
                Edit
              </button>
              <button onClick={() => window.open(`/api/projects/${project.project_id}/embed`, '_blank')}>
                <Eye className={styles.dropdownIcon} />
                View Widget
              </button>
              <button onClick={() => onStatusChange(project.project_id, project.status === 'active' ? 'suspended' : 'active')}>
                <Settings className={styles.dropdownIcon} />
                {project.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
              <button onClick={() => onDelete(project)} className={styles.deleteAction}>
                <Trash2 className={styles.dropdownIcon} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardContent}>
        <p className={styles.description}>{project.description}</p>
        
        <div className={styles.projectInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Project ID:</span>
            <code className={styles.projectId}>{project.project_id}</code>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Client:</span>
            <span>{project.client_email}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Created:</span>
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          {/* PDF Files Count */}
          {project.pdf_files_count > 0 && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>PDF Files:</span>
              <span className={styles.pdfCount}>
                <FileText className={styles.pdfIcon} />
                {project.pdf_files_count} files
              </span>
            </div>
          )}
        </div>

        <div className={styles.usageSection}>
          <div className={styles.usageHeader}>
            <span className={styles.usageLabel}>Token Usage</span>
            <span className={styles.usagePercent}>{usagePercentage.toFixed(1)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={`${styles.progressFill} ${
                usagePercentage > 80 ? styles.progressDanger : 
                usagePercentage > 60 ? styles.progressWarning : 
                styles.progressSuccess
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <div className={styles.usageText}>
            {project.total_tokens_used.toLocaleString()} / {project.monthly_token_limit.toLocaleString()} tokens
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Project Creation/Edit Modal with PDF Upload
const ProjectModal = ({ project, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    client_email: project?.client_email || '',
    client_name: project?.client_name || '',
    company: project?.company || '',
    monthly_token_limit: project?.monthly_token_limit || 100000,
    welcome_message: project?.welcome_message || 'Hello! How can I help you today?',
    theme: project?.theme || 'default',
    primary_color: project?.primary_color || '#4f46e5'
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      alert('Please select only PDF files');
      return;
    }

    // Check file sizes (10MB max per file)
    const oversizedFiles = pdfFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setSelectedFiles(pdfFiles);
    console.log('✅ PDF files selected:', pdfFiles.map(f => f.name));
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // ✅ Validate required fields before submission
  if (!formData.name || formData.name.trim() === '') {
    alert('Project name is required');
    return;
  }

  // ✅ Create FormData for file upload or JSON for simple form
  let submitData;
  
  if (selectedFiles.length > 0) {
    // Use FormData for file uploads
    submitData = new FormData();
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key] || '');
    });
    
    // Add PDF files
    selectedFiles.forEach((file) => {
      submitData.append('pdf_files', file);
    });
    
    console.log('📤 Submitting with FormData and files:', selectedFiles.length);
  } else {
    // Use JSON for simple form without files
    submitData = JSON.stringify(formData);
    console.log('📤 Submitting with JSON:', formData);
  }
  
  // Call onSubmit with appropriate data
  onSubmit(submitData, selectedFiles.length > 0);
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{project ? 'Edit Project' : 'Create New Project'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Project Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter project name"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Project description"
                rows="3"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Client Email</label>
              <input
                type="email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                placeholder="client@example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Client Name</label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                placeholder="Client name"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Monthly Token Limit</label>
              <input
                type="number"
                name="monthly_token_limit"
                value={formData.monthly_token_limit}
                onChange={handleChange}
                min="1000"
                step="1000"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Welcome Message</label>
              <input
                type="text"
                name="welcome_message"
                value={formData.welcome_message}
                onChange={handleChange}
                placeholder="Welcome message for users"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Theme</label>
              <select name="theme" value={formData.theme} onChange={handleChange}>
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Primary Color</label>
              <input
                type="color"
                name="primary_color"
                value={formData.primary_color}
                onChange={handleChange}
              />
            </div>

            {/* PDF Upload Section */}
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label>Upload PDF Documents</label>
              <div className={styles.fileUploadContainer}>
                <input
                  type="file"
                  id="pdf-upload"
                  multiple
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                />
                <label htmlFor="pdf-upload" className={styles.fileUploadLabel}>
                  <Upload className={styles.uploadIcon} />
                  Choose PDF Files
                </label>
                <p className={styles.fileUploadHint}>
                  Upload PDF documents to train your chatbot (Max 10MB per file)
                </p>
              </div>
              
              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className={styles.selectedFiles}>
                  <h4>Selected Files ({selectedFiles.length}):</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                      <FileText className={styles.pdfIcon} />
                      <span className={styles.fileName}>{file.name}</span>
                      <span className={styles.fileSize}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className={styles.removeFileBtn}
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ project, onClose, onConfirm }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.deleteModal}>
        <div className={styles.deleteHeader}>
          <AlertTriangle className={styles.deleteIcon} />
          <h2>Delete Project</h2>
        </div>
        
        <div className={styles.deleteContent}>
          <p>Are you sure you want to delete the project <strong>"{project.name}"</strong>?</p>
          <p className={styles.deleteWarning}>
            This action cannot be undone. All chat history, PDF files, and configurations will be permanently deleted.
          </p>
        </div>

        <div className={styles.deleteActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.deleteButton}>
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
