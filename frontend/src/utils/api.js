const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const parseError = async (response) => {
  let body;
  try {
    body = await response.json();
  } catch {
    return response.statusText;
  }
  return body?.detail || body?.message || response.statusText;
};

const request = async (path, init = {}) => {
  const config = {
    method: 'GET',
    headers: { ...defaultHeaders, ...(init.headers || {}) },
    ...init,
  };
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }
  const response = await fetch(`${API_BASE}${path}`, config);
  if (!response.ok) {
    const errorMessage = await parseError(response);
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const loginUser = (payload) => request('/login', { method: 'POST', body: payload });
export const signupUser = (payload) => request('/signup', { method: 'POST', body: payload });
export const fetchUsers = () => request('/users');
export const updateUser = (userId, payload) => request(`/users/${userId}`, { method: 'PUT', body: payload });
export const deleteUser = (userId) => request(`/users/${userId}`, { method: 'DELETE' });
