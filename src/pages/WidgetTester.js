import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import styles from './WidgetTester.module.css';

const WidgetTester = ({ onLogout }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProject();
    setMessages([{
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. Ask me anything about the uploaded documents.',
      timestamp: new Date()
    }]);
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          session_id: `test_${Date.now()}`,
          user_id: 'admin_test',
          user_name: 'Admin Test'
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        const botMessage = {
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          tokensUsed: data.usage?.tokens_used
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          type: 'error',
          content: data.error || 'Failed to get response',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: 'Network error occurred',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.widgetTester}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate(`/admin/projects/${projectId}`)}
        >
          <ArrowLeft size={20} />
          Back to Project
        </button>
        <h2>Widget Tester - {project?.name}</h2>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          {messages.map((message, index) => (
            <div key={index} className={`${styles.message} ${styles[message.type]}`}>
              <div className={styles.messageIcon}>
                {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={styles.messageContent}>
                <p>{message.content}</p>
                <div className={styles.messageInfo}>
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.tokensUsed && <span>Tokens: {message.tokensUsed}</span>}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className={`${styles.message} ${styles.bot}`}>
              <div className={styles.messageIcon}>
                <Bot size={16} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.inputArea}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question about the uploaded documents..."
            className={styles.messageInput}
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            className={styles.sendButton}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetTester;
