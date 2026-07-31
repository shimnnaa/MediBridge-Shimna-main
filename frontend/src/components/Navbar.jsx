import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, User, PlusCircle, Search, ClipboardList, ShieldAlert, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <Heart size={20} fill="currentColor" />
          </div>
          <span style={styles.logoText}>Medi<span style={styles.logoAccent}>Bridge</span></span>
        </Link>

        <div style={styles.navLinks}>
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

              {/* Beneficiary specific links */}
              {user.role === 'beneficiary' && (
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
                  <Link to="/admin/verify-requests" style={styles.link}>
                    <ClipboardList size={16} /> Requests
                  </Link>
                  <Link to="/admin/users" style={styles.link}>
                    <Users size={16} /> Users
                  </Link>
                  <Link to="/admin/reports" style={styles.link}>
                    Report
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
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '0 24px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.95rem',
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
    fontSize: '0.9rem',
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
};

export default Navbar;
