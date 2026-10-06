import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  ArrowLeft,
  Heart,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  FileText,
  ShieldCheck,
  Package,
  Building2,
  PackageCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations'); // 'donations' | 'allocations'
  const [selectedMedModal, setSelectedMedModal] = useState(null);

  // Donor collection modal state
  const [donorCollectAlloc, setDonorCollectAlloc] = useState(null);
  const [donorCollecting, setDonorCollecting] = useState(false);
  const [donorCollectError, setDonorCollectError] = useState('');
  const [donorCollectSuccess, setDonorCollectSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDonorCollectModal = (alloc) => {
    setDonorCollectAlloc(alloc);
    setDonorCollectError('');
    setDonorCollectSuccess('');
  };

  const handleCloseDonorCollectModal = () => {
    setDonorCollectAlloc(null);
    setDonorCollectError('');
    setDonorCollectSuccess('');
  };

  const handleConfirmDonorCollection = async () => {
    if (!donorCollectAlloc) return;
    setDonorCollecting(true);
    setDonorCollectError('');
    setDonorCollectSuccess('');

    try {
      const response = await api(`/requests/${donorCollectAlloc._id}/collect`, {
        method: 'PUT',
      });

      if (response.success) {
        setDonorCollectSuccess('Medicine handover confirmed! Stock quantity reduced from medicine collection.');
        await fetchData();

        // If selectedMedModal is open, refresh it as well
        if (selectedMedModal) {
          const updatedDonRes = await api('/medicines/my-donations');
          if (updatedDonRes.success && updatedDonRes.data) {
            const found = updatedDonRes.data.find((d) => String(d._id) === String(selectedMedModal._id));
            if (found) {
              setSelectedMedModal(found);
            }
          }
        }

        setTimeout(() => {
          handleCloseDonorCollectModal();
        }, 1800);
      } else {
        setDonorCollectError(response.message || 'Failed to update collection status.');
      }
    } catch (err) {
      setDonorCollectError(err.message || 'Error occurred while confirming collection.');
    } finally {
      setDonorCollecting(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch donations (with attached approvedAllocations)
      const donRes = await api('/medicines/my-donations');
      if (donRes.success && donRes.data) {
        setDonations(donRes.data);
      }

      // 2. Fetch dedicated donor allocations ledger
      try {
        const allocRes = await api('/requests/donor-allocations');
        if (allocRes.success && allocRes.data) {
          setAllocations(allocRes.data);
        }
      } catch (e) {
        console.warn('Donor allocations endpoint fallback:', e);
      }
    } catch (err) {
      console.error('Error fetching donor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalAllocatedUnits = donations.reduce((sum, d) => sum + (d.totalAllocatedQuantity || 0), 0);
  const totalApprovedRecipients = allocations.length || donations.reduce((sum, d) => sum + (d.recipientCount || 0), 0);

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.container}>
        {/* Navigation Breadcrumb */}
        <div style={styles.backRow}>
          <Link to="/dashboard" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Header with Metrics */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Donations & Impact</h1>
            <p style={styles.subtitle}>
              Track your donated medicine batches and view which verified NGOs have received admin approval.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div style={styles.quickStats}>
            <div style={styles.statBadge}>
              <Package size={16} color="var(--primary)" />
              <span><strong>{donations.length}</strong> Total Batches</span>
            </div>
            <div style={{ ...styles.statBadge, background: 'var(--status-approved-bg)', borderColor: 'rgba(40, 167, 69, 0.2)' }}>
              <ShieldCheck size={16} color="var(--status-approved)" />
              <span><strong style={{ color: 'var(--status-approved)' }}>{totalApprovedRecipients}</strong> Approved Allocations</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab('donations')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'donations' ? styles.activeTabButton : {}),
            }}
          >
            <Package size={17} />
            <span>My Donated Medicines ({donations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('allocations')}
            style={{
              ...styles.tabButton,
              ...(activeTab === 'allocations' ? styles.activeTabButton : {}),
            }}
          >
            <Users size={17} />
            <span>Approved Beneficiaries & Impact ({totalApprovedRecipients})</span>
          </button>
        </div>

        {/* Content View */}
        {loading ? (
          <p style={styles.loadingText}>Fetching your donation & distribution ledger...</p>
        ) : activeTab === 'donations' ? (
          /* TAB 1: ALL DONATED MEDICINES */
          donations.length === 0 ? (
            <div style={styles.emptyState} className="card">
              <Heart size={48} color="var(--text-muted)" />
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
                      <th>Qty (Orig / Left)</th>
                      <th>Status</th>
                      <th>Approved Beneficiary (Admin Approved)</th>
                      <th>Admin Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((med) => {
                      const hasAllocations = med.approvedAllocations && med.approvedAllocations.length > 0;

                      return (
                        <tr key={med._id}>
                          <td style={styles.medName}>
                            <div>{med.name}</div>
                            <span style={styles.conditionTag}>{med.condition || 'Sealed'}</span>
                          </td>
                          <td>{med.manufacturer}</td>
                          <td><code>{med.batchNumber}</code></td>
                          <td>{new Date(med.expiryDate).toLocaleDateString()}</td>
                          <td>
                            <strong>{med.originalQuantity}</strong> / <span style={{ color: med.quantity === 0 ? 'var(--status-approved)' : 'var(--text-main)', fontWeight: 600 }}>{med.quantity}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${med.status || 'pending'}`}>
                              {(med.status || 'pending').toUpperCase()}
                            </span>
                          </td>

                          {/* Approved Beneficiary Column */}
                          <td>
                            {hasAllocations ? (
                              <button
                                onClick={() => setSelectedMedModal(med)}
                                style={styles.viewBeneficiaryBtn}
                                title="Click to view approved NGO details and update collection"
                              >
                                <CheckCircle2 size={15} color="var(--status-approved)" />
                                <span>
                                  {med.recipientCount} NGO Approved ({med.totalAllocatedQuantity} units)
                                  {med.collectedCount > 0 && ` • ${med.collectedCount} Collected`}
                                </span>
                              </button>
                            ) : med.status === 'approved' ? (
                              <span style={styles.inStockBadge}>
                                Available in stock (0 claims)
                              </span>
                            ) : med.status === 'pending' ? (
                              <span style={styles.pendingBadge}>
                                Awaiting Admin Review
                              </span>
                            ) : (
                              <span style={styles.rejectedBadge}>
                                Not Approved
                              </span>
                            )}
                          </td>

                          {/* Remarks */}
                          <td style={styles.remarksCell}>
                            {med.status === 'pending' && 'Awaiting administrative verification.'}
                            {med.status === 'approved' && (med.verificationDetails?.remarks || 'Approved and listed for verified NGO claims.')}
                            {med.status === 'rejected' && (
                              <span style={{ color: 'var(--status-rejected)' }}>
                                <strong>Rejected:</strong> {med.verificationDetails?.remarks || 'Does not meet safety criteria.'}
                              </span>
                            )}
                            {med.status === 'claimed' && 'Completely distributed to verified NGOs.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* TAB 2: APPROVED BENEFICIARIES & DISTRIBUTIONS */
          allocations.length === 0 ? (
            <div style={styles.emptyState} className="card">
              <Users size={48} color="var(--text-muted)" />
              <h4>No Approved Beneficiary Allocations Yet</h4>
              <p style={{ maxWidth: '500px' }}>
                When the administrator approves an NGO or Beneficiary request for your donated medicines,
                the recipient organization, contact person, phone number, and distribution purpose will be detailed here.
              </p>
              <button
                onClick={() => setActiveTab('donations')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '10px' }}
              >
                Back to Donated Batches
              </button>
            </div>
          ) : (
            <div className="card" style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Medicine & Batch</th>
                      <th>Approved Recipient (NGO / Beneficiary)</th>
                      <th>Contact Person & Phone</th>
                      <th>Allocated Qty</th>
                      <th>Approved Date</th>
                      <th>Stated Purpose / Clinical Reason</th>
                      <th>Collection Status & Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((alloc) => (
                      <tr key={alloc._id}>
                        <td style={styles.medName}>
                          <div>{alloc.medicine?.name || 'Donated Medicine'}</div>
                          <code style={{ fontSize: '0.78rem' }}>Batch: {alloc.medicine?.batchNumber || 'N/A'}</code>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={16} color="var(--primary)" />
                            <div>
                              <strong style={{ color: 'var(--text-main)' }}>
                                {alloc.requester?.organizationName || alloc.requester?.name || 'Registered NGO'}
                              </strong>
                              {alloc.requester?.registrationNumber && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Reg: {alloc.requester.registrationNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div><strong>{alloc.requester?.name || 'Authorized Lead'}</strong></div>
                          {alloc.requester?.phone && (
                            <a href={`tel:${alloc.requester.phone}`} style={styles.contactLink}>
                              <Phone size={12} /> {alloc.requester.phone}
                            </a>
                          )}
                          {alloc.requester?.email && (
                            <a href={`mailto:${alloc.requester.email}`} style={styles.contactLink}>
                              <Mail size={12} /> {alloc.requester.email}
                            </a>
                          )}
                        </td>
                        <td>
                          <span style={styles.qtyBadge}>{alloc.quantity} units</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                            <Calendar size={13} color="var(--text-muted)" />
                            {new Date(alloc.approvedAt || alloc.requestDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={styles.reasonCell}>
                          <p style={{ margin: 0 }}>{alloc.reason}</p>
                          {alloc.adminRemarks && (
                            <div style={styles.adminNote}>
                              <strong>Admin Note:</strong> {alloc.adminRemarks}
                            </div>
                          )}
                        </td>
                        <td>
                          {alloc.status === 'collected' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span className="status-badge approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle2 size={13} /> COLLECTED
                              </span>
                              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                                Handed over on {alloc.collectedAt ? new Date(alloc.collectedAt).toLocaleDateString() : 'Done'}
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                              <span style={styles.pendingPickupBadge}>
                                <Clock size={12} /> Awaiting Pickup
                              </span>
                              <button
                                onClick={() => handleOpenDonorCollectModal(alloc)}
                                style={styles.donorCollectBtn}
                                title="Click to update when medicine has been collected / handed over"
                              >
                                <PackageCheck size={14} />
                                <span>Mark as Collected</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* MODAL: Detailed Approved Beneficiaries for a Selected Medicine */}
        {selectedMedModal && (
          <div style={styles.modalOverlay} onClick={() => setSelectedMedModal(null)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="card animate-fade-in">
              <div style={styles.modalHeader}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={22} color="var(--status-approved)" />
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                      Admin-Approved Beneficiary Details
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                    Medicine: <strong>{selectedMedModal.name}</strong> | Batch: <code>{selectedMedModal.batchNumber}</code>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMedModal(null)}
                  style={styles.closeBtn}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Medicine Allocation Summary Strip */}
              <div style={styles.modalSummaryStrip}>
                <div>
                  <span style={styles.stripLabel}>Total Submitted</span>
                  <strong>{selectedMedModal.originalQuantity} units</strong>
                </div>
                <div>
                  <span style={styles.stripLabel}>Approved to NGOs</span>
                  <strong style={{ color: 'var(--status-approved)' }}>{selectedMedModal.totalAllocatedQuantity} units</strong>
                </div>
                <div>
                  <span style={styles.stripLabel}>Remaining in Stock</span>
                  <strong>{selectedMedModal.quantity} units</strong>
                </div>
              </div>

              {/* List of Approved Beneficiaries */}
              <div style={styles.modalBeneficiaryList}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '14px 0 10px 0', color: 'var(--text-main)' }}>
                  Approved Recipients ({selectedMedModal.approvedAllocations?.length || 0})
                </h4>

                {(!selectedMedModal.approvedAllocations || selectedMedModal.approvedAllocations.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                    No beneficiary requests have been approved for this medicine batch yet.
                  </p>
                ) : (
                  selectedMedModal.approvedAllocations.map((alloc, idx) => (
                    <div key={alloc._id || idx} style={styles.beneficiaryCard}>
                      <div style={styles.cardTopRow}>
                        <div>
                          <span style={styles.ngoRoleBadge}>VERIFIED BENEFICIARY / NGO</span>
                          <h4 style={styles.ngoTitle}>
                            {alloc.requester?.organizationName || alloc.requester?.name || 'Community Health Initiative'}
                          </h4>
                          {alloc.requester?.registrationNumber && (
                            <span style={styles.ngoRegNo}>
                              Govt Reg: {alloc.requester.registrationNumber}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <div style={styles.approvedQtyTag}>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                              {alloc.status === 'collected' ? 'Collected Qty' : 'Approved Qty'}
                            </span>
                            <strong style={{ fontSize: '1.2rem', color: 'var(--status-approved)' }}>
                              {alloc.quantity} units
                            </strong>
                          </div>
                          {alloc.status === 'collected' ? (
                            <span className="status-badge approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}>
                              <CheckCircle2 size={12} /> Handed Over & Collected
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenDonorCollectModal(alloc)}
                              style={styles.donorCollectBtn}
                              title="Update collection status when medicines are collected and taken"
                            >
                              <PackageCheck size={13} />
                              <span>Mark as Collected</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Contact Details Grid */}
                      <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                          <Users size={14} color="var(--primary)" />
                          <div>
                            <span style={styles.detailLabel}>Contact Person</span>
                            <span style={styles.detailValue}>{alloc.requester?.name || 'Authorized Officer'}</span>
                          </div>
                        </div>

                        <div style={styles.detailItem}>
                          <Phone size={14} color="var(--primary)" />
                          <div>
                            <span style={styles.detailLabel}>Phone Number</span>
                            {alloc.requester?.phone ? (
                              <a href={`tel:${alloc.requester.phone}`} style={styles.directContactLink}>
                                {alloc.requester.phone}
                              </a>
                            ) : (
                              <span style={styles.detailValue}>Not Provided</span>
                            )}
                          </div>
                        </div>

                        <div style={styles.detailItem}>
                          <Mail size={14} color="var(--primary)" />
                          <div>
                            <span style={styles.detailLabel}>Email Address</span>
                            {alloc.requester?.email ? (
                              <a href={`mailto:${alloc.requester.email}`} style={styles.directContactLink}>
                                {alloc.requester.email}
                              </a>
                            ) : (
                              <span style={styles.detailValue}>Not Provided</span>
                            )}
                          </div>
                        </div>

                        <div style={styles.detailItem}>
                          <MapPin size={14} color="var(--primary)" />
                          <div>
                            <span style={styles.detailLabel}>Location / Address</span>
                            <span style={styles.detailValue}>{alloc.requester?.address || 'Verified Facility'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Request Reason & Admin Note */}
                      <div style={styles.reasonBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <FileText size={14} color="var(--text-muted)" />
                          <strong style={{ fontSize: '0.85rem' }}>Purpose / Clinical Need:</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'hsl(210, 20%, 25%)' }}>
                          {alloc.reason || 'Medical assistance distribution.'}
                        </p>

                        {alloc.adminRemarks && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                            <strong style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Admin Verification Note:</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {alloc.adminRemarks}
                            </p>
                          </div>
                        )}
                      </div>

                      <div style={styles.approvalFooter}>
                        <span>Admin Verified on {new Date(alloc.approvedAt || alloc.requestDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={styles.modalFooter}>
                <button onClick={() => setSelectedMedModal(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Donor Confirm Medicine Collection / Handover */}
        {donorCollectAlloc && (
          <div style={styles.modalOverlay} onClick={handleCloseDonorCollectModal}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="card animate-fade-in">
              <div style={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PackageCheck size={22} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Confirm Medicine Handover & Collection</h3>
                </div>
                <button onClick={handleCloseDonorCollectModal} style={styles.closeBtn} disabled={donorCollecting} aria-label="Close modal">
                  <X size={20} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '14px' }}>
                  Please confirm that the beneficiary organization has collected these medicines. Once confirmed, this quantity will be deducted from your medicine collection.
                </p>

                <div style={styles.modalSummaryStrip}>
                  <div>
                    <span style={styles.stripLabel}>Medicine</span>
                    <strong>{donorCollectAlloc.medicine?.name || 'Medicine'}</strong>
                  </div>
                  <div>
                    <span style={styles.stripLabel}>Handover Quantity</span>
                    <strong style={{ color: 'var(--primary)' }}>{donorCollectAlloc.quantity} units</strong>
                  </div>
                  <div>
                    <span style={styles.stripLabel}>Batch</span>
                    <code>{donorCollectAlloc.medicine?.batchNumber || 'N/A'}</code>
                  </div>
                </div>

                <div style={{ background: 'hsl(210, 20%, 98%)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Recipient Organization
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>
                    {donorCollectAlloc.requester?.organizationName || donorCollectAlloc.requester?.name || 'Verified NGO'}
                  </strong>
                  {donorCollectAlloc.requester?.phone && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Contact: {donorCollectAlloc.requester.name} ({donorCollectAlloc.requester.phone})
                    </div>
                  )}
                </div>

                {donorCollectError && (
                  <div style={{ ...styles.errorAlert, marginTop: '12px' }}>
                    <AlertCircle size={16} />
                    <span>{donorCollectError}</span>
                  </div>
                )}

                {donorCollectSuccess && (
                  <div style={{ ...styles.successAlert, marginTop: '12px' }}>
                    <CheckCircle2 size={16} />
                    <span>{donorCollectSuccess}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={handleCloseDonorCollectModal}
                    className="btn btn-secondary"
                    disabled={donorCollecting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDonorCollection}
                    className="btn btn-primary"
                    disabled={donorCollecting || donorCollectSuccess}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <PackageCheck size={16} />
                    {donorCollecting ? 'Updating...' : 'Yes, Confirm Handover & Collected'}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '6px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.98rem',
    marginTop: '4px',
  },
  quickStats: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  statBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    background: '#fff',
    border: '1px solid var(--border-color)',
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  tabsContainer: {
    display: 'flex',
    gap: '12px',
    borderBottom: '2px solid var(--border-color)',
    paddingBottom: '2px',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '8px 8px 0 0',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontWeight: 600,
    fontSize: '0.92rem',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  activeTabButton: {
    color: 'var(--primary)',
    borderBottom: '3px solid var(--primary)',
    background: 'var(--primary-light)',
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
    fontSize: '0.88rem',
  },
  medName: {
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  conditionTag: {
    display: 'inline-block',
    fontSize: '0.72rem',
    background: 'hsl(210, 20%, 96%)',
    color: 'var(--text-muted)',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: '4px',
  },
  viewBeneficiaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--status-approved-bg)',
    color: 'var(--status-approved)',
    border: '1px solid rgba(40, 167, 69, 0.3)',
    borderRadius: '20px',
    padding: '5px 12px',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  inStockBadge: {
    fontSize: '0.8rem',
    color: 'var(--primary)',
    fontWeight: 600,
    background: 'var(--primary-light)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  pendingBadge: {
    fontSize: '0.8rem',
    color: '#b45309',
    fontWeight: 600,
    background: 'var(--status-pending-bg)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  rejectedBadge: {
    fontSize: '0.8rem',
    color: 'var(--status-rejected)',
    fontWeight: 600,
    background: 'var(--status-rejected-bg)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  remarksCell: {
    color: 'var(--text-muted)',
    fontSize: '0.83rem',
    maxWidth: '260px',
  },
  contactLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.8rem',
    color: 'var(--primary)',
    fontWeight: 600,
    marginTop: '2px',
  },
  qtyBadge: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  reasonCell: {
    fontSize: '0.85rem',
    maxWidth: '280px',
    color: 'hsl(210, 20%, 30%)',
  },
  adminNote: {
    marginTop: '4px',
    fontSize: '0.78rem',
    color: 'var(--primary)',
    background: 'rgba(15, 165, 124, 0.08)',
    padding: '4px 8px',
    borderRadius: '4px',
  },

  /* Modal Styling */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '4px',
    borderRadius: '6px',
  },
  modalSummaryStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    background: 'hsl(210, 20%, 98%)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '12px 16px',
    textAlign: 'center',
  },
  stripLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginBottom: '2px',
  },
  modalBeneficiaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  beneficiaryCard: {
    background: '#ffffff',
    border: '1px solid rgba(40, 167, 69, 0.25)',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  ngoRoleBadge: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: 800,
    color: 'var(--status-approved)',
    background: 'var(--status-approved-bg)',
    padding: '3px 8px',
    borderRadius: '6px',
    marginBottom: '4px',
    letterSpacing: '0.5px',
  },
  ngoTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    margin: 0,
    color: 'var(--text-main)',
  },
  ngoRegNo: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px',
  },
  approvedQtyTag: {
    textAlign: 'right',
    background: 'var(--status-approved-bg)',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(40, 167, 69, 0.2)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    background: 'hsl(210, 20%, 98%)',
    padding: '12px',
    borderRadius: '8px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  detailLabel: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  detailValue: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  directContactLink: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--primary)',
    textDecoration: 'underline',
  },
  reasonBox: {
    background: 'rgba(240, 243, 246, 0.6)',
    padding: '10px 14px',
    borderRadius: '8px',
    borderLeft: '3px solid var(--primary)',
  },
  approvalFooter: {
    fontSize: '0.76rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  modalFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pendingPickupBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'var(--status-pending-bg)',
    color: '#b45309',
    fontSize: '0.74rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(217, 119, 6, 0.2)',
  },
  donorCollectBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(15, 165, 124, 0.25)',
  },
  collectedBadgeWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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

export default MyDonations;
