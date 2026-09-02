const fs = require('fs');
const path = require('path');

const dirs = [
  'src/contexts', 'src/api', 'src/pages', 'src/components'
];

dirs.forEach(d => fs.mkdirSync(path.join(__dirname, d), { recursive: true }));

const files = {
  'src/contexts/AuthContext.jsx': `
import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  const login = async (username, password) => {
    const res = await client.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
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

export const useAuth = () => useContext(AuthContext);
`,
  'src/components/ProtectedRoute.jsx': `
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};
export default ProtectedRoute;
`,
  'src/components/Layout.jsx': `
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default Layout;
`,
  'src/components/Navbar.jsx': `
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <div className="navbar">
      <h2>Resource Portal</h2>
      <div>
        <span>{user?.username}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};
export default Navbar;
`,
  'src/components/Sidebar.jsx': `
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  return (
    <div className="sidebar">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/resources">Resources</Link>
      {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      <Link to="/profile">Profile</Link>
    </div>
  );
};
export default Sidebar;
`,
  'src/pages/LoginPage.jsx': `
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
export default LoginPage;
`,
  'src/pages/DashboardPage.jsx': 'import React from "react"; export default function DashboardPage() { return <div>Dashboard Page</div>; }',
  'src/pages/ResourcesPage.jsx': 'import React from "react"; export default function ResourcesPage() { return <div>Resources Page</div>; }',
  'src/pages/ResourceDetailPage.jsx': 'import React from "react"; export default function ResourceDetailPage() { return <div>Resource Detail Page</div>; }',
  'src/pages/ResourceFormPage.jsx': 'import React from "react"; export default function ResourceFormPage() { return <div>Resource Form Page</div>; }',
  'src/pages/AdminPage.jsx': 'import React from "react"; export default function AdminPage() { return <div>Admin Page</div>; }',
  'src/pages/ProfilePage.jsx': 'import React from "react"; export default function ProfilePage() { return <div>Profile Page</div>; }',
  'src/index.css': `
:root {
  --primary: #2E7D32;
  --dark: #1B5E20;
  --light: #4CAF50;
  --bg: #f5f5f5;
}
body { font-family: sans-serif; margin: 0; background: var(--bg); }
.layout { display: flex; height: 100vh; }
.sidebar { width: 200px; background: var(--dark); color: white; display: flex; flex-direction: column; padding: 20px; }
.sidebar a { color: white; text-decoration: none; margin-bottom: 10px; }
.main-content { flex: 1; display: flex; flex-direction: column; }
.navbar { background: #1a1a1a; color: white; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; }
.content { padding: 20px; }
button { background: var(--primary); color: white; border: none; padding: 8px 16px; cursor: pointer; }
input { padding: 8px; margin-bottom: 10px; display: block; }
  `,
  'src/App.css': ''
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filepath), content.trim() + '\\n');
}
