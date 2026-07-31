import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#admin') {
      setEmail('admin@medibridge.com');
      setPassword('admin123');

      // Clear the hash from URL immediately to prevent back-button redirect loops
      navigate('/login', { replace: true });

      const autoLogin = async () => {
        setLoading(true);
        setError('');
        try {
          await login('admin@medibridge.com', 'admin123');
          navigate('/dashboard');
        } catch (err) {
          setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      // 600ms delay so the user can see the credentials filled in before logging in
      const timer = setTimeout(() => {
        autoLogin();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [location.hash, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.card} className="card">
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <ShieldCheck size={28} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>Secure Login</h2>
          <p style={styles.subtitle}>Enter your credentials to access MediBridge</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={styles.inputWithIcon}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={styles.inputWithIcon}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p>Don't have an account yet?</p>
          <Link to="/register" style={styles.registerLink}>Register Securely Now</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    maxWidth: '450px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  iconBox: {
    width: '54px',
    height: '54px',
    borderRadius: '12px',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  errorAlert: {
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    border: '1px solid rgba(220, 53, 69, 0.2)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
  },
  inputWithIcon: {
    paddingLeft: '42px',
    width: '100%',
  },
  submitBtn: {
    marginTop: '8px',
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.9rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  registerLink: {
    color: 'var(--primary)',
    fontWeight: 700,
  },
};

export default Login;
