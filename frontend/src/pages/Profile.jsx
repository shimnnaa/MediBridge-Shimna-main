import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Phone, MapPin, Building, FileText, Globe, Lock, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();

  if (!user) return null;

  // Profile fields state
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [organizationName, setOrganizationName] = useState(user.organizationName || '');
  const [registrationNumber, setRegistrationNumber] = useState(user.registrationNumber || '');
  const [website, setWebsite] = useState(user.website || '');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI feedback states
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name || !phone || !address) {
      setProfileError('Name, phone, and address are required.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const payload = {
        name,
        phone,
        address,
        ...(user.role === 'beneficiary' && {
          organizationName,
          registrationNumber,
          website,
        }),
      };
      await updateProfile(payload);
      setProfileSuccess('Profile details updated successfully!');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Verify your current password.');
    } finally {
      setUpdatingPassword(false);
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
          <h1 style={styles.title}>Account Settings</h1>
          <p style={styles.subtitle}>Manage your profile details and security settings.</p>
        </div>

        <div style={styles.grid}>
          {/* Left panel: Profile update */}
          <div className="card" style={styles.panel}>
            <div style={styles.sectionHeader}>
              <div style={styles.iconBox}>
                <User size={20} color="var(--primary)" />
              </div>
              <div>
                <h3 style={styles.sectionTitle}>Profile Details</h3>
                <p style={styles.sectionSubtitle}>Update contact and organization information</p>
              </div>
            </div>

            {profileSuccess && <div style={styles.successAlert}>{profileSuccess}</div>}
            {profileError && <div style={styles.errorAlert}>{profileError}</div>}

            <form onSubmit={handleProfileSubmit} style={styles.form}>
              <div className="form-group">
                <label>Email Address (Cannot change)</label>
                <input
                  type="email"
                  value={user.email}
                  className="form-control"
                  style={{ background: 'var(--bg-app)', color: 'var(--text-muted)' }}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div style={styles.inputWrapper}>
                  <User size={16} style={styles.inputIcon} />
                  <input
                    id="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    style={styles.inputWithIcon}
                    disabled={updatingProfile}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div style={styles.inputWrapper}>
                  <Phone size={16} style={styles.inputIcon} />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control"
                    style={styles.inputWithIcon}
                    disabled={updatingProfile}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <div style={styles.inputWrapper}>
                  <MapPin size={16} style={styles.inputIcon} />
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-control"
                    style={styles.inputWithIcon}
                    disabled={updatingProfile}
                    required
                  />
                </div>
              </div>

              {user.role === 'beneficiary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid var(--border-color)', paddingTop: '18px', marginTop: '10px' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>Organization Details</h4>
                  
                  <div className="form-group">
                    <label htmlFor="orgName">Organization Name</label>
                    <div style={styles.inputWrapper}>
                      <Building size={16} style={styles.inputIcon} />
                      <input
                        id="orgName"
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        className="form-control"
                        style={styles.inputWithIcon}
                        disabled={updatingProfile}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="regNum">NGO Registration Number</label>
                    <div style={styles.inputWrapper}>
                      <FileText size={16} style={styles.inputIcon} />
                      <input
                        id="regNum"
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="form-control"
                        style={styles.inputWithIcon}
                        disabled={updatingProfile}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Website URL</label>
                    <div style={styles.inputWrapper}>
                      <Globe size={16} style={styles.inputIcon} />
                      <input
                        id="website"
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="form-control"
                        style={styles.inputWithIcon}
                        disabled={updatingProfile}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={styles.saveBtn} disabled={updatingProfile}>
                {updatingProfile ? 'Saving details...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Right panel: Security / Password Change */}
          <div className="card" style={styles.panel}>
            <div style={styles.sectionHeader}>
              <div style={styles.iconBox}>
                <Lock size={20} color="var(--primary)" />
              </div>
              <div>
                <h3 style={styles.sectionTitle}>Change Password</h3>
                <p style={styles.sectionSubtitle}>Update your authentication passphrase</p>
              </div>
            </div>

            {passwordSuccess && <div style={styles.successAlert}>{passwordSuccess}</div>}
            {passwordError && <div style={styles.errorAlert}>{passwordError}</div>}

            <form onSubmit={handlePasswordSubmit} style={styles.form}>
              <div className="form-group">
                <label htmlFor="currPass">Current Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input
                    id="currPass"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-control"
                    style={styles.inputWithIcon}
                    disabled={updatingPassword}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPass">New Password (6+ characters)</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input
                    id="newPass"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control"
                    style={styles.inputWithIcon}
                    disabled={updatingPassword}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confPass">Confirm New Password</label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={styles.inputIcon} />
                  <input
                    id="confPass"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                    style={styles.inputWithIcon}
                    disabled={updatingPassword}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={styles.saveBtn} disabled={updatingPassword}>
                {updatingPassword ? 'Changing Password...' : 'Update Password'}
              </button>
            </form>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '24px',
    alignItems: 'start',
  },
  panel: {
    padding: '30px',
  },
  sectionHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    marginBottom: '24px',
  },
  iconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  sectionSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
  },
  inputWithIcon: {
    paddingLeft: '42px',
    width: '100%',
  },
  saveBtn: {
    marginTop: '10px',
    padding: '12px',
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

export default Profile;
