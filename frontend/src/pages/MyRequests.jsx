import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  ArrowLeft,
  Clock,
  Phone,
  Mail,
  User,
  MapPin,
  ShieldCheck,
  Lock,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  X,
} from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectModalReq, setCollectModalReq] = useState(null);
  const [collecting, setCollecting] = useState(false);
  const [collectError, setCollectError] = useState('');
  const [collectSuccess, setCollectSuccess] = useState('');

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

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenCollectModal = (reqItem) => {
    setCollectModalReq(reqItem);
    setCollectError('');
    setCollectSuccess('');
  };

  const handleCloseCollectModal = () => {
    setCollectModalReq(null);
    setCollectError('');
    setCollectSuccess('');
  };

  const handleConfirmCollection = async () => {
    if (!collectModalReq) return;
    setCollecting(true);
    setCollectError('');
    setCollectSuccess('');

    try {
      const response = await api(`/requests/${collectModalReq._id}/collect`, {
        method: 'PUT',
      });

      if (response.success) {
        setCollectSuccess('Medicine collection confirmed! Stock has been updated in the medicine collection.');
        await fetchRequests();
        setTimeout(() => {
          handleCloseCollectModal();
        }, 1800);
      } else {
        setCollectError(response.message || 'Failed to update collection status.');
      }
    } catch (err) {
      setCollectError(err.message || 'Error occurred while confirming collection.');
    } finally {
      setCollecting(false);
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
                    <th>Donor Contacts (After Admin Approval)</th>
                    <th>Collection Action</th>
                    <th>Admin Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((reqItem) => {
                    const medicine = reqItem.medicine || {};
                    const donor = medicine.donor || {};
                    const isApproved = reqItem.status === 'approved';
                    const isCollected = reqItem.status === 'collected';
                    const isApprovedOrCollected = isApproved || isCollected;
                    const requestDateStr = reqItem.requestDate || reqItem.createdAt;
                    const formattedDate = requestDateStr ? new Date(requestDateStr).toLocaleDateString() : 'N/A';

                    return (
                      <tr key={reqItem._id}>
                        <td style={styles.medName}>{medicine.name || 'Deleted Medicine'}</td>
                        <td><code>{medicine.batchNumber || 'N/A'}</code></td>
                        <td>{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}</td>
                        <td>{reqItem.quantity}</td>
                        <td>{formattedDate}</td>
                        <td>
                          {isCollected ? (
                            <span className="status-badge approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> COLLECTED
                            </span>
                          ) : (
                            <span className={`status-badge ${reqItem.status || 'pending'}`}>
                              {(reqItem.status || 'pending').toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td style={styles.contactCell}>
                          {isApprovedOrCollected ? (
                            <div style={styles.donorInfoBox}>
                              <div style={styles.donorHeaderRow}>
                                <ShieldCheck size={13} color="var(--primary)" />
                                <span style={styles.donorHeaderTitle}>Admin Approved Contact</span>
                              </div>
                              <div style={styles.infoRow}>
                                <User size={12} color="var(--primary)" />
                                <strong>{donor.name || 'Registered Donor'}</strong>
                              </div>
                              {donor.phone && (
                                <div style={styles.infoRow}>
                                  <Phone size={12} color="var(--primary)" />
                                  <a href={`tel:${donor.phone}`} style={styles.phoneLink} title="Call donor">
                                    {donor.phone}
                                  </a>
                                </div>
                              )}
                              {donor.email && (
                                <div style={styles.infoRow}>
                                  <Mail size={12} color="var(--primary)" />
                                  <a href={`mailto:${donor.email}`} style={styles.mailLink} title="Email donor">
                                    {donor.email}
                                  </a>
                                </div>
                              )}
                              {donor.address && (
                                <div style={styles.infoRow}>
                                  <MapPin size={12} color="var(--primary)" />
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{donor.address}</span>
                                </div>
                              )}
                            </div>
                          ) : reqItem.status === 'pending' ? (
                            <div style={styles.pendingContactBox}>
                              <div style={styles.pendingContactHeader}>
                                <Lock size={12} color="#d97706" />
                                <span style={styles.pendingContactTitle}>Visible After Admin Approval</span>
                              </div>
                              <span style={styles.pendingContactSub}>Awaiting admin verification</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not accessible (Request rejected)</span>
                          )}
                        </td>

                        {/* Collection Action Column */}
                        <td style={styles.actionCell}>
                          {isApproved ? (
                            <button
                              onClick={() => handleOpenCollectModal(reqItem)}
                              style={styles.collectBtn}
                              title="Click to notify that you have collected this medicine"
                            >
                              <PackageCheck size={14} />
                              <span>Mark as Collected</span>
                            </button>
                          ) : isCollected ? (
                            <div style={styles.collectedTag}>
                              <CheckCircle2 size={15} color="var(--status-approved)" />
                              <div>
                                <strong style={{ color: 'var(--status-approved)', display: 'block', fontSize: '0.82rem' }}>
                                  Collected
                                </strong>
                                <span style={styles.collectedDateText}>
                                  {reqItem.collectedAt ? new Date(reqItem.collectedAt).toLocaleDateString() : 'Done'}
                                </span>
                              </div>
                            </div>
                          ) : reqItem.status === 'pending' ? (
                            <span style={styles.subtleText}>Awaiting Review</span>
                          ) : (
                            <span style={styles.subtleText}>-</span>
                          )}
                        </td>

                        <td style={styles.remarksCell}>
                          {reqItem.status === 'pending' && 'Awaiting administrative verification.'}
                          {reqItem.status === 'rejected' && (
                            <span style={{ color: 'var(--status-rejected)' }}>
                              <strong>Reason:</strong> {reqItem.adminRemarks || 'Clinical justification insufficient.'}
                            </span>
                          )}
                          {isApproved && (reqItem.adminRemarks || 'Approved. Please coordinate collection using donor contacts.')}
                          {isCollected && 'Medicine successfully collected from donor.'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal to Confirm Medicine Collection */}
        {collectModalReq && (
          <div style={styles.modalBackdrop} onClick={handleCloseCollectModal}>
            <div style={styles.modalContent} className="card animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PackageCheck size={22} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Confirm Medicine Collection</h3>
                </div>
                <button onClick={handleCloseCollectModal} style={styles.closeBtn} disabled={collecting} aria-label="Close modal">
                  <X size={20} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Please confirm that you have physically collected the approved medicines. This will notify the system and update the inventory in the medicine collection.
                </p>

                <div style={styles.modalSummaryBox}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Medicine:</span>
                    <strong>{collectModalReq.medicine?.name || 'Medicine'}</strong>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Batch Number:</span>
                    <code>{collectModalReq.medicine?.batchNumber || 'N/A'}</code>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Quantity Collected:</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{collectModalReq.quantity} unit(s)</strong>
                  </div>
                  {collectModalReq.medicine?.donor && (
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>Donor:</span>
                      <span>{collectModalReq.medicine.donor.name || 'Registered Donor'}</span>
                    </div>
                  )}
                </div>

                {collectError && (
                  <div style={styles.errorAlert}>
                    <AlertCircle size={16} />
                    <span>{collectError}</span>
                  </div>
                )}

                {collectSuccess && (
                  <div style={styles.successAlert}>
                    <CheckCircle2 size={16} />
                    <span>{collectSuccess}</span>
                  </div>
                )}

                <div style={styles.modalCta}>
                  <button
                    type="button"
                    onClick={handleCloseCollectModal}
                    className="btn btn-secondary"
                    disabled={collecting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCollection}
                    className="btn btn-primary"
                    disabled={collecting || collectSuccess}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <PackageCheck size={16} />
                    {collecting ? 'Confirming...' : 'Yes, Medicine Collected'}
                  </button>
                </div>
              </div>
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
    border: '1px solid rgba(15, 165, 124, 0.2)',
  },
  donorHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--primary)',
    marginBottom: '2px',
  },
  donorHeaderTitle: {
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: 'hsl(210, 20%, 30%)',
    fontWeight: 600,
  },
  phoneLink: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: 600,
  },
  mailLink: {
    color: 'var(--primary)',
    textDecoration: 'underline',
  },
  pendingContactBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    background: '#fffbeb',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(217, 119, 6, 0.2)',
  },
  pendingContactHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  pendingContactTitle: {
    fontSize: '0.76rem',
    fontWeight: 700,
    color: '#92400e',
  },
  pendingContactSub: {
    fontSize: '0.72rem',
    color: '#b45309',
  },
  remarksCell: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    maxWidth: '260px',
  },
  actionCell: {
    minWidth: '150px',
  },
  collectBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(15, 165, 124, 0.25)',
  },
  collectedTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--status-approved-bg)',
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(40, 167, 69, 0.2)',
  },
  collectedDateText: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    display: 'block',
  },
  subtleText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  // Modal styles
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    maxWidth: '480px',
    width: '100%',
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  modalSummaryBox: {
    background: 'hsl(210, 20%, 98%)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.88rem',
  },
  summaryLabel: {
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  modalCta: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '6px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--status-approved-bg)',
    color: 'var(--status-approved)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
};

export default MyRequests;
