import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Users, User, ShieldCheck, Mail, Phone, MapPin, Building, Globe, Check, X, ShieldAlert } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState(''); // '' for all, 'donor', 'beneficiary'
  
  // Selection and status change states
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionStatus, setActionStatus] = useState(''); // 'approved', 'rejected'
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async (role = '') => {
    setLoading(true);
    try {
      const endpoint = role ? `/admin/users?role=${role}` : '/admin/users';
      const response = await api(endpoint);
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(roleFilter);
  }, [roleFilter]);

  const handleOpenActionModal = (userItem, status) => {
    setSelectedUser(userItem);
    setActionStatus(status);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api(`/admin/users/${selectedUser._id}/status`, {
        method: 'PUT',
        body: {
          status: actionStatus,
        },
      });

      if (response.success) {
        setSuccess(`User status has been successfully updated to ${actionStatus}!`);
        fetchUsers(roleFilter);
        
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update user verification status.');
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

        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Manage Registered Users</h1>
            <p style={styles.subtitle}>Review donor accounts and verify NGO organization registration credentials.</p>
          </div>

          {/* Filter Toggles */}
          <div style={styles.filterTabs}>
            <button
              onClick={() => setRoleFilter('')}
              style={{ ...styles.filterTabBtn, ...(roleFilter === '' ? styles.activeFilterTab : {}) }}
            >
              All Users
            </button>
            <button
              onClick={() => setRoleFilter('donor')}
              style={{ ...styles.filterTabBtn, ...(roleFilter === 'donor' ? styles.activeFilterTab : {}) }}
            >
              Donors
            </button>
            <button
              onClick={() => setRoleFilter('beneficiary')}
              style={{ ...styles.filterTabBtn, ...(roleFilter === 'beneficiary' ? styles.activeFilterTab : {}) }}
            >
              NGO / Beneficiary
            </button>
          </div>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Fetching member registrations...</p>
        ) : users.length === 0 ? (
          <div style={styles.emptyState} className="card">
            <Users size={44} color="var(--text-muted)" />
            <h4>No Users Found</h4>
            <p>No account records found matching your selected role filters.</p>
          </div>
        ) : (
          <div className="card" style={styles.tableCard}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>NGO Credentials</th>
                    <th>Address / Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((member) => {
                    const isNgo = member.role === 'beneficiary';
                    const isPendingNgo = isNgo && member.status === 'pending';

                    return (
                      <tr key={member._id}>
                        <td>
                          <div style={styles.memberName}>{member.name}</div>
                          <span style={styles.detailText}>{member.email}</span>
                        </td>
                        <td>
                          <span style={{
                            ...styles.roleTag,
                            background: isNgo ? 'var(--primary-light)' : 'rgba(0,180,216,0.1)',
                            color: isNgo ? 'var(--primary)' : 'var(--secondary)',
                          }}>
                            {member.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${member.status}`}>
                            {member.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {isNgo ? (
                            <div style={styles.ngoDetailsColumn}>
                              <div style={styles.orgHeader}><Building size={12} /> <strong>{member.organizationName}</strong></div>
                              <div style={styles.detailText}>Reg: {member.registrationNumber}</div>
                              {member.website && (
                                <div style={styles.detailText}>
                                  <Globe size={10} style={{ display: 'inline', marginRight: '4px' }} />
                                  <a href={member.website} target="_blank" rel="noopener noreferrer" style={styles.websiteLink}>Website</a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>N/A</span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>
                            <div><Phone size={10} style={{ display: 'inline', marginRight: '4px' }} /> {member.phone}</div>
                            <div><MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} /> {member.address}</div>
                          </div>
                        </td>
                        <td>
                          {isPendingNgo ? (
                            <div style={styles.actionBtnGroup}>
                              <button
                                onClick={() => handleOpenActionModal(member, 'approved')}
                                className="btn btn-primary btn-sm"
                                style={styles.approveBtn}
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(member, 'rejected')}
                                className="btn btn-danger btn-sm"
                                style={styles.rejectBtn}
                              >
                                <X size={12} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No verification action needed</span>
                          )}
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
      {selectedUser && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent} className="card animate-fade-in">
            <div style={styles.modalHeader}>
              <h3>Review Registration</h3>
              <button onClick={handleCloseModal} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{
                ...styles.decisionAlert,
                background: actionStatus === 'approved' ? 'var(--status-approved-bg)' : 'var(--status-rejected-bg)',
                color: actionStatus === 'approved' ? 'var(--status-approved)' : 'var(--status-rejected)',
                borderColor: actionStatus === 'approved' ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)',
              }}>
                <ShieldAlert size={18} />
                <span>You are marking this NGO registration as <strong>{actionStatus.toUpperCase()}</strong>.</span>
              </div>

              <div style={styles.reviewSummaryBox}>
                <Building size={16} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{selectedUser.organizationName}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered By: {selectedUser.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cert Registration #: {selectedUser.registrationNumber}</p>
                </div>
              </div>

              {error && <div style={styles.errorAlert}>{error}</div>}
              {success && <div style={styles.successAlert}>{success}</div>}

              <form onSubmit={handleStatusSubmit} style={styles.modalForm}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Please ensure you have performed a background review of the registration number. Once approved, the NGO can begin requesting medicines.
                </p>

                <div style={styles.modalCta}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={submitting}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      background: actionStatus === 'approved' ? 'var(--status-approved)' : 'var(--status-rejected)',
                      color: '#fff',
                    }}
                    disabled={submitting || success}
                  >
                    {submitting ? 'Updating...' : `Confirm ${actionStatus === 'approved' ? 'Approval' : 'Rejection'}`}
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
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
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
  filterTabs: {
    display: 'flex',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    padding: '4px',
    borderRadius: '10px',
  },
  filterTabBtn: {
    padding: '8px 16px',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  activeFilterTab: {
    background: '#fff',
    color: 'var(--primary)',
    boxShadow: 'var(--shadow-sm)',
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
  memberName: {
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  detailText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'block',
  },
  roleTag: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: '6px',
  },
  ngoDetailsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  orgHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
  },
  websiteLink: {
    color: 'var(--primary)',
    textDecoration: 'underline',
  },
  actionBtnGroup: {
    display: 'flex',
    gap: '8px',
  },
  approveBtn: {
    padding: '5px 10px',
    fontSize: '0.75rem',
  },
  rejectBtn: {
    padding: '5px 10px',
    fontSize: '0.75rem',
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
  reviewSummaryBox: {
    display: 'flex',
    gap: '12px',
    background: 'var(--bg-app)',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '18px',
    border: '1px solid var(--border-color)',
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

export default AdminUsers;
