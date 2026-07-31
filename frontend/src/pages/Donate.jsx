import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Heart, PlusCircle, ArrowLeft, Calendar, FileText, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

const Donate = () => {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('Sealed & Unopened');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!name || !manufacturer || !batchNumber || !expiryDate || !quantity) {
      setError('Please fill in all required fields.');
      return;
    }

    // Expiry check
    const selectedExpiry = new Date(expiryDate);
    const today = new Date();
    
    // Set hours to 0 to compare days accurately
    selectedExpiry.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    if (selectedExpiry <= today) {
      setError('Medicines must be unexpired. Expiry date must be in the future.');
      return;
    }

    const diffDays = Math.ceil((selectedExpiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) {
      setError('Safety policy: We only accept medicines with at least 30 days of shelf life remaining.');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setLoading(true);

    try {
      const response = await api('/medicines/donate', {
        method: 'POST',
        body: {
          name,
          manufacturer,
          batchNumber,
          expiryDate,
          quantity: parseInt(quantity),
          condition,
          description,
        },
      });

      if (response.success) {
        setSuccess('Thank you! Your donation was submitted successfully. Waiting for admin verification.');
        
        // Trigger confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0fa57c', '#00b4d8', '#ffb703']
        });

        // Clear form
        setName('');
        setManufacturer('');
        setBatchNumber('');
        setExpiryDate('');
        setQuantity(1);
        setCondition('Sealed & Unopened');
        setDescription('');

        setTimeout(() => {
          navigate('/my-donations');
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit donation. Please try again.');
    } finally {
      setLoading(false);
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

        <div style={styles.grid}>
          <div style={styles.formCard} className="card">
            <div style={styles.header}>
              <div style={styles.iconBox}>
                <PlusCircle size={24} color="var(--primary)" />
              </div>
              <div>
                <h2 style={styles.title}>Donate Medicine</h2>
                <p style={styles.subtitle}>Provide packaging and batch information to donate</p>
              </div>
            </div>

            {error && <div style={styles.errorAlert}>{error}</div>}
            {success && <div style={styles.successAlert}>{success}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="form-group">
                <label htmlFor="medName">Medicine / Drug Name *</label>
                <input
                  id="medName"
                  type="text"
                  placeholder="e.g. Paracetamol 500mg, Amoxicillin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="mfg">Manufacturer *</label>
                  <input
                    id="mfg"
                    type="text"
                    placeholder="e.g. Pfizer, GSK"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="form-control"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="batch">Batch Number *</label>
                  <input
                    id="batch"
                    type="text"
                    placeholder="e.g. BT-9821"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="form-control"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="expiry">Expiry Date *</label>
                  <input
                    id="expiry"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="form-control"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qty">Quantity (Pills/Bottles) *</label>
                  <input
                    id="qty"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-control"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cond">Package Condition *</label>
                <select
                  id="cond"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="form-control"
                  disabled={loading}
                  required
                >
                  <option value="Sealed & Unopened">Sealed & Unopened (Blister strip / Bottle)</option>
                  <option value="Slightly Damaged Outer Box">Slightly Damaged Outer Box (Medicine Intact)</option>
                  <option value="Loose Strips">Loose Blister Strips (Individually Sealed)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="desc">Additional Details / Storage info</label>
                <textarea
                  id="desc"
                  placeholder="e.g. Keep refrigerated, expiry date clearly visible on package back..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Submitting Donation...' : (
                  <>
                    <Heart size={18} fill="currentColor" /> Submit Donation
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={styles.infoCard} className="card">
            <h3 style={styles.infoTitle}>Donation Guidelines</h3>
            <div style={styles.guidelineList}>
              <div style={styles.guidelineItem}>
                <div style={styles.bullet}>✓</div>
                <div>
                  <h5>Acceptable Items</h5>
                  <p>Unopened syrup bottles, intact blister strips, and medicines in original containers with readable text.</p>
                </div>
              </div>
              <div style={styles.guidelineItem}>
                <div style={{ ...styles.bullet, background: 'var(--status-rejected-bg)', color: 'var(--status-rejected)' }}>✗</div>
                <div>
                  <h5>Unacceptable Items</h5>
                  <p>Partially consumed bottles, cut blister strips, expired medicines, narcotics, and controlled substances.</p>
                </div>
              </div>
              <div style={styles.guidelineItem}>
                <div style={styles.bullet}>✓</div>
                <div>
                  <h5>Batch Verification</h5>
                  <p>Administration reviews registration certificates and checks manufacturer recalls before approval.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 0.7fr',
    gap: '24px',
  },
  formCard: {
    padding: '30px',
  },
  header: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '30px',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  errorAlert: {
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '20px',
  },
  successAlert: {
    background: 'var(--status-approved-bg)',
    color: 'var(--status-approved)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  submitBtn: {
    marginTop: '10px',
    padding: '12px',
    fontSize: '1rem',
  },
  infoCard: {
    background: 'var(--primary-light)',
    borderColor: 'rgba(15, 165, 124, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  guidelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  guidelineItem: {
    display: 'flex',
    gap: '14px',
  },
  bullet: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--status-approved-bg)',
    color: 'var(--status-approved)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
};

export default Donate;
