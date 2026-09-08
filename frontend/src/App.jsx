import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Donate from './pages/Donate';
import MyDonations from './pages/MyDonations';
import AvailableMedicines from './pages/AvailableMedicines';
import MyRequests from './pages/MyRequests';
import Profile from './pages/Profile';
import AdminVerifyDonations from './pages/AdminVerifyDonations';
import AdminVerifyRequests from './pages/AdminVerifyRequests';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading session status...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If the user's role is not authorized, send back to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// URL Hash Watcher to instantly redirect when #admin is present in URL
function AdminHashWatcher() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleHash = () => {
      const hash = (window.location.hash || location.hash || '').toLowerCase();
      const adminHashes = [
        '#admin',
        '#/admin',
        '#admin-login',
        '#/admin-login',
        '#adminlogin',
        '#/adminlogin',
        '#admin/login',
        '#/admin/login',
      ];

      const matchesAdmin =
        adminHashes.includes(hash) ||
        hash.startsWith('#admin/') ||
        hash.startsWith('#/admin/') ||
        hash.startsWith('#admin?') ||
        hash.startsWith('#/admin?');

      if (
        matchesAdmin &&
        location.pathname !== '/admin/login' &&
        location.pathname !== '/admin' &&
        location.pathname !== '/admin-login'
      ) {
        // Direct to admin login page
        navigate('/admin/login', { replace: false });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [location, navigate]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminAuthRoute =
    location.pathname === '/admin/login' ||
    location.pathname === '/admin' ||
    location.pathname === '/admin-login';

  return (
    <div className="app-container">
      <AdminHashWatcher />
      {!isAdminAuthRoute && <Navbar />}
      <main className="main-content" style={isAdminAuthRoute ? { padding: 0 } : {}}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Private Routes (All Roles) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Donor Specific Routes */}
          <Route
            path="/donate"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <Donate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-donations"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <MyDonations />
              </ProtectedRoute>
            }
          />

          {/* Beneficiary/NGO Specific Routes */}
          <Route
            path="/available-medicines"
            element={
              <ProtectedRoute allowedRoles={['beneficiary', 'ngo']}>
                <AvailableMedicines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute allowedRoles={['beneficiary', 'ngo']}>
                <MyRequests />
              </ProtectedRoute>
            }
          />

          {/* Admin Specific Routes */}
          <Route
            path="/admin/verify-donations"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminVerifyDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verify-requests"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminVerifyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminAuthRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const styles = {
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-primary)',
  },
};

export default App;

