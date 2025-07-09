import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api/admin',
  timeout: 10000,
});

api.interceptors.request.use(cfg => {
  cfg.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return cfg;
});

export const getDashboard = (range='7d') =>
  api.get('/dashboard', { params: { range }}).then(r => r.data);

export const getProjects      = () => api.get('/projects').then(r => r.data.projects);
export const createProject    = body => api.post('/projects', body).then(r => r.data.project);
export const updateProject    = (id, body) => api.patch(`/projects/${id}`, body).then(r => r.data.project);
export const setProjectStatus = (id, status) => api.patch(`/projects/${id}/status`, { status });
export const deleteProject    = id => api.delete(`/projects/${id}`);
