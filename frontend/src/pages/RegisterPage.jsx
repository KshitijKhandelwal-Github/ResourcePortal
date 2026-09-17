import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../api/auth';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        role: 'REGULAR_USER',
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ width: '440px' }}>
        <div className="login-card-accent" />
        <h1>Create Account</h1>
        <p>Register to access Resource Portal</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', marginBottom: 0, fontSize: '13.5px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
