const API_URL = 'http://localhost:5000/api';

export const login = async (type, value) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, value }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();
  
  // Store token and role in localStorage
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);
  
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getRole = () => {
  return localStorage.getItem('role');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const hasRole = (requiredRole) => {
  const role = getRole();
  return role === requiredRole;
};
