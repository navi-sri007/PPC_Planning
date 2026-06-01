import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure default axios base URL as well for any direct axios calls
axios.defaults.baseURL = API_BASE_URL;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (status === 400) {
      toast.error(detail || 'Bad request. Please verify inputs.');
    } else if (status === 404) {
      toast.error(detail || 'Requested resource not found.');
    } else if (status === 500) {
      toast.error('Internal server error. Please try again later.');
    } else {
      toast.error(detail || error.message || 'An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);

// Do the same for default global axios instance
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (status === 400) {
      toast.error(detail || 'Bad request. Please verify inputs.');
    } else if (status === 404) {
      toast.error(detail || 'Requested resource not found.');
    } else if (status === 500) {
      toast.error('Internal server error. Please try again later.');
    } else {
      toast.error(detail || error.message || 'An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);

export default api;
