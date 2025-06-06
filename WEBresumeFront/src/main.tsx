import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import axios from 'axios';

// Configure axios to include credentials in all requests
axios.defaults.withCredentials = true;

// Function to get CSRF token from cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Axios interceptor for handling CSRF tokens and authentication
axios.interceptors.request.use(
  config => {
    // Get authentication status from localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      // Include a custom auth header that Django will recognize
      config.headers['X-User-Authenticated'] = 'true';
    }
    
    // Get CSRF token from cookie if available
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
