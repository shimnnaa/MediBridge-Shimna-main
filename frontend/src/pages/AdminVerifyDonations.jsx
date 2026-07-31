import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Clock, Calendar, Check, X, ShieldAlert, AlertCircle, FileText } from 'lucide-react';

const AdminVerifyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Decision Modal State
  const [selectedMed, setSelectedMed] = useState(null);
  const [decision, setDecision] = useState(''); // 'approved' or 'rejected'
  const [remarks, setRemarks] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPendingDonations = async () => {
    setLoading(true);
    try {
      // Fetch all donations with 'pending' status
      const response = await api('/admin/donations?status=pending');
      if (response.success && response.data) {
        setDonations(response.data);
      }
    } catch (err) {
      console.error('Error fetching pending donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  const handleOpenDecisionModal = (med, status) => {
    setSelectedMed(med);
    setDecision(status);
    setRemarks('');
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setSelectedMed(null);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api(`/admin/donations/${selectedMed._id}/verify`, {
        method: 'PUT',
        body: {
          status: decision,
          remarks: remarks.trim(),
        },
      });

      if (response.success) {
        setSuccess(`Medicine has been successfully ${decision}!`);
        fetchPendingDonations();
        
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update donation verification status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.container}>
        <div style={styles.backRow}>
          <Link to="/dashboard" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Verify Medicine Donations</h1>
          <p style={styles.subtitle}>Review batch records, manufacturers, and expiry dates to approve listings.</p>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Fetching pending records...</p>
        ) : donations.length === 0 ? (
          <div style={styles.emptyState} className="card">
            <Check size={44} color="var(--primary)" />
            <h4>All Caught Up!</h4>
            <p>There are no medicine donations awaiting verification.</p>
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
                    <th>Qty</th>
                    <th>Donor Name</th>
                    <th>Phone / Email</th>
                    <th>Verification Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((med) => {
                    const donor = med.donor || {};
                    const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const isSoonExpiring = daysLeft < 60;

                    return (
                      <tr key={med._id}>
                        <td style={styles.medName}>
                          <div>{med.name}</div>
                          <span style={styles.conditionText}>{med.condition}</span>
                        </td>
                        <td>{med.manufacturer}</td>
                        <td><code>{med.batchNumber}</code></td>
                        <td>
                          <span style={isSoonExpiring ? { color: 'var(--status-rejected)', fontWeight: 'bold' } : {}}>
                            {new Date(med.expiryDate).toLocaleDateString()}
                          </span>
                          {isSoonExpiring && (
                            <span style={styles.soonBadge}>Soon</span>
                          )}
                        </td>
                        <td>{med.quantity}</td>
                        <td>{donor.name || 'N/A'}</td>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>
                            <div>{donor.phone}</div>
                            <a href={`mailto:${donor.email}`} style={{ color: 'var(--primary)' }}>{donor.email}</a>
                          </div>
                        </td>
                        <td>
                          <div style={styles.actionBtnGroup}>
                            <button
                              onClick={() => handleOpenDecisionModal(med, 'approved')}
                              className="btn btn-primary btn-sm"
                              style={styles.approveBtn}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleOpenDecisionModal(med, 'rejected')}
                              className="btn btn-danger btn-sm"
                              style={styles.rejectBtn}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
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

      {/* Decision Modal */}
      {selectedMed && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent} className="card animate-fade-in">
            <div style={styles.modalHeader}>
              <h3>Verify: {selectedMed.name}</h3>
              <button onClick={handleCloseModal} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{
                ...styles.decisionAlert,
                background: decision === 'approved' ? 'var(--status-approved-bg)' : 'var(--status-rejected-bg)',
                color: decision === 'approved' ? 'var(--status-approved)' : 'var(--status-rejected)',
                borderColor: decision === 'approved' ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)',
              }}>
                <ShieldAlert size={18} />
                <span>You are marking this medicine as <strong>{decision.toUpperCase()}</strong>.</span>
              </div>

              {error && <div style={styles.errorAlert}>{error}</div>}
              {success && <div style={styles.successAlert}>{success}</div>}

              <form onSubmit={handleVerifySubmit} style={styles.modalForm}>
                <div className="form-group">
                  <label htmlFor="remarks">Administrative Notes / Remarks</label>
                  <textarea
                    id="remarks"
                    placeholder={decision === 'approved'
                      ? "e.g. Batch verified. Expiry is compliant. Listing approved."
                      : "e.g. Rejected due to shelf life remaining being less than 30 days."}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="form-control"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    disabled={submitting || success}
                  />
                </div>

                <div style={styles.modalCta}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={submitting}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      background: decision === 'approved' ? 'var(--status-approved)' : 'var(--status-rejected)',
                      color: '#fff',
                    }}
                    disabled={submitting || success}
                  >
                    {submitting ? 'Processing...' : `Confirm ${decision === 'approved' ? 'Approval' : 'Rejection'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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
  conditionText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'block',
    fontWeight: 'normal',
  },
  soonBadge: {
    background: 'var(--status-pending-bg)',
    color: 'var(--status-pending)',
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '6px',
    fontWeight: 'bold',
  },
  actionBtnGroup: {
    display: 'flex',
    gap: '8px',
  },
  approveBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
  },
  rejectBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
  },
  // Modal
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px',
  },
  modalContent: {
    maxWidth: '460px',
    width: '100%',
    background: '#fff',
    padding: '24px',
    boxShadow: 'var(--shadow-lg)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
    marginBottom: '18px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  decisionAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid transparent',
    fontSize: '0.88rem',
    marginBottom: '18px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  modalCta: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  errorAlert: {
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '14px',
  },
  successAlert: {
    background: 'var(--status-approved-bg)',
    color: 'var(--status-approved)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '14px',
  },
};

export default AdminVerifyDonations;
