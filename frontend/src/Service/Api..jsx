import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Ou a porta que seu Back-end usar
});

export default api;