import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '20px',
      fontFamily: 'Segoe UI, sans-serif',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '32px', color: '#1e3c72', marginBottom: '8px' }}>Welcome Back</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Sign in to continue learning</p>
        
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'border 0.2s, box-shadow 0.2s',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #2a5298';
                e.target.style.boxShadow = '0 0 0 3px rgba(42,82,152,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid #d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '28px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'border 0.2s, box-shadow 0.2s',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #2a5298';
                e.target.style.boxShadow = '0 0 0 3px rgba(42,82,152,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid #d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(30,60,114,0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 6px 16px rgba(30,60,114,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(30,60,114,0.3)';
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '24px', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2a5298', fontWeight: '600', textDecoration: 'none' }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;