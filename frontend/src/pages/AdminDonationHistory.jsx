import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  ArrowLeft,
  Search,
  History,
  CheckCircle2,
  PackageCheck,
  Building,
  User,
  Calendar,
  Filter,
  Download,
  Eye,
  X,
  Clock,
  ShieldCheck,
  Heart,
  Tag,
} from 'lucide-react';

const AdminDonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'claimed'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'expiry'

  // Allocation Modal state
  const [selectedMed, setSelectedMed] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api('/admin/donations/history');
      if (response.success && response.data) {
        setDonations(response.data);
      }
    } catch (err) {
      console.error('Error fetching donation history:', err);
      setError(err.message || 'Failed to load donation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filtered & Sorted Donations
  const filteredDonations = donations
    .filter((med) => {
      // Status Filter
      if (statusFilter === 'approved' && med.status !== 'approved') return false;
      if (statusFilter === 'claimed' && med.status !== 'claimed') return false;

      // Search Filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const medName = (med.name || '').toLowerCase();
      const mfg = (med.manufacturer || '').toLowerCase();
      const batch = (med.batchNumber || '').toLowerCase();
      const donorName = med.donor && med.donor.name ? med.donor.name.toLowerCase() : '';
      const donorEmail = med.donor && med.donor.email ? med.donor.email.toLowerCase() : '';

      return (
        medName.includes(term) ||
        mfg.includes(term) ||
        batch.includes(term) ||
        donorName.includes(term) ||
        donorEmail.includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'expiry') return new Date(a.expiryDate) - new Date(b.expiryDate);
      return 0;
    });

  // Calculate Metrics
  const totalSuccessful = donations.length;
  const totalUnitsDonated = donations.reduce((sum, d) => sum + (d.originalQuantity || d.quantity || 0), 0);
  const totalUnitsClaimed = donations.reduce((sum, d) => {
    const orig = d.originalQuantity || d.quantity || 0;
    return sum + Math.min(orig, d.totalClaimedQuantity || 0);
  }, 0);
  const totalStockRemaining = donations.reduce((sum, d) => sum + (d.quantity || 0), 0);

  // CSV Download Handler
  const handleExportCSV = () => {
    if (filteredDonations.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Medicine Name,Manufacturer,Batch Number,Expiry Date,Condition,Original Qty,Remaining Qty,Claimed Qty,Status,Donor Name,Donor Email,Donor Phone,Verified Date\n';

    filteredDonations.forEach((med) => {
      const name = `"${(med.name || '').replace(/"/g, '""')}"`;
      const mfg = `"${(med.manufacturer || '').replace(/"/g, '""')}"`;
      const batch = `"${(med.batchNumber || '').replace(/"/g, '""')}"`;
      const expiry = med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : 'N/A';
      const cond = `"${(med.condition || '').replace(/"/g, '""')}"`;
      const origQty = med.originalQuantity || med.quantity || 0;
      const claimedQty = Math.min(origQty, med.totalClaimedQuantity || 0);
      const remQty = med.status === 'claimed' ? 0 : Math.max(0, origQty - claimedQty);
      const status = med.status;
      const donorName = med.donor ? `"${(med.donor.name || '').replace(/"/g, '""')}"` : '"N/A"';
      const donorEmail = med.donor ? med.donor.email || '' : '';
      const donorPhone = med.donor ? med.donor.phone || '' : '';
      const verifiedAt = med.verificationDetails && med.verificationDetails.verifiedAt
        ? new Date(med.verificationDetails.verifiedAt).toISOString().split('T')[0]
        : 'N/A';

      csvContent += `${name},${mfg},${batch},${expiry},${cond},${origQty},${remQty},${claimedQty},${status},${donorName},${donorEmail},${donorPhone},${verifiedAt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `successful_medicine_donations_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.container}>
        {/* Header Navigation */}
        <div style={styles.backRow}>
          <Link to="/dashboard" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div style={styles.headerRow}>
          <div>
            <div style={styles.headerBadge}>
              <History size={14} /> Admin Operations & Telemetry
            </div>
            <h1 style={styles.title}>Successful Medicine Donations History</h1>
            <p style={styles.subtitle}>
              Comprehensive audit trail of all verified, approved, and claimed medicine donations.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={filteredDonations.length === 0}
            className="btn btn-secondary"
            style={styles.exportBtn}
          >
            <Download size={16} /> Export CSV Report
          </button>
        </div>

        {/* Aggregate Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard} className="card">
            <div style={{ ...styles.statIcon, background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <History size={22} />
            </div>
            <div>
              <span style={styles.statLabel}>Total Verified Donations</span>
              <h3 style={styles.statValue}>{totalSuccessful}</h3>
              <span style={styles.statSub}>Approved or Fully Claimed</span>
            </div>
          </div>

          <div style={styles.statCard} className="card">
            <div style={{ ...styles.statIcon, background: 'rgba(0, 180, 216, 0.1)', color: 'var(--secondary)' }}>
              <Heart size={22} />
            </div>
            <div>
              <span style={styles.statLabel}>Total Units Donated</span>
              <h3 style={styles.statValue}>{totalUnitsDonated}</h3>
              <span style={styles.statSub}>Original quantity received</span>
            </div>
          </div>

          <div style={styles.statCard} className="card">
            <div style={{ ...styles.statIcon, background: 'var(--status-claimed-bg)', color: 'var(--status-claimed)' }}>
              <PackageCheck size={22} />
            </div>
            <div>
              <span style={styles.statLabel}>Units Distributed to NGOs</span>
              <h3 style={styles.statValue}>{totalUnitsClaimed}</h3>
              <span style={styles.statSub}>Allocated & Collected</span>
            </div>
          </div>

          <div style={styles.statCard} className="card">
            <div style={{ ...styles.statIcon, background: 'var(--status-approved-bg)', color: 'var(--status-approved)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <span style={styles.statLabel}>Active Available Stock</span>
              <h3 style={styles.statValue}>{totalStockRemaining}</h3>
              <span style={styles.statSub}>Ready for distribution</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="card" style={styles.filterCard}>
          <div style={styles.searchBox}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by medicine name, donor, manufacturer, or batch #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
                <X size={14} />
              </button>
            )}
          </div>

          <div style={styles.filterGroup}>
            <div style={styles.tabFilters}>
              <button
                style={{
                  ...styles.tabBtn,
                  ...(statusFilter === 'all' ? styles.tabBtnActive : {}),
                }}
                onClick={() => setStatusFilter('all')}
              >
                All Successful ({donations.length})
              </button>
              <button
                style={{
                  ...styles.tabBtn,
                  ...(statusFilter === 'approved' ? styles.tabBtnActive : {}),
                }}
                onClick={() => setStatusFilter('approved')}
              >
                Available / In Stock ({donations.filter((d) => d.status === 'approved').length})
              </button>
              <button
                style={{
                  ...styles.tabBtn,
                  ...(statusFilter === 'claimed' ? styles.tabBtnActive : {}),
                }}
                onClick={() => setStatusFilter('claimed')}
              >
                Fully Claimed ({donations.filter((d) => d.status === 'claimed').length})
              </button>
            </div>

            <div style={styles.sortSelectWrapper}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.sortSelect}
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="expiry">Sort by Expiry Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main History Table */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading medicine donation history...</p>
          </div>
        ) : error ? (
          <div className="card" style={styles.errorCard}>
            <p style={{ color: 'var(--status-rejected)' }}>{error}</p>
            <button onClick={fetchHistory} className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>
              Retry
            </button>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="card" style={styles.emptyState}>
            <History size={48} color="var(--text-muted)" />
            <h4 style={{ marginTop: '12px', fontSize: '1.2rem' }}>No Donation Records Found</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {searchTerm || statusFilter !== 'all'
                ? 'No medicine donations match your current filter and search criteria.'
                : 'No approved or claimed medicine donations exist in the system yet.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '14px' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="card" style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Medicine & Manufacturer</th>
                    <th>Batch & Expiry</th>
                    <th>Donor Information</th>
                    <th>Quantity & Distribution</th>
                    <th>Status & Verified</th>
                    <th>Beneficiary Allocations</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((med) => {
                    const donor = med.donor || {};
                    const origQty = med.originalQuantity || med.quantity || 0;
                    const claimedQty = Math.min(origQty, med.totalClaimedQuantity || 0);
                    const remQty = med.status === 'claimed' ? 0 : Math.max(0, origQty - claimedQty);
                    const percentClaimed = Math.min(100, Math.round((claimedQty / (origQty || 1)) * 100));

                    const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const isSoonExpiring = daysLeft < 60 && daysLeft > 0;
                    const isExpired = daysLeft <= 0;

                    const verifiedAtStr = med.verificationDetails && med.verificationDetails.verifiedAt
                      ? new Date(med.verificationDetails.verifiedAt).toLocaleDateString()
                      : new Date(med.createdAt).toLocaleDateString();

                    return (
                      <tr key={med._id}>
                        {/* Medicine Info */}
                        <td style={styles.medCell}>
                          <div style={styles.medNameText}>{med.name}</div>
                          <div style={styles.mfgText}>Mfg: {med.manufacturer}</div>
                          <span style={styles.conditionTag}>
                            <Tag size={10} /> {med.condition || 'Sealed & Unopened'}
                          </span>
                        </td>

                        {/* Batch & Expiry */}
                        <td>
                          <div style={{ marginBottom: '4px' }}>
                            <code style={styles.batchCode}>{med.batchNumber}</code>
                          </div>
                          <div
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: isSoonExpiring || isExpired ? 700 : 500,
                              color: isExpired
                                ? 'var(--status-rejected)'
                                : isSoonExpiring
                                ? 'var(--status-pending)'
                                : 'var(--text-main)',
                            }}
                          >
                            <Calendar size={12} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                            {new Date(med.expiryDate).toLocaleDateString()}
                          </div>
                          {isSoonExpiring && <span style={styles.soonBadge}>Expiring Soon</span>}
                          {isExpired && <span style={styles.expiredBadge}>Expired</span>}
                        </td>

                        {/* Donor Info */}
                        <td style={styles.donorCell}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{donor.name || 'Anonymous Donor'}</div>
                          {donor.phone && (
                            <div style={styles.donorSubText}>
                              <User size={12} style={{ marginRight: '4px' }} /> {donor.phone}
                            </div>
                          )}
                          {donor.email && (
                            <div style={styles.donorSubText}>
                              <a href={`mailto:${donor.email}`} style={{ color: 'var(--primary)' }}>
                                {donor.email}
                              </a>
                            </div>
                          )}
                        </td>

                        {/* Quantity Breakdown */}
                        <td style={styles.qtyCell}>
                          <div style={styles.qtyRow}>
                            <span>Initial: <strong>{origQty}</strong></span>
                            <span>Remaining: <strong style={{ color: remQty > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{remQty}</strong></span>
                          </div>
                          <div style={styles.progressBarBg}>
                            <div
                              style={{
                                ...styles.progressBarFill,
                                width: `${percentClaimed}%`,
                                backgroundColor:
                                  percentClaimed === 100
                                    ? 'var(--status-claimed)'
                                    : percentClaimed > 0
                                    ? 'var(--primary)'
                                    : 'var(--border-color)',
                              }}
                            />
                          </div>
                          <div style={styles.percentText}>{percentClaimed}% Claimed ({claimedQty} units)</div>
                        </td>

                        {/* Status & Verification */}
                        <td>
                          <div style={{ marginBottom: '6px' }}>
                            <span className={`status-badge ${med.status}`}>
                              {(med.status || 'approved').toUpperCase()}
                            </span>
                          </div>
                          <div style={styles.verifiedSub}>
                            <Clock size={11} style={{ marginRight: '3px' }} /> Verified {verifiedAtStr}
                          </div>
                        </td>

                        {/* Action Details */}
                        <td>
                          <button
                            onClick={() => setSelectedMed(med)}
                            className="btn btn-secondary btn-sm"
                            style={styles.viewDetailsBtn}
                          >
                            <Eye size={14} />
                            <span>Claims ({med.claimCount || 0})</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal showing complete details & NGO allocations */}
        {selectedMed && (
          <div style={styles.modalOverlay} className="animate-fade-in">
            <div style={styles.modalContent} className="card">
              <div style={styles.modalHeader}>
                <div>
                  <span style={styles.headerBadge}>
                    <ShieldCheck size={14} /> Donation Audit Details
                  </span>
                  <h3 style={styles.modalTitle}>{selectedMed.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Batch: {selectedMed.batchNumber} • Manufacturer: {selectedMed.manufacturer}
                  </span>
                </div>
                <button onClick={() => setSelectedMed(null)} style={styles.closeModalBtn}>
                  <X size={20} />
                </button>
              </div>

              <div style={styles.modalBody}>
                {/* Overview Cards inside modal */}
                {(() => {
                  const mOrig = selectedMed.originalQuantity || selectedMed.quantity || 0;
                  const mClaimed = Math.min(mOrig, selectedMed.totalClaimedQuantity || 0);
                  const mRem = selectedMed.status === 'claimed' ? 0 : Math.max(0, mOrig - mClaimed);
                  return (
                    <div style={styles.modalStatsRow}>
                      <div style={styles.modalMiniCard}>
                        <span style={styles.miniLabel}>Total Quantity</span>
                        <strong style={styles.miniValue}>{mOrig} units</strong>
                      </div>
                      <div style={styles.modalMiniCard}>
                        <span style={styles.miniLabel}>Stock Remaining</span>
                        <strong style={{ ...styles.miniValue, color: 'var(--primary)' }}>{mRem} units</strong>
                      </div>
                      <div style={styles.modalMiniCard}>
                        <span style={styles.miniLabel}>Distributed Units</span>
                        <strong style={{ ...styles.miniValue, color: 'var(--status-claimed)' }}>
                          {mClaimed} units
                        </strong>
                      </div>
                      <div style={styles.modalMiniCard}>
                        <span style={styles.miniLabel}>Status</span>
                        <span className={`status-badge ${selectedMed.status}`}>
                          {(selectedMed.status || '').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Donor Details Card */}
                <div style={styles.modalSectionCard}>
                  <h4 style={styles.sectionHeading}>
                    <User size={16} /> Donor Profile
                  </h4>
                  <div style={styles.donorDetailGrid}>
                    <div>
                      <span style={styles.detailLabel}>Donor Name:</span>
                      <p style={styles.detailVal}>{selectedMed.donor ? selectedMed.donor.name : 'N/A'}</p>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Email:</span>
                      <p style={styles.detailVal}>{selectedMed.donor ? selectedMed.donor.email : 'N/A'}</p>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Phone:</span>
                      <p style={styles.detailVal}>{selectedMed.donor ? selectedMed.donor.phone || 'N/A' : 'N/A'}</p>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Location / Address:</span>
                      <p style={styles.detailVal}>{selectedMed.donor ? selectedMed.donor.address || 'N/A' : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Beneficiary Requests Allocated Table */}
                <div style={styles.modalSectionCard}>
                  <h4 style={styles.sectionHeading}>
                    <Building size={16} /> Allocated Beneficiary / NGO Requests ({selectedMed.allocations ? selectedMed.allocations.length : 0})
                  </h4>

                  {!selectedMed.allocations || selectedMed.allocations.length === 0 ? (
                    <div style={styles.noAllocationsBox}>
                      <CheckCircle2 size={24} color="var(--primary)" />
                      <p>No NGO claims or requests have been fulfilled for this batch yet.</p>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Items remain active in inventory for verified beneficiaries to request.
                      </span>
                    </div>
                  ) : (
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th>NGO / Requester Name</th>
                            <th>Organization</th>
                            <th>Allocated Qty</th>
                            <th>Request Date</th>
                            <th>Claim Status</th>
                            <th>Reason / Clinical Usage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMed.allocations.map((alloc) => {
                            const req = alloc.requester || {};
                            return (
                              <tr key={alloc._id}>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{req.name || 'Anonymous Beneficiary'}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.email}</div>
                                </td>
                                <td>
                                  <div>{req.organizationName || 'Individual Request'}</div>
                                  {req.registrationNumber && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      Reg: {req.registrationNumber}
                                    </span>
                                  )}
                                </td>
                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                  {alloc.quantity} units
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                  {new Date(alloc.requestDate || alloc.approvedAt).toLocaleDateString()}
                                </td>
                                <td>
                                  <span className={`status-badge ${alloc.status || 'approved'}`}>
                                    {(alloc.status || 'approved').toUpperCase()}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.85rem', maxWidth: '200px' }}>
                                  {alloc.reason}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button onClick={() => setSelectedMed(null)} className="btn btn-secondary">
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   CSS-in-JS Styles (Consistent with MediBridge theme)
   ========================================================================== */
const styles = {
  page: {
    padding: '36px 0 60px',
    backgroundColor: 'var(--bg-app)',
    minHeight: '85vh',
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  backRow: {
    marginBottom: '-8px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--primary-glow)',
    color: 'var(--primary)',
    fontSize: '0.8rem',
    fontWeight: 700,
    marginBottom: '8px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.98rem',
    marginTop: '4px',
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    display: 'block',
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: 800,
    lineHeight: 1.2,
    margin: '2px 0',
  },
  statSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  filterCard: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--bg-app)',
    padding: '10px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    fontSize: '0.95rem',
    color: 'var(--text-main)',
  },
  clearSearchBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tabFilters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    background: 'var(--primary)',
    color: 'var(--text-white)',
    borderColor: 'var(--primary)',
  },
  sortSelectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-app)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  sortSelect: {
    border: 'none',
    background: 'transparent',
    fontSize: '0.85rem',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
    color: 'var(--text-main)',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 0',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid var(--border-color)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s infinite linear',
  },
  errorCard: {
    padding: '30px',
    textAlign: 'center',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tableCard: {
    overflow: 'hidden',
    padding: 0,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  medCell: {
    minWidth: '200px',
  },
  medNameText: {
    fontWeight: 700,
    color: 'var(--text-main)',
    fontSize: '0.95rem',
  },
  mfgText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  conditionTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    background: 'var(--bg-app)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
  },
  batchCode: {
    background: 'var(--bg-app)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    border: '1px solid var(--border-color)',
  },
  soonBadge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: 'var(--status-pending-bg)',
    color: 'var(--status-pending)',
    padding: '1px 6px',
    borderRadius: '4px',
    marginLeft: '6px',
  },
  expiredBadge: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: 700,
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    padding: '1px 6px',
    borderRadius: '4px',
    marginLeft: '6px',
  },
  donorCell: {
    minWidth: '180px',
  },
  donorSubText: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  qtyCell: {
    minWidth: '170px',
  },
  qtyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    marginBottom: '4px',
  },
  progressBarBg: {
    height: '6px',
    background: 'var(--border-color)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  percentText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '3px',
  },
  verifiedSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  viewDetailsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.82rem',
    padding: '6px 12px',
  },
  /* Modal Overlay */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '850px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
  },
  modalTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    margin: '4px 0 2px',
  },
  closeModalBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--text-muted)',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  modalStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  },
  modalMiniCard: {
    background: 'var(--bg-app)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  miniLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  miniValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  modalSectionCard: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    padding: '18px',
  },
  sectionHeading: {
    fontSize: '1.05rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
    color: 'var(--primary)',
  },
  donorDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  detailLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    display: 'block',
  },
  detailVal: {
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  noAllocationsBox: {
    textAlign: 'center',
    padding: '24px',
    background: 'var(--bg-app)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    background: 'var(--bg-card)',
  },
};

export default AdminDonationHistory;
