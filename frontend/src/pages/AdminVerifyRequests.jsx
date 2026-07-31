import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Clock, Calendar, Check, X, ShieldAlert, AlertCircle } from 'lucide-react';

const AdminVerifyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [decision, setDecision] = useState(''); // 'approved' or 'rejected'
  const [remarks, setRemarks] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await api('/admin/requests?status=pending');
      if (response.success && response.data) {
        setRequests(response.data);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleOpenDecisionModal = (reqItem, status) => {
    setSelectedReq(reqItem);
    setDecision(status);
    setRemarks('');
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setSelectedReq(null);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api(`/admin/requests/${selectedReq._id}/verify`, {
        method: 'PUT',
        body: {
          status: decision,
          adminRemarks: remarks.trim(),
        },
      });

      if (response.success) {
        setSuccess(`Request has been successfully ${decision}!`);
        fetchPendingRequests();

        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update request verification status.');
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
          <h1 style={styles.title}>Manage Medicine Requests</h1>
          <p style={styles.subtitle}>Review clinical requests from verified beneficiaries and allocate stock.</p>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Fetching pending requests...</p>
        ) : requests.length === 0 ? (
          <div style={styles.emptyState} className="card">
            <Check size={44} color="var(--primary)" />
            <h4>No Pending Requests</h4>
            <p>All beneficiary medicine requests have been processed.</p>
          </div>
        ) : (
          <div className="card" style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Medicine Details</th>
                    <th>Available Stock</th>
                    <th>Requested Qty</th>
                    <th>Requester (NGO)</th>
                    <th>Requested Date</th>
                    <th>Reason for Request</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((reqItem) => {
                    const medicine = reqItem.medicine || {};
                    const requester = reqItem.requester || {};
                    const isStockInsufficient = (medicine.quantity || 0) < reqItem.quantity;

                    return (
                      <tr key={reqItem._id}>
                        <td style={styles.medCell}>
                          <div style={styles.medName}>{medicine.name || 'Deleted Medicine'}</div>
                          <span style={styles.detailText}>Batch: <code>{medicine.batchNumber}</code> | Expiry: {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}</span>
                        </td>
                        <td>
                          <span style={isStockInsufficient ? { color: 'var(--status-rejected)', fontWeight: 'bold' } : {}}>
                            {medicine.quantity || 0} unit(s)
                          </span>
                          {isStockInsufficient && (
                            <span style={styles.shortageBadge}>Shortage</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 800 }}>{reqItem.quantity}</td>
                        <td>
                          <div style={styles.ngoName}>{requester.organizationName || requester.name}</div>
                          <span style={styles.detailText}>Reg: {requester.registrationNumber || 'Individual'}</span>
                        </td>
                        <td>{new Date(reqItem.requestDate).toLocaleDateString()}</td>
                        <td style={styles.reasonCell}>{reqItem.reason}</td>
                        <td>
                          <div style={styles.actionBtnGroup}>
                            <button
                              onClick={() => handleOpenDecisionModal(reqItem, 'approved')}
                              className="btn btn-primary btn-sm"
                              style={styles.approveBtn}
                              disabled={isStockInsufficient}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleOpenDecisionModal(reqItem, 'rejected')}
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
      {selectedReq && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent} className="card animate-fade-in">
            <div style={styles.modalHeader}>
              <h3>Verify Request</h3>
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
                <span>You are marking this request as <strong>{decision.toUpperCase()}</strong>.</span>
              </div>

              {decision === 'approved' && (
                <div style={styles.stockNotice}>
                  <AlertCircle size={16} color="var(--primary)" />
                  <p style={{ fontSize: '0.82rem', color: 'hsl(162, 80%, 20%)' }}>
                    Confirming approval will automatically decrement <strong>{selectedReq.quantity}</strong> units from the stock of <strong>{selectedReq.medicine?.name}</strong>.
                  </p>
                </div>
              )}

              {error && <div style={styles.errorAlert}>{error}</div>}
              {success && <div style={styles.successAlert}>{success}</div>}

              <form onSubmit={handleVerifySubmit} style={styles.modalForm}>
                <div className="form-group">
                  <label htmlFor="remarks">Administrative Notes / Remarks</label>
                  <textarea
                    id="remarks"
                    placeholder={decision === 'approved'
                      ? "e.g. Request approved. Clinic has validated registration."
                      : "e.g. Request rejected. Reason for request did not specify clinic details."}
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
  medCell: {
    minWidth: '220px',
  },
  medName: {
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  ngoName: {
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  detailText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'block',
  },
  reasonCell: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    maxWidth: '220px',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },
  shortageBadge: {
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    fontSize: '0.68rem',
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
    marginBottom: '14px',
  },
  stockNotice: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    background: 'var(--primary-light)',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '18px',
    border: '1px solid rgba(15,165,124,0.1)',
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

export default AdminVerifyRequests;
