import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Code, 
  Download,
  Eye,
  Users
} from 'lucide-react';
import styles from './ProjectDetails.module.css';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading project details...</div>;
  }

  if (!project) {
    return <div className={styles.error}>Project not found</div>;
  }

  return (
    <div className={styles.projectDetails}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/admin/projects')}
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>
        
        <div className={styles.projectInfo}>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <div className={styles.statusBadge}>
            <span className={`${styles.status} ${styles[project.status]}`}>
              {project.status}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionButton}>
            <Settings size={20} />
            Settings
          </button>
          <button className={styles.actionButton}>
            <Eye size={20} />
            Preview Widget
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={16} />
          Documents ({project.pdf_files?.length || 0})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} />
          Chat History
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'embed' ? styles.active : ''}`}
          onClick={() => setActiveTab('embed')}
        >
          <Code size={16} />
          Embed Code
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'documents' && <DocumentsTab project={project} />}
        {activeTab === 'chat' && <ChatHistoryTab project={project} />}
        {activeTab === 'embed' && <EmbedCodeTab project={project} />}
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ project }) => (
  <div className={styles.overview}>
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <h3>Token Usage</h3>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(project.total_tokens_used / project.monthly_token_limit) * 100}%` }}
          />
        </div>
        <p>{project.total_tokens_used.toLocaleString()} / {project.monthly_token_limit.toLocaleString()}</p>
      </div>
      
      <div className={styles.statCard}>
        <h3>Documents</h3>
        <p className={styles.statValue}>{project.pdf_files?.length || 0}</p>
      </div>
      
      <div className={styles.statCard}>
        <h3>Status</h3>
        <p className={styles.statValue}>{project.status}</p>
      </div>
    </div>
  </div>
);

const DocumentsTab = ({ project }) => (
  <div className={styles.documents}>
    {project.pdf_files?.length > 0 ? (
      <div className={styles.filesList}>
        {project.pdf_files.map((file, index) => (
          <div key={index} className={styles.fileItem}>
            <FileText className={styles.fileIcon} />
            <div className={styles.fileInfo}>
              <h4>{file.file_name}</h4>
              <p>{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button className={styles.downloadButton}>
              <Download size={16} />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div className={styles.emptyState}>
        <FileText size={48} />
        <h3>No documents uploaded</h3>
        <p>Upload PDF documents to train your chatbot</p>
      </div>
    )}
  </div>
);

const ChatHistoryTab = ({ project }) => {
  const [chatHistory, setChatHistory] = useState([]);
  
  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/projects/${project.project_id}/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  return (
    <div className={styles.chatHistory}>
      {chatHistory.length > 0 ? (
        <div className={styles.messagesList}>
          {chatHistory.map((message, index) => (
            <div key={index} className={styles.messageItem}>
              <div className={styles.userMessage}>
                <strong>User:</strong> {message.message}
              </div>
              <div className={styles.botResponse}>
                <strong>AI:</strong> {message.response}
              </div>
              <div className={styles.messageInfo}>
                <span>Tokens: {message.tokens_used}</span>
                <span>{new Date(message.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <MessageSquare size={48} />
          <h3>No chat history</h3>
          <p>Chat messages will appear here once users start interacting</p>
        </div>
      )}
    </div>
  );
};

const EmbedCodeTab = ({ project }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(project.embed_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.embedCode}>
      <div className={styles.codeSection}>
        <h3>Widget Embed Code</h3>
        <p>Copy and paste this code into your website to add the chatbot widget:</p>
        
        <div className={styles.codeBlock}>
          <pre>{project.embed_code}</pre>
          <button 
            className={styles.copyButton}
            onClick={copyToClipboard}
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      <div className={styles.previewSection}>
        <h3>Widget Preview</h3>
        <div className={styles.widgetPreview}>
          <iframe 
            src={`/api/projects/${project.project_id}/preview`}
            className={styles.previewFrame}
            title="Widget Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
