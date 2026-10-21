import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, User, PlusCircle, Search, ClipboardList, ShieldAlert, Users, Menu, X, FileText, History } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo} onClick={closeMenu}>
          <div style={styles.logoIcon}>
            <Heart size={20} fill="currentColor" />
          </div>
          <span style={styles.logoText}>Medi<span style={styles.logoAccent}>Bridge</span></span>
        </Link>

        {/* Desktop Links */}
        <div style={styles.desktopNavLinks} className="desktop-only-nav">
          {user ? (
            <>
              {/* Common link for all authenticated users to go to dashboard */}
              <Link to="/dashboard" style={styles.link}>Dashboard</Link>

              {/* Donor specific links */}
              {user.role === 'donor' && (
                <>
                  <Link to="/donate" style={styles.link}>
                    <PlusCircle size={16} /> Donate
                  </Link>
                  <Link to="/my-donations" style={styles.link}>
                    <ClipboardList size={16} /> My Donations
                  </Link>
                </>
              )}

              {/* Beneficiary/NGO specific links */}
              {(user.role === 'beneficiary' || user.role === 'ngo') && (
                <>
                  <Link to="/available-medicines" style={styles.link}>
                    <Search size={16} /> Request Medicine
                  </Link>
                  <Link to="/my-requests" style={styles.link}>
                    <ClipboardList size={16} /> My Requests
                  </Link>
                </>
              )}

              {/* Admin specific links */}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/verify-donations" style={styles.link}>
                    <ShieldAlert size={16} /> Verify Donations
                  </Link>
                  <Link to="/admin/donation-history" style={styles.link}>
                    <History size={16} /> Donation History
                  </Link>
                  <Link to="/admin/verify-requests" style={styles.link}>
                    <ClipboardList size={16} /> Requests
                  </Link>
                  <Link to="/admin/users" style={styles.link}>
                    <Users size={16} /> Users
                  </Link>
                  <Link to="/admin/reports" style={styles.link}>
                    <FileText size={16} /> Reports
                  </Link>
                </>
              )}

              {/* Profile and Logout */}
              <Link to="/profile" style={styles.profileLink}>
                <User size={16} />
                <span style={styles.profileText}>{user.name}</span>
              </Link>
              
              <button onClick={handleLogout} style={styles.logoutBtn} className="btn">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn} className="btn btn-primary">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          style={styles.mobileMenuToggle}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer} className="animate-fade-in">
          {user ? (
            <div style={styles.mobileLinksList}>
              <Link to="/dashboard" style={styles.mobileLink} onClick={closeMenu}>
                Dashboard
              </Link>

              {user.role === 'donor' && (
                <>
                  <Link to="/donate" style={styles.mobileLink} onClick={closeMenu}>
                    <PlusCircle size={16} /> Donate Medicine
                  </Link>
                  <Link to="/my-donations" style={styles.mobileLink} onClick={closeMenu}>
                    <ClipboardList size={16} /> My Donations
                  </Link>
                </>
              )}

              {(user.role === 'beneficiary' || user.role === 'ngo') && (
                <>
                  <Link to="/available-medicines" style={styles.mobileLink} onClick={closeMenu}>
                    <Search size={16} /> Request Medicine
                  </Link>
                  <Link to="/my-requests" style={styles.mobileLink} onClick={closeMenu}>
                    <ClipboardList size={16} /> My Requests
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/admin/verify-donations" style={styles.mobileLink} onClick={closeMenu}>
                    <ShieldAlert size={16} /> Verify Donations
                  </Link>
                  <Link to="/admin/donation-history" style={styles.mobileLink} onClick={closeMenu}>
                    <History size={16} /> Donation History
                  </Link>
                  <Link to="/admin/verify-requests" style={styles.mobileLink} onClick={closeMenu}>
                    <ClipboardList size={16} /> Requests
                  </Link>
                  <Link to="/admin/users" style={styles.mobileLink} onClick={closeMenu}>
                    <Users size={16} /> Manage Users
                  </Link>
                  <Link to="/admin/reports" style={styles.mobileLink} onClick={closeMenu}>
                    <FileText size={16} /> Reports & Audits
                  </Link>
                </>
              )}

              <Link to="/profile" style={styles.mobileProfileLink} onClick={closeMenu}>
                <User size={16} />
                <span>{user.name || 'Account'} ({(user.role || 'user').toUpperCase()})</span>
              </Link>

              <button onClick={handleLogout} style={styles.mobileLogoutBtn} className="btn btn-danger">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={styles.mobileLinksList}>
              <Link to="/login" style={styles.mobileLink} onClick={closeMenu}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>Register Securely</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '0 24px',
    minHeight: '70px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(15, 165, 124, 0.2)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'hsl(210, 24%, 12%)',
    letterSpacing: '-0.5px',
  },
  logoAccent: {
    color: 'var(--primary)',
  },
  desktopNavLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    padding: '6px 10px',
    borderRadius: '8px',
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: 'var(--primary)',
    background: 'var(--primary-light)',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  profileText: {
    maxWidth: '120px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '0.88rem',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  loginBtn: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginRight: '10px',
  },
  registerBtn: {
    padding: '10px 20px',
    fontSize: '0.95rem',
  },
  mobileMenuToggle: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
  },
  mobileDrawer: {
    background: '#fff',
    borderTop: '1px solid var(--border-color)',
    padding: '16px 0',
  },
  mobileLinksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  mobileProfileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--primary)',
    background: 'var(--primary-light)',
    padding: '10px 12px',
    borderRadius: '8px',
    marginTop: '6px',
  },
  mobileLogoutBtn: {
    width: '100%',
    padding: '10px',
    marginTop: '6px',
  },
};

// Global mobile styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 868px) {
      .desktop-only-nav {
        display: none !important;
      }
      button[aria-label="Toggle navigation menu"] {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Navbar;

