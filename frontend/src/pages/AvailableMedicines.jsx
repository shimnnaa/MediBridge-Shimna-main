import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Heart, AlertCircle, Clock, CheckCircle, HelpCircle, X, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

const AvailableMedicines = () => {
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMedicines(search);
  };

  const handleOpenRequestModal = (medicine) => {
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
                </div>

                <div style={styles.cardFooter}>
                  <button onClick={() => handleOpenRequestModal(med)} className="btn btn-primary" style={styles.requestBtn}>
                    Request Medicine
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal */}
      {selectedMed && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent} className="card animate-fade-in">
            <div style={styles.modalHeader}>
              <h3>Request Medicine</h3>
              <button onClick={handleCloseModal} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalMedInfo}>
                <h4>{selectedMed.name}</h4>
                <p>Available quantity: <strong>{selectedMed.quantity}</strong> | Expiry: <strong>{new Date(selectedMed.expiryDate).toLocaleDateString()}</strong></p>
              </div>

              {error && <div style={styles.errorAlert}>{error}</div>}
              {success && <div style={styles.successAlert}>{success}</div>}

              <form onSubmit={handleRequestSubmit} style={styles.modalForm}>
                <div className="form-group">
                  <label htmlFor="reqQty">Requested Quantity *</label>
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
                    style={{ minHeight: '100px', resize: 'vertical' }}
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
    background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px',
  },
  modalContent: {
    maxWidth: '500px',
    width: '100%',
    background: '#fff',
    padding: '28px',
    boxShadow: 'var(--shadow-lg)',
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
