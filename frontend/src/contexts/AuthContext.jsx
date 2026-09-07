import { createContext, useState, useContext } from 'react';
import client from '../api/client';

const AuthContext = createContext();

const normalizeUser = (user) => {
  if (!user) return null;
  const role = user.role?.toLowerCase();
  const normalizedRole = role === 'regular_user' ? 'user' : role;

  return {
    ...user,
    role: normalizedRole,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    const res = await client.post('/auth/login', { username, password });
    const normalizedUser = normalizeUser(res.data.user);
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);