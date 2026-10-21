import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Heart,
  PlusCircle,
  ClipboardList,
  Search,
  Users,
  ShieldCheck,
  Activity,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  PackageCheck,
  History,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard user={user} />;
    case 'beneficiary':
    case 'ngo':
      return <BeneficiaryDashboard user={user} />;
    case 'donor':
    default:
      return <DonorDashboard user={user} />;
  }
};

/* ==========================================================================
   1. DONOR DASHBOARD
   ========================================================================== */
const DonorDashboard = ({ user }) => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, recipients: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const response = await api('/medicines/my-donations');
        if (response.success && response.data) {
          const list = response.data;
          setRecent(list.slice(0, 5));
          
          // Calculate aggregates
          const total = list.length;
          const pending = list.filter(m => m.status === 'pending').length;
          const approved = list.filter(m => m.status === 'approved').length;
          const recipients = list.reduce((sum, m) => sum + (m.recipientCount || 0), 0);
          
          setStats({ total, pending, approved, recipients });
        }
      } catch (err) {
        console.error('Error fetching donor dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonorData();
  }, []);

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      <div style={styles.welcomeRow}>
        <div>
          <h1 style={styles.title}>Donor Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user.name}. Thank you for your contributions!</p>
        </div>
        <Link to="/donate" className="btn btn-primary">
          <PlusCircle size={18} /> Donate Medicine
        </Link>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard} className="card">
          <div style={{ ...styles.statIconContainer, background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Heart size={22} fill="currentColor" />
          </div>
          <div>
            <span style={styles.statLabel}>Total Donated</span>
            <h3 style={styles.statNumber}>{stats.total}</h3>
          </div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={{ ...styles.statIconContainer, background: 'var(--status-pending-bg)', color: 'var(--status-pending)' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Pending Verification</span>
            <h3 style={styles.statNumber}>{stats.pending}</h3>
          </div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={{ ...styles.statIconContainer, background: 'var(--status-approved-bg)', color: 'var(--status-approved)' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Approved Listings</span>
            <h3 style={styles.statNumber}>{stats.approved}</h3>
          </div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={{ ...styles.statIconContainer, background: 'rgba(0, 180, 216, 0.1)', color: 'var(--secondary)' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Beneficiaries Reached</span>
            <h3 style={styles.statNumber}>{stats.recipients}</h3>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div style={styles.dashboardGrid}>
        <div style={styles.mainPanel} className="card">
          <h3 style={styles.panelTitle}>Recent Submissions</h3>
          
          {loading ? (
            <p style={styles.loadingText}>Loading history...</p>
          ) : recent.length === 0 ? (
            <div style={styles.emptyState}>
              <Heart size={40} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
              <p>You haven't donated any medicines yet.</p>
              <Link to="/donate" style={{ marginTop: '10px' }} className="btn btn-secondary btn-sm">Donate First Item</Link>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Expiry Date</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Approved Recipient(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((med) => (
                    <tr key={med._id}>
                      <td style={styles.medName}>{med.name}</td>
                      <td>{new Date(med.expiryDate).toLocaleDateString()}</td>
                      <td>{med.originalQuantity}</td>
                      <td>
                        <span className={`status-badge ${med.status || 'pending'}`}>
                          {(med.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {med.recipientCount > 0 ? (
                          <Link
                            to="/my-donations"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--status-approved)',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              textDecoration: 'underline',
                            }}
                          >
                            <CheckCircle2 size={13} /> {med.recipientCount} NGO Approved ({med.totalAllocatedQuantity} units)
                          </Link>
                        ) : med.status === 'approved' ? (
                          <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>In Stock (0 claims)</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Awaiting Review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recent.length > 0 && (
            <div style={styles.panelFooter}>
              <Link to="/my-donations" style={styles.footerLink}>View All Donations & Impact <ClipboardList size={14} /></Link>
            </div>
          )}
        </div>

        <div style={styles.sidePanel} className="card">
          <h3 style={styles.panelTitle}>Safety Instructions</h3>
          <ul style={styles.bulletList}>
            <li><strong>Sealed Packets:</strong> We only accept medicines in their original sealed blister packs or unopened bottles.</li>
            <li><strong>Expiry Dates:</strong> Medicines must have a minimum shelf life of 60 days before expiring.</li>
            <li><strong>Storage:</strong> Store items in a dry, cool environment before donating.</li>
            <li><strong>Verification:</strong> The administration team verifies each batch. Once approved, verified NGOs can claim them.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   2. BENEFICIARY / NGO DASHBOARD
   ========================================================================== */
const BeneficiaryDashboard = ({ user }) => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, collected: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeneficiaryData = async () => {
      try {
        const response = await api('/requests/my-requests');
        if (response.success && response.data) {
          const list = response.data;
          setRecent(list.slice(0, 5));
          
          // Calculate aggregates
          const total = list.length;
          const pending = list.filter(r => r.status === 'pending').length;
          const approved = list.filter(r => r.status === 'approved').length;
          const collected = list.filter(r => r.status === 'collected').length;
          
          setStats({ total, pending, approved, collected });
        }
      } catch (err) {
        console.error('Error fetching beneficiary dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBeneficiaryData();
  }, []);

  const isPendingNgo = user.status === 'pending';

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      {user.status === 'rejected' && (
        <div style={{ ...styles.alertBanner, background: 'var(--status-rejected-bg)', borderColor: 'rgba(220, 53, 69, 0.2)' }}>
          <AlertCircle size={22} style={{ flexShrink: 0, color: 'var(--status-rejected)' }} />
          <div>
            <h4 style={{ color: 'var(--status-rejected)', marginBottom: '4px' }}>Account Restricted</h4>
            <p style={{ fontSize: '0.9rem', color: 'hsl(354, 70%, 35%)' }}>
              Your account registration was restricted by the administrator. Please contact administration.
            </p>
          </div>
        </div>
      )}

      {isPendingNgo && (
        <div style={{ ...styles.alertBanner, background: 'var(--status-pending-bg)', borderColor: 'rgba(217, 119, 6, 0.3)' }}>
          <Clock size={22} style={{ flexShrink: 0, color: 'var(--status-pending)' }} />
          <div>
            <h4 style={{ color: '#b45309', marginBottom: '4px' }}>Account Pending Admin Approval</h4>
            <p style={{ fontSize: '0.9rem', color: '#92400e' }}>
              Your NGO registration is under review by the administrator. Once approved by admin, full donor contact details and medicine requests will become active.
            </p>
          </div>
        </div>
      )}

      <div style={styles.welcomeRow}>
        <div>
          <h1 style={styles.title}>{user.role === 'ngo' || user.organizationName ? 'NGO Dashboard' : 'Beneficiary Dashboard'}</h1>
          <p style={styles.subtitle}>Welcome, {user.organizationName || user.name}.</p>
        </div>
        <Link
          to="/available-medicines"
          className="btn btn-primary"
        >
          <Search size={18} /> Search & Request Medicines
        </Link>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard} className="card">
          <div style={{ ...styles.statIconContainer, background: 'rgba(0, 180, 216, 0.1)', color: 'var(--secondary)' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Total Requests</span>
            <h3 style={styles.statNumber}>{stats.total}</h3>
          </div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={{ ...styles.statIconContainer, background: 'var(--status-pending-bg)', color: 'var(--status-pending)' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Pending Requests</span>
            <h3 style={styles.statNumber}>{stats.pending}</h3>
          </div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={{ ...styles.statIconContainer, background: 'var(--status-approved-bg)', color: 'var(--status-approved)' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Approved Requests</span>
            <h3 style={styles.statNumber}>{stats.approved}</h3>
          </div>
        </div>

        <div style={styles.statCard} className="card">
          <div style={{ ...styles.statIconContainer, background: 'rgba(15, 165, 124, 0.15)', color: 'var(--primary)' }}>
            <PackageCheck size={22} />
          </div>
          <div>
            <span style={styles.statLabel}>Collected Items</span>
            <h3 style={styles.statNumber}>{stats.collected}</h3>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div style={styles.dashboardGrid}>
        <div style={styles.mainPanel} className="card">
          <h3 style={styles.panelTitle}>Recent Medicine Requests</h3>
          
          {loading ? (
            <p style={styles.loadingText}>Loading history...</p>
          ) : recent.length === 0 ? (
            <div style={styles.emptyState}>
              <ClipboardList size={40} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
              <p>You haven't requested any medicines yet.</p>
              <Link to="/available-medicines" style={{ marginTop: '10px' }} className="btn btn-secondary btn-sm">Browse Inventory</Link>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Batch</th>
                    <th>Requested Qty</th>
                    <th>Request Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((reqItem) => (
                    <tr key={reqItem._id}>
                      <td style={styles.medName}>{reqItem.medicine ? reqItem.medicine.name : 'Deleted Medicine'}</td>
                      <td>{reqItem.medicine ? reqItem.medicine.batchNumber : 'N/A'}</td>
                      <td>{reqItem.quantity}</td>
                      <td>{new Date(reqItem.requestDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${reqItem.status || 'pending'}`}>
                          {(reqItem.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recent.length > 0 && (
            <div style={styles.panelFooter}>
              <Link to="/my-requests" style={styles.footerLink}>View All Requests <ClipboardList size={14} /></Link>
            </div>
          )}
        </div>

        <div style={styles.sidePanel} className="card">
          <h3 style={styles.panelTitle}>Request Process</h3>
          <ul style={styles.bulletList}>
            <li><strong>Select Batch:</strong> Browse the active inventory sorted by expiry priority.</li>
            <li><strong>Specify Quantities:</strong> Request only what you need. Cannot exceed available stock limit.</li>
            <li><strong>Submit Reason:</strong> Explain clinical usage (e.g. disaster camp, free clinic) to assist admin verification.</li>
            <li><strong>Collection:</strong> Once approved, coordinate with the donor details provided in your request file.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. ADMIN DASHBOARD
   ========================================================================== */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await api('/admin/dashboard');
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      <div style={styles.welcomeRow}>
        <div>
          <h1 style={styles.title}>System Control Room</h1>
          <p style={styles.subtitle}>Welcome back, Administrator. Platform telemetry is healthy.</p>
        </div>
        <Link to="/admin/reports" className="btn btn-secondary">
          <FileText size={18} /> System Reports
        </Link>
      </div>

      {loading ? (
        <p style={styles.loadingText}>Fetching database statistics...</p>
      ) : stats ? (
        <>
          {/* Summary Stats Grid */}
          <div style={styles.statsRow}>
            <div style={styles.statCard} className="card">
              <div style={{ ...styles.statIconContainer, background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Users size={22} />
              </div>
              <div>
                <span style={styles.statLabel}>Total Users</span>
                <h3 style={styles.statNumber}>{stats.users.totalUsers}</h3>
                <span style={styles.subStats}>NGOs: {stats.users.beneficiaryCount} ({stats.users.pendingBeneficiaries} pending)</span>
              </div>
            </div>

            <div style={styles.statCard} className="card">
              <div style={{ ...styles.statIconContainer, background: 'rgba(0, 180, 216, 0.1)', color: 'var(--secondary)' }}>
                <Activity size={22} />
              </div>
              <div>
                <span style={styles.statLabel}>Total Donations</span>
                <h3 style={styles.statNumber}>{stats.donations.totalDonations}</h3>
                <span style={styles.subStats}>Pending verification: <strong style={{ color: 'var(--status-pending)' }}>{stats.donations.pendingDonations}</strong></span>
              </div>
            </div>

            <div style={styles.statCard} className="card">
              <div style={{ ...styles.statIconContainer, background: 'var(--status-approved-bg)', color: 'var(--status-approved)' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <span style={styles.statLabel}>Redistribution Requests</span>
                <h3 style={styles.statNumber}>{stats.requests.totalRequests}</h3>
                <span style={styles.subStats}>
                  Pending: <strong style={{ color: 'var(--status-pending)' }}>{stats.requests.pendingRequests}</strong> • Collected: <strong style={{ color: 'var(--status-approved)' }}>{stats.requests.collectedRequests || 0}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Admin Navigation Grid */}
          <div style={{ ...styles.dashboardGrid, gridTemplateColumns: '1fr 1fr' }}>
            <div style={styles.mainPanel} className="card">
              <h3 style={styles.panelTitle}>Pending Administrative Review</h3>
              
              <div style={styles.adminActionList}>
                {stats.donations.pendingDonations > 0 ? (
                  <div style={styles.alertItem}>
                    <AlertCircle size={18} color="var(--status-pending)" />
                    <span><strong>{stats.donations.pendingDonations}</strong> medicine donations are pending verification.</span>
                    <Link to="/admin/verify-donations" style={styles.alertActionLink}>Verify Now</Link>
                  </div>
                ) : (
                  <div style={styles.noAlertItem}>
                    <ShieldCheck size={18} color="var(--status-approved)" />
                    <span>All donated medicine records are processed.</span>
                  </div>
                )}

                {stats.requests.pendingRequests > 0 ? (
                  <div style={styles.alertItem}>
                    <AlertCircle size={18} color="var(--status-pending)" />
                    <span><strong>{stats.requests.pendingRequests}</strong> beneficiary requests are awaiting approval.</span>
                    <Link to="/admin/verify-requests" style={styles.alertActionLink}>Process Now</Link>
                  </div>
                ) : (
                  <div style={styles.noAlertItem}>
                    <ShieldCheck size={18} color="var(--status-approved)" />
                    <span>No pending beneficiary requests.</span>
                  </div>
                )}

                {stats.users.pendingBeneficiaries > 0 ? (
                  <div style={styles.alertItem}>
                    <AlertCircle size={18} color="var(--status-pending)" />
                    <span><strong>{stats.users.pendingBeneficiaries}</strong> registered NGOs require credentials review.</span>
                    <Link to="/admin/users" style={styles.alertActionLink}>Review NGOs</Link>
                  </div>
                ) : (
                  <div style={styles.noAlertItem}>
                    <ShieldCheck size={18} color="var(--status-approved)" />
                    <span>All NGO registration reviews completed.</span>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.sidePanel} className="card">
              <h3 style={styles.panelTitle}>Platform Operations Summary</h3>
              <p style={{ marginBottom: '15px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Quick links to navigate admin utilities:
              </p>
              <div style={styles.adminQuickLinks}>
                <Link to="/admin/verify-donations" style={styles.quickLinkItem}>
                  <Heart size={18} /> Verify Medicine Records
                </Link>
                <Link to="/admin/donation-history" style={styles.quickLinkItem}>
                  <History size={18} /> Successful Donation History
                </Link>
                <Link to="/admin/verify-requests" style={styles.quickLinkItem}>
                  <ClipboardList size={18} /> Approve / Reject Requests
                </Link>
                <Link to="/admin/users" style={styles.quickLinkItem}>
                  <Users size={18} /> Manage Registered Users
                </Link>
                <Link to="/admin/reports" style={styles.quickLinkItem}>
                  <FileText size={18} /> System Reports & Audit Trail
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Unable to retrieve platform data.</p>
      )}
    </div>
  );
};

/* ==========================================================================
   CSS-in-JS Styles (Rich healthcare elements)
   ========================================================================== */
const styles = {
  dashboardContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  alertBanner: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    background: 'var(--status-pending-bg)',
    border: '1px solid rgba(217, 119, 6, 0.2)',
    padding: '16px 20px',
    borderRadius: '12px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    padding: '24px',
  },
  statIconContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: '2px',
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'hsl(210, 24%, 12%)',
  },
  subStats: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.6fr',
    gap: '24px',
  },
  mainPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  panelTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '20px',
    color: 'hsl(210, 24%, 12%)',
  },
  loadingText: {
    color: 'var(--text-muted)',
    padding: '30px 0',
    textAlign: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--text-muted)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  medName: {
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  panelFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    marginTop: 'auto',
    textAlign: 'right',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--primary)',
    fontWeight: 700,
    fontSize: '0.9rem',
  },
  sidePanel: {
    background: 'var(--primary-light)',
    borderColor: 'rgba(15, 165, 124, 0.1)',
  },
  bulletList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    fontSize: '0.88rem',
    color: 'hsl(210, 20%, 30%)',
  },
  // Admin dashboard elements
  adminActionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'hsl(38, 92%, 97%)',
    border: '1px solid rgba(217, 119, 6, 0.15)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.88rem',
  },
  noAlertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'hsl(142, 72%, 97%)',
    border: '1px solid rgba(40, 167, 69, 0.1)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    color: 'hsl(142, 72%, 25%)',
  },
  alertActionLink: {
    marginLeft: 'auto',
    color: 'var(--primary)',
    fontWeight: 700,
    textDecoration: 'underline',
  },
  adminQuickLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  quickLinkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: '#fff',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
};

// Fix table styling globally for the dashboard context
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    table th, table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    table th {
      font-weight: 700;
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .quickLinkItem:hover {
      border-color: var(--primary) !important;
      color: var(--primary) !important;
      background: var(--primary-light) !important;
    }
  `;
  document.head.appendChild(style);
}

export default Dashboard;
