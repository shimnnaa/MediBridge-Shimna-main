const API_URL = 'http://localhost:5000/api';

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const method = (options.method || 'GET').toUpperCase();
    const response = await fetch(`${API_URL}${endpoint}`, config);

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status} for [${method} ${endpoint}]: ${text || 'Please check backend logs.'}`);
      }
      throw new Error(`Invalid server response format for [${method} ${endpoint}]. Expected JSON, got ${contentType || 'text'}.`);
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('medibridge:logout'));
      }
      throw new Error(data.message || `Request failed with status ${response.status} for [${method} ${endpoint}]`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      console.error('API Server Offline: Could not reach http://localhost:5000');
      throw new Error('Cannot connect to backend server. Please verify the backend is running on port 5000.');
    }
    console.error('API Error:', error.message);
    throw error;
  }
};

export { API_URL };
export default api;
