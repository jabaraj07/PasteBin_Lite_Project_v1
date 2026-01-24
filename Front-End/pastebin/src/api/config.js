import axios from 'axios';

// Backend API base URL - change this to match your backend port
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`
});

export const PasteApi = {
    healthCheck:()=>api.get('/healthz'),
    createPaste:(data)=>api.post('/pastes',data),
    getPaste:(id)=>api.get(`/pastes/${id}`)
}