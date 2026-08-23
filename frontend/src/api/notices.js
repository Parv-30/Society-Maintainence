import api from './index';

export const getNotices = () => api.get('/notices');
export const createNotice = (data) => api.post('/notices', data);
