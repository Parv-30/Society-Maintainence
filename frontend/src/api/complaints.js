import api from './index';

export const getMyComplaints = () => api.get('/complaints/mine');
export const createComplaint = (data) => api.post('/complaints', data);
export const getComplaintHistory = (id) => api.get(`/complaints/${id}/history`);
export const getComplaintDetail = (id) => api.get(`/complaints/${id}`);
export const submitFeedback = (id, data) => api.post(`/complaints/${id}/feedback`, data);
export const uploadPhoto = (formData) => api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
