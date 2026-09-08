import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Search, AlertCircle, Clock, HelpCircle, X, User, Phone, Mail, MapPin, ShieldCheck, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

const AvailableMedicines = () => {
  const { user } = useAuth();
  const isRejected = user?.status === 'rejected';
  const isPending = user?.status === 'pending';
  const isBeneficiaryOrNgo = user?.role === 'beneficiary' || user?.role === 'ngo';
  const isApprovedNgo = isBeneficiaryOrNgo && (user?.status === 'approved' || user?.status === 'active');
  const isAdmin = user?.role === 'admin';
  const canViewDonorContact = isAdmin || isApprovedNgo;

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [selectedMed, setSelectedMed] = useState(null);
  const [reqQty, setReqQty] = useState(1);
  const [reason, setReason] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMedicines = async (searchQuery = '') => {
    setLoading(true);
    try {
      const endpoint = searchQuery ? `/medicines/available?search=${encodeURIComponent(searchQuery)}` : '/medicines/available';
      const response = await api(endpoint);
      if (response.success && response.data) {
        setMedicines(response.data);
      }
    } catch (err) {
      console.error('Error fetching available medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedMed && !submitting) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMed, submitting]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMedicines(search);
  };

  const handleOpenRequestModal = (medicine) => {
    if (isRejected) return;
    setSelectedMed(medicine);
    setReqQty(1);
    setReason('');
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setSelectedMed(null);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRejected) {
      setError('Your account is restricted. You cannot submit medicine requests.');
      return;
    }

    if (!reqQty || reqQty <= 0) {
      setError('Please request a valid quantity.');
      return;
    }

    if (reqQty > selectedMed.quantity) {
      setError(`Cannot exceed available quantity (${selectedMed.quantity}).`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason or medical purpose for this request.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api('/requests', {
        method: 'POST',
        body: {
          medicineId: selectedMed._id,
          quantity: parseInt(reqQty),
          reason: reason.trim(),
        },
      });

      if (response.success) {
        setSuccess('Medicine request submitted successfully! Pending admin approval.');
        
        // Confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#0fa57c', '#00b4d8']
        });

        // Refresh list
        fetchMedicines(search);

        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page} className="animate-fade-in">
      {isRejected && (
        <div style={{ ...styles.alertBanner, background: 'var(--status-rejected-bg)', borderColor: 'rgba(220, 53, 69, 0.2)' }}>
          <AlertCircle size={22} style={{ flexShrink: 0, color: 'var(--status-rejected)' }} />
          <div>
            <h4 style={{ color: 'var(--status-rejected)', marginBottom: '4px' }}>Account Restricted</h4>
            <p style={{ fontSize: '0.9rem', color: 'hsl(354, 70%, 35%)' }}>
              Your account has been restricted by the administrator. Please contact support.
            </p>
          </div>
        </div>
      )}

      {isPending && isBeneficiaryOrNgo && (
        <div style={{ ...styles.alertBanner, background: 'var(--status-pending-bg)', borderColor: 'rgba(217, 119, 6, 0.3)' }}>
          <Clock size={22} style={{ flexShrink: 0, color: 'var(--status-pending)' }} />
          <div>
            <h4 style={{ color: '#b45309', marginBottom: '4px' }}>NGO Registration Under Review</h4>
            <p style={{ fontSize: '0.9rem', color: '#92400e' }}>
              Your NGO account is currently pending administrative verification. Donor contact details will become visible once your account receives approval from an administrator.
            </p>
          </div>
        </div>
      )}

      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Available Medicines</h1>
          <p style={styles.subtitle}>Browse verified unexpired medicines and submit requests for your patients.</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search medicines by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={styles.searchBtn}>Search</button>
      </form>

      {loading ? (
        <p style={styles.loadingText}>Searching available medicine stock...</p>
      ) : medicines.length === 0 ? (
        <div style={styles.emptyState} className="card">
          <HelpCircle size={48} color="var(--text-muted)" />
          <h4>No Medicines Found</h4>
          <p>There are currently no medicines matching your query or approved in the database.</p>
          <button onClick={() => { setSearch(''); fetchMedicines(); }} className="btn btn-secondary" style={{ marginTop: '10px' }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {medicines.map((med) => {
            const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={med._id} style={styles.medCard} className="card">
                <div style={styles.cardHeader}>
                  <h3 style={styles.medName}>{med.name}</h3>
                  <span className="status-badge approved">AVAILABLE</span>
                </div>
                
                <div style={styles.cardBody}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Manufacturer:</span>
                    <span style={styles.detailVal}>{med.manufacturer}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Batch Number:</span>
                    <span style={styles.detailVal}>{med.batchNumber}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Quantity Available:</span>
                    <span style={{ ...styles.detailVal, fontWeight: 800, color: 'var(--primary)' }}>{med.quantity} unit(s)</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Condition:</span>
                    <span style={styles.detailVal}>{med.condition}</span>
                  </div>
                  <div style={styles.expiryBox}>
                    <Clock size={14} color="var(--status-pending)" />
                    <span style={styles.expiryText}>
                      Expires: {new Date(med.expiryDate).toLocaleDateString()} ({daysLeft} days remaining)
                    </span>
                  </div>

                  {/* Donor Contact Details Section */}
                  <div style={styles.donorSection}>
                    <div style={styles.donorSectionHeader}>
                      <span style={styles.donorSectionTitle}>Donor Contact Details</span>
                      {canViewDonorContact && med.donorContactVisible ? (
                        <span style={styles.approvedBadge}>
                          <ShieldCheck size={12} /> Admin Approved
                        </span>
                      ) : (
                        <span style={styles.lockedBadge}>
                          <Lock size={12} /> Requires Admin Approval
                        </span>
                      )}
                    </div>

                    {canViewDonorContact && med.donorContactVisible && med.donor ? (
                      <div style={styles.donorInfoCard}>
                        <div style={styles.donorInfoRow}>
                          <User size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {med.donor.name || 'Registered Donor'}
                          </span>
                        </div>
                        {med.donor.phone && (
                          <div style={styles.donorInfoRow}>
                            <Phone size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <a href={`tel:${med.donor.phone}`} style={styles.donorContactLink} title="Call donor">
                              {med.donor.phone}
                            </a>
                          </div>
                        )}
                        {med.donor.email && (
                          <div style={styles.donorInfoRow}>
                            <Mail size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <a href={`mailto:${med.donor.email}`} style={styles.donorContactLink} title="Email donor">
                              {med.donor.email}
                            </a>
                          </div>
                        )}
                        {med.donor.address && (
                          <div style={styles.donorInfoRow}>
                            <MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              {med.donor.address}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={styles.lockedDonorBox}>
                        <div style={styles.lockedDonorHeader}>
                          <Lock size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                          <span style={styles.lockedDonorTitle}>Contact Details Protected</span>
                        </div>
                        <p style={styles.lockedDonorDesc}>
                          Donor contact details become visible for beneficiary NGOs after getting approval from admin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <button
                    onClick={() => handleOpenRequestModal(med)}
                    className={`btn ${isRejected ? 'btn-disabled' : 'btn-primary'}`}
                    style={styles.requestBtn}
                    disabled={isRejected}
                    title={isRejected ? 'Account restricted' : 'Request medicine'}
                  >
                    {isRejected ? 'Account Restricted' : 'Request Medicine'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal Portal */}
      {selectedMed && typeof document !== 'undefined' && createPortal(
        <div
          style={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              handleCloseModal();
            }
          }}
        >
          <div style={styles.modalContent} className="card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Request Medicine</h3>
              <button onClick={handleCloseModal} style={styles.closeBtn} type="button" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalMedInfo}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{selectedMed.name}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Available quantity: <strong style={{ color: 'var(--primary)' }}>{selectedMed.quantity} unit(s)</strong> | Expiry: <strong>{new Date(selectedMed.expiryDate).toLocaleDateString()}</strong>
                </p>

                {/* Modal Donor Details Preview */}
                {canViewDonorContact && selectedMed.donorContactVisible && selectedMed.donor ? (
                  <div style={styles.modalDonorBox}>
                    <div style={styles.modalDonorHeader}>
                      <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>
                        Verified Donor Information (Admin Approved Access)
                      </span>
                    </div>
                    <div style={styles.modalDonorContent}>
                      <div><strong>Donor:</strong> {selectedMed.donor.name || 'Registered Donor'}</div>
                      {selectedMed.donor.phone && (
                        <div>
                          <strong>Phone:</strong>{' '}
                          <a href={`tel:${selectedMed.donor.phone}`} style={styles.donorContactLink}>
                            {selectedMed.donor.phone}
                          </a>
                        </div>
                      )}
                      {selectedMed.donor.email && (
                        <div>
                          <strong>Email:</strong>{' '}
                          <a href={`mailto:${selectedMed.donor.email}`} style={styles.donorContactLink}>
                            {selectedMed.donor.email}
                          </a>
                        </div>
                      )}
                      {selectedMed.donor.address && <div><strong>Location:</strong> {selectedMed.donor.address}</div>}
                    </div>
                  </div>
                ) : (
                  <div style={styles.modalLockedBox}>
                    <Lock size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: '#92400e' }}>
                      Donor contact details become visible for beneficiary NGOs after getting approval from admin.
                    </span>
                  </div>
                )}
              </div>

              {error && <div style={styles.errorAlert}>{error}</div>}
              {success && <div style={styles.successAlert}>{success}</div>}

              <form onSubmit={handleRequestSubmit} style={styles.modalForm}>
                <div className="form-group">
                  <label htmlFor="reqQty">Requested Quantity (Units) *</label>
                  <input
                    id="reqQty"
                    type="number"
                    min="1"
                    max={selectedMed.quantity}
                    value={reqQty}
                    onChange={(e) => setReqQty(e.target.value)}
                    className="form-control"
                    disabled={submitting || success}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Clinical Need / Reason *</label>
                  <textarea
                    id="reason"
                    placeholder="Describe who will receive this medicine and why it is required (e.g. Free public health clinic distribution, flood victim relief camp)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="form-control"
                    style={{ minHeight: '110px', resize: 'vertical' }}
                    disabled={submitting || success}
                    required
                  />
                </div>

                <div style={styles.modalCta}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || success}>
                    {submitting ? 'Submitting Request...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
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
  alertBanner: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    background: 'var(--status-pending-bg)',
    border: '1px solid rgba(217, 119, 6, 0.2)',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    marginBottom: '24px',
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    marginBottom: '35px',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    fontSize: '0.98rem',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'var(--transition)',
  },
  searchBtn: {
    padding: '0 28px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  medCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  medName: {
    fontSize: '1.25rem',
    fontWeight: 800,
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
  },
  detailLabel: {
    color: 'var(--text-muted)',
  },
  detailVal: {
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  expiryBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'hsl(38, 92%, 96%)',
    padding: '8px 12px',
    borderRadius: '8px',
    marginTop: '6px',
  },
  expiryText: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'hsl(38, 90%, 30%)',
  },
  donorSection: {
    background: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '12px 14px',
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  donorSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  donorSectionTitle: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  approvedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#0fa57c',
    background: 'rgba(15, 165, 124, 0.12)',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  lockedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#b45309',
    background: 'rgba(217, 119, 6, 0.12)',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  donorInfoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    background: '#ffffff',
    border: '1px solid rgba(15, 165, 124, 0.2)',
    borderRadius: '8px',
    padding: '10px 12px',
  },
  donorInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
  },
  donorContactLink: {
    color: 'var(--primary)',
    fontWeight: 600,
    textDecoration: 'none',
  },
  lockedDonorBox: {
    background: '#fffbeb',
    border: '1px solid rgba(217, 119, 6, 0.25)',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  lockedDonorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  lockedDonorTitle: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#92400e',
  },
  lockedDonorDesc: {
    fontSize: '0.78rem',
    color: '#b45309',
    lineHeight: 1.4,
    margin: 0,
  },
  modalDonorBox: {
    marginTop: '10px',
    background: 'rgba(15, 165, 124, 0.08)',
    border: '1px solid rgba(15, 165, 124, 0.25)',
    borderRadius: '8px',
    padding: '10px 12px',
  },
  modalDonorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  modalDonorContent: {
    fontSize: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    color: 'var(--text-main)',
  },
  modalLockedBox: {
    marginTop: '10px',
    background: '#fffbeb',
    border: '1px solid rgba(217, 119, 6, 0.25)',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: '10px',
  },
  requestBtn: {
    width: '100%',
  },
  // Modal Styles
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    overflowY: 'auto',
  },
  modalContent: {
    maxWidth: '520px',
    width: '100%',
    background: '#ffffff',
    padding: '28px',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    margin: 'auto',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '14px',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  modalMedInfo: {
    background: 'var(--bg-app)',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid var(--primary)',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalCta: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
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

// Handle input styling dynamically
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .searchInput:focus {
      border-color: var(--primary) !important;
      box-shadow: 0 0 0 3px var(--primary-glow) !important;
    }
  `;
  document.head.appendChild(style);
}

export default AvailableMedicines;
