import React, { useState, FormEvent } from 'react';
import { supabase } from '../services/supabase';
import { Card } from '../components/ui/Card';

const formContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  marginBottom: '16px',
  borderRadius: 'var(--border-radius)',
  border: '1px solid var(--border-color)',
  fontFamily: 'var(--font-family)',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: 'var(--border-radius)',
  border: 'none',
  backgroundColor: 'var(--brand-primary)',
  color: '#FFF',
  fontWeight: 600,
  cursor: 'pointer',
};

const toggleStyle: React.CSSProperties = {
  marginTop: '24px',
  textAlign: 'center',
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
};

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else if (!isLogin) {
      setMessage('Check your email for the confirmation link!');
    }
    setLoading(false);
  };

  return (
    <div style={formContainerStyle}>
      <Card title={isLogin ? "Welcome Back" : "Create an Account"} className="max-w-sm w-full">
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button style={buttonStyle} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
          {message && <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
        </form>
        <div style={toggleStyle}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--text-accent)', cursor: 'pointer' }}>
            {isLogin ? "Need an account? Sign Up" : "Have an account? Sign In"}
          </button>
        </div>
      </Card>
    </div>
  );
} 