import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Clock, Calendar, HelpCircle, Heart } from 'lucide-react';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await api('/medicines/my-donations');
        if (response.success && response.data) {
          setDonations(response.data);
        }
      } catch (err) {
        console.error('Error fetching my donations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
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
          <h1 style={styles.title}>My Donations</h1>
          <p style={styles.subtitle}>Track the status and history of your medicine donations.</p>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Fetching your donation ledger...</p>
        ) : donations.length === 0 ? (
          <div style={styles.emptyState} className="card">
            <Heart size={44} color="var(--text-muted)" />
            <h4>No Donations Recorded</h4>
            <p>You haven't submitted any medicine donations yet.</p>
            <Link to="/donate" style={{ marginTop: '10px' }} className="btn btn-primary">
              Make Your First Donation
            </Link>
          </div>
        ) : (
          <div className="card" style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Manufacturer</th>
                    <th>Batch</th>
                    <th>Expiry Date</th>
                    <th>Qty Submitted</th>
                    <th>Qty Remaining</th>
                    <th>Status</th>
                    <th>Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((med) => (
                    <tr key={med._id}>
                      <td style={styles.medName}>{med.name}</td>
                      <td>{med.manufacturer}</td>
                      <td><code>{med.batchNumber}</code></td>
                      <td>{new Date(med.expiryDate).toLocaleDateString()}</td>
                      <td>{med.originalQuantity}</td>
                      <td>{med.quantity}</td>
                      <td>
                        <span className={`status-badge ${med.status}`}>
                          {med.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.remarksCell}>
                        {med.status === 'pending' && 'Awaiting administrative verification check.'}
                        {med.status === 'approved' && (med.verificationDetails?.remarks || 'Approved and listed for NGO claims.')}
                        {med.status === 'rejected' && (
                          <span style={{ color: 'var(--status-rejected)' }}>
                            <strong>Rejected:</strong> {med.verificationDetails?.remarks || 'Does not meet safety criteria.'}
                          </span>
                        )}
                        {med.status === 'claimed' && 'Completely distributed to verified NGOs.'}
                      </td>
                    </tr>
                  ))}
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
  remarksCell: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    maxWidth: '300px',
  },
};

export default MyDonations;
