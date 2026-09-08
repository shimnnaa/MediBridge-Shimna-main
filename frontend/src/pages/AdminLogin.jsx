import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, AlertTriangle, Shield, Server } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = () => {
    setEmail('admin@medibridge.com');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both administrator email and master password.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);

      // Verify user has admin role
      if (response && response.data && response.data.role !== 'admin') {
        logout(); // Logout unauthorized non-admin user
        setError('ACCESS DENIED: This account does not possess System Administrator privileges.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials. Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.standaloneWrapper}>
      {/* Dedicated Standalone Admin Topbar */}
      <header style={styles.topbar}>
        <div style={styles.topbarInner}>
          <div style={styles.topbarBrand}>
            <div style={styles.brandIcon}>
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <span style={styles.brandTitle}>Medi<span style={{ color: '#10b981' }}>Bridge</span></span>
              <span style={styles.brandSub}>ADMIN CONSOLE</span>
            </div>
          </div>

          <Link to="/" style={styles.exitLink}>
            <ArrowLeft size={16} /> Exit to Public Website
          </Link>
        </div>
      </header>

      {/* Main Admin Portal Container */}
      <div style={styles.mainContainer}>
        <div style={styles.portalCard} className="animate-fade-in">
          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.iconCircle}>
              <KeyRound size={28} color="#10b981" />
            </div>
            <div style={styles.securityBadge}>
              <span style={styles.statusDot}></span>
              <span>RESTRICTED ACCESS &bull; ADMIN CONSOLE</span>
            </div>
            <h1 style={styles.title}>Admin Console Login</h1>
            <p style={styles.subtitle}>
              Enter administrative credentials to authenticate and access the MediBridge Central Admin Console.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="admin-email" style={styles.label}>
                Administrator Email
              </label>
              <div style={styles.inputContainer}>
                <Mail size={17} style={styles.inputIcon} />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@medibridge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.inputField}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="admin-password" style={styles.label}>
                Master Password
              </label>
              <div style={styles.inputContainer}>
                <Lock size={17} style={styles.inputIcon} />
                <input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.inputField}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating Admin Console...</span>
              ) : (
                <>
                  <ShieldCheck size={18} /> Enter Admin Console
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Fill Box */}
          <div style={styles.quickFillContainer}>
            <div style={styles.quickFillTop}>
              <span style={styles.quickFillHeading}>Default Admin Console Credentials</span>
              <button
                type="button"
                onClick={handleQuickFill}
                style={styles.quickFillBtn}
              >
                Auto-Fill Admin
              </button>
            </div>
            <div style={styles.credentialsRow}>
              <code>admin@medibridge.com</code> &bull; <code>admin123</code>
            </div>
          </div>

          {/* Footer Security Notice */}
          <div style={styles.securityFooter}>
            <div style={styles.securityItem}>
              <Server size={14} color="#64748b" />
              <span>Admin Console Session &bull; 256-Bit Encrypted</span>
            </div>
            <p style={styles.warningText}>
              All access attempts to the Admin Console are monitored and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  standaloneWrapper: {
    minHeight: '100vh',
    width: '100%',
    background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-primary, system-ui, -apple-system, sans-serif)',
    color: '#f8fafc',
  },
  topbar: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(12px)',
    padding: '0 24px',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  topbarInner: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topbarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #059669, #10b981)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '-0.3px',
    color: '#ffffff',
    display: 'block',
    lineHeight: '1.1',
  },
  brandSub: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '1px',
    color: '#94a3b8',
  },
  exitLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: 600,
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.04)',
    transition: 'all 0.2s ease',
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  portalCard: {
    maxWidth: '460px',
    width: '100%',
    background: 'rgba(30, 41, 59, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    padding: '36px 32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  cardHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  securityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#34d399',
    letterSpacing: '0.6px',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981',
  },
  title: {
    fontSize: '1.55rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '0.86rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.45',
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#fca5a5',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
  },
  inputField: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    background: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '0.92rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  submitButton: {
    marginTop: '6px',
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.98rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
    transition: 'opacity 0.2s ease',
  },
  quickFillContainer: {
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    padding: '12px 14px',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  quickFillTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickFillHeading: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  quickFillBtn: {
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    color: '#34d399',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  credentialsRow: {
    fontSize: '0.8rem',
    color: '#e2e8f0',
  },
  securityFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  securityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: '#94a3b8',
  },
  warningText: {
    fontSize: '0.74rem',
    color: '#64748b',
    margin: 0,
  },
};

export default AdminLogin;
