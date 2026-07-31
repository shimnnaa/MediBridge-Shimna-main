import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Clock, Phone, Mail, User, HelpCircle, CheckCircle } from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api('/requests/my-requests');
        if (response.success && response.data) {
          setRequests(response.data);
        }
      } catch (err) {
        console.error('Error fetching my requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.container}>
        <div style={styles.backRow}>
          <Link to="/dashboard" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>My Requests</h1>
          <p style={styles.subtitle}>Track status of requests submitted for pharmacy inventory.</p>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Fetching your requests...</p>
        ) : requests.length === 0 ? (
          <div style={styles.emptyState} className="card">
            <Clock size={44} color="var(--text-muted)" />
            <h4>No Requests Found</h4>
            <p>You haven't requested any medicines yet.</p>
            <Link to="/available-medicines" style={{ marginTop: '10px' }} className="btn btn-primary">
              Browse Available Inventory
            </Link>
          </div>
        ) : (
          <div className="card" style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Batch</th>
                    <th>Expiry Date</th>
                    <th>Qty Requested</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Donor Contacts (If Approved)</th>
                    <th>Admin Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((reqItem) => {
                    const medicine = reqItem.medicine || {};
                    const donor = medicine.donor || {};
                    const isApproved = reqItem.status === 'approved';

                    return (
                      <tr key={reqItem._id}>
                        <td style={styles.medName}>{medicine.name || 'Deleted Medicine'}</td>
                        <td><code>{medicine.batchNumber || 'N/A'}</code></td>
                        <td>{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}</td>
                        <td>{reqItem.quantity}</td>
                        <td>{new Date(reqItem.requestDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${reqItem.status}`}>
                            {reqItem.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.contactCell}>
                          {isApproved ? (
                            <div style={styles.donorInfoBox}>
                              <div style={styles.infoRow}><User size={12} /> <span>{donor.name || 'N/A'}</span></div>
                              {donor.phone && <div style={styles.infoRow}><Phone size={12} /> <span>{donor.phone}</span></div>}
                              {donor.email && <div style={styles.infoRow}><Mail size={12} /> <a href={`mailto:${donor.email}`} style={styles.mailLink}>{donor.email}</a></div>}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Visible upon approval</span>
                          )}
                        </td>
                        <td style={styles.remarksCell}>
                          {reqItem.status === 'pending' && 'Awaiting administrative verification.'}
                          {reqItem.status === 'rejected' && (
                            <span style={{ color: 'var(--status-rejected)' }}>
                              <strong>Reason:</strong> {reqItem.adminRemarks || 'Clinical justification unsufficient.'}
                            </span>
                          )}
                          {isApproved && (reqItem.adminRemarks || 'Approved. Please coordinate collection using donor contacts.')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  backRow: {
    display: 'flex',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  header: {
    marginBottom: '10px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  loadingText: {
    textAlign: 'center',
    padding: '50px 0',
    color: 'var(--text-muted)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--text-muted)',
  },
  tableCard: {
    padding: '10px 0',
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
  contactCell: {
    minWidth: '180px',
  },
  donorInfoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    background: 'var(--primary-light)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(15, 165, 124, 0.1)',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: 'hsl(210, 20%, 30%)',
    fontWeight: 600,
  },
  mailLink: {
    color: 'var(--primary)',
    textDecoration: 'underline',
  },
  remarksCell: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    maxWidth: '260px',
  },
};

export default MyRequests;
