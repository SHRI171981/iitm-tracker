// frontend/src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Your FastAPI URL
  headers: {
    'Content-Type': 'application/json',
  },
});