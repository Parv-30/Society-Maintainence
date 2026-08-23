import api from './index';

export const getComplaints = (params) => api.get('/admin/complaints', { params });
export const getRecurringIssues = () => api.get('/admin/complaints/recurring');
export const updateStatus = (id, data) => api.patch(`/admin/complaints/${id}/status`, data);
export const updatePriority = (id, data) => api.patch(`/admin/complaints/${id}/priority`, data);
export const getDashboard = () => api.get('/admin/dashboard');
export const getCategories = () => api.get('/admin/categories');
export const updateCategory = (id, data) => api.patch(`/admin/categories/${id}`, data);
