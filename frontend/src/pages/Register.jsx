import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ShieldCheck, UserCheck, HeartHandshake, User, Mail, Lock, Phone, MapPin, Building, FileText, Globe, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('donor'); // 'donor', 'beneficiary', or 'ngo'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Beneficiary specific states
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [website, setWebsite] = useState('');

  // OTP Verification states
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setError('');
    setOtpMessage('');

    if (!email) {
      setError('Please enter your email address first to receive the OTP.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api('/auth/send-otp', {
        method: 'POST',
        body: { email: email.trim(), phone: phone.trim(), role },
      });

      if (res.success) {
        setOtpSent(true);
        if (res.demoOtp) {
          setDemoOtp(res.demoOtp);
          setOtp(res.demoOtp); // Auto-fill for convenience
        }
        setOtpMessage(res.message || 'OTP sent successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      const res = await api('/auth/verify-otp', {
        method: 'POST',
        body: { email: email.trim(), otp: otp.trim() },
      });

      if (res.success) {
        setOtpVerified(true);
        setOtpMessage('✅ OTP Verified Successfully!');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Common validations
    if (!name || !email || !password || !phone || !address) {
      setError('Please fill in all common contact and password details.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Role specific validation: Organization details MANDATORY ONLY for NGO
    if (role === 'ngo') {
      if (!organizationName || !registrationNumber) {
        setError('Organization Name and NGO Registration Number are mandatory for NGO registration.');
        return;
      }
    }

    const payload = {
      name,
      email,
      password,
      role: role, // 'donor', 'beneficiary', or 'ngo'
      phone,
      address,
      ...(role === 'ngo' && {
        organizationName: organizationName.trim(),
        registrationNumber: registrationNumber.trim(),
        website: website ? website.trim() : '',
      }),
      ...(role === 'beneficiary' && {
        organizationName: organizationName ? organizationName.trim() : '',
        registrationNumber: registrationNumber ? registrationNumber.trim() : '',
        website: website ? website.trim() : '',
      }),
    };

    setLoading(true);
    try {
      await register(payload);
      setSuccess('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.card} className="card">
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <ShieldCheck size={28} color="var(--primary)" />
          </div>
          <h2 style={styles.title}>Secure Register</h2>
          <p style={styles.subtitle}>Join MediBridge to start contributing or receiving medicines</p>
        </div>

        {/* Role Toggles - Main Category */}
        <div style={styles.roleTabs}>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(role === 'donor' ? styles.activeTab : {}),
            }}
            onClick={() => {
              setRole('donor');
              setError('');
            }}
            disabled={loading}
          >
            <User size={16} /> Individual Donor
          </button>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(role !== 'donor' ? styles.activeTab : {}),
            }}
            onClick={() => {
              if (role === 'donor') setRole('beneficiary');
              setError('');
            }}
            disabled={loading}
          >
            <Building size={16} /> Beneficiary / NGO
          </button>
        </div>

        {/* First choose whether Beneficiary or NGO! */}
        {role !== 'donor' && (
          <div style={styles.entitySelectorBox} className="animate-fade-in">
            <label style={styles.entitySelectorLabel}>
              Are you an Individual Beneficiary or a Registered NGO? *
            </label>
            <div style={styles.entityButtonsRow}>
              <button
                type="button"
                style={{
                  ...styles.entityBtn,
                  ...(role === 'beneficiary' ? styles.activeEntityBtn : {}),
                }}
                onClick={() => {
                  setRole('beneficiary');
                  setError('');
                }}
                disabled={loading}
              >
                <HeartHandshake size={20} color={role === 'beneficiary' ? 'var(--primary)' : 'var(--text-muted)'} />
                <div style={{ textAlign: 'left' }}>
                  <strong>Individual Beneficiary</strong>
                  <span style={styles.entityBtnSub}>Patient / Personal healthcare need (No organization details required)</span>
                </div>
              </button>

              <button
                type="button"
                style={{
                  ...styles.entityBtn,
                  ...(role === 'ngo' ? styles.activeEntityBtn : {}),
                }}
                onClick={() => {
                  setRole('ngo');
                  setError('');
                }}
                disabled={loading}
              >
                <Building size={20} color={role === 'ngo' ? 'var(--primary)' : 'var(--text-muted)'} />
                <div style={{ textAlign: 'left' }}>
                  <strong>Registered NGO / Trust</strong>
                  <span style={styles.entityBtnSub}>Organization details & registration number mandatory</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formSectionTitle}>Account & Contact Details</h3>
          
          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={16} style={styles.inputIcon} />
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  style={styles.inputWithIcon}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  style={styles.inputWithIcon}
                  disabled={loading || otpVerified}
                  required
                />
              </div>
            </div>
          </div>

          {/* OTP Verification Box */}
          <div style={styles.otpCard}>
            <div style={styles.otpHeader}>
              <KeyRound size={16} color="var(--primary)" />
              <span style={styles.otpTitle}>Email / Identity Verification (OTP)</span>
              {otpVerified && <span style={styles.verifiedBadge}><CheckCircle2 size={14} /> Verified</span>}
            </div>

            <div style={styles.otpRow}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.otpInput}
                disabled={loading || otpVerified}
              />

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !email}
                  className="btn btn-primary"
                  style={styles.otpActionBtn}
                >
                  {sendingOtp ? <RefreshCw size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  {sendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpVerified || !otp}
                  className={`btn ${otpVerified ? 'btn-secondary' : 'btn-primary'}`}
                  style={styles.otpActionBtn}
                >
                  {otpVerified ? 'Verified' : 'Verify OTP'}
                </button>
              )}
            </div>

            {otpMessage && (
              <p style={{ fontSize: '0.82rem', color: otpVerified ? 'var(--primary)' : 'var(--text-muted)', marginTop: '4px' }}>
                {otpMessage} {demoOtp && !otpVerified && `(Auto-filled Demo OTP: ${demoOtp})`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label htmlFor="password">Password (6+ chars)</label>
              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  style={styles.inputWithIcon}
                  disabled={loading}
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
                  placeholder="1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  style={styles.inputWithIcon}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Physical Address</label>
            <div style={styles.inputWrapper}>
              <MapPin size={16} style={styles.inputIcon} />
              <input
                id="address"
                type="text"
                placeholder="123 Care Street, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-control"
                style={styles.inputWithIcon}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* NGO Organization Details - STRICTLY MANDATORY ONLY FOR NGO */}
          {role === 'ngo' && (
            <div style={styles.ngoSection} className="animate-fade-in">
              <div style={styles.sectionHeaderWrap}>
                <h3 style={styles.formSectionTitle}>Registered NGO / Trust Details</h3>
                <span style={styles.mandatoryBadge}>* Mandatory for NGO</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="orgName">
                  Organization / Trust Name <span style={{ color: 'var(--status-rejected)' }}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <Building size={16} style={styles.inputIcon} />
                  <input
                    id="orgName"
                    type="text"
                    placeholder="e.g. Hope Care Health Mission"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="form-control"
                    style={styles.inputWithIcon}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="regNum">
                    NGO Registration Number <span style={{ color: 'var(--status-rejected)' }}>*</span>
                  </label>
                  <div style={styles.inputWrapper}>
                    <FileText size={16} style={styles.inputIcon} />
                    <input
                      id="regNum"
                      type="text"
                      placeholder="e.g. REG-987654 / Trust ID"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="form-control"
                      style={styles.inputWithIcon}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website URL (Optional)</label>
                  <div style={styles.inputWrapper}>
                    <Globe size={16} style={styles.inputIcon} />
                    <input
                      id="website"
                      type="url"
                      placeholder="https://ngo.org"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="form-control"
                      style={styles.inputWithIcon}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.infoBox}>
                <Building size={18} color="var(--primary)" />
                <p style={styles.infoText}>
                  Registered NGO accounts require administrator manual verification. Once approved by admin, you will be able to view donor contact details and request surplus medicines for your mission.
                </p>
              </div>
            </div>
          )}

          {/* Individual Beneficiary - No Organization Details Required */}
          {role === 'beneficiary' && (
            <div style={styles.beneficiaryNotice} className="animate-fade-in">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <HeartHandshake size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Individual Beneficiary Account
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    As an individual patient, <strong>no organization details or NGO registration numbers are required</strong>. Simply submit your basic contact information to proceed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Registering Account...' : (
              <>
                <UserCheck size={18} /> Complete Registration
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p>Already have an account?</p>
          <Link to="/login" style={styles.loginLink}>Login Securely</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    maxWidth: '560px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  iconBox: {
    width: '54px',
    height: '54px',
    borderRadius: '12px',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  roleTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    background: 'var(--bg-app)',
    padding: '4px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    gap: '4px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    fontSize: '0.95rem',
    fontWeight: 700,
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  activeTab: {
    background: '#fff',
    color: 'var(--primary)',
    boxShadow: 'var(--shadow-sm)',
  },
  entitySelectorBox: {
    background: 'hsl(168, 40%, 98%)',
    border: '1.5px solid rgba(15, 165, 124, 0.3)',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  entitySelectorLabel: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  entityButtonsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
  },
  entityBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    background: '#ffffff',
    border: '1.5px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  activeEntityBtn: {
    borderColor: 'var(--primary)',
    background: 'var(--primary-light)',
    boxShadow: '0 0 0 2px rgba(15, 165, 124, 0.2)',
  },
  entityBtnSub: {
    display: 'block',
    fontSize: '0.74rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
    fontWeight: 500,
  },
  errorAlert: {
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    border: '1px solid rgba(220, 53, 69, 0.2)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  successAlert: {
    background: 'var(--status-approved-bg)',
    color: 'var(--status-approved)',
    border: '1px solid rgba(40, 167, 69, 0.2)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formSectionTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px',
    color: 'var(--primary)',
    marginTop: '10px',
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
  sectionHeaderWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px',
    marginTop: '10px',
  },
  mandatoryBadge: {
    fontSize: '0.72rem',
    fontWeight: 700,
    background: 'rgba(220, 53, 69, 0.1)',
    color: 'var(--status-rejected)',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(220, 53, 69, 0.25)',
  },
  ngoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  beneficiaryNotice: {
    background: 'hsl(168, 45%, 97%)',
    border: '1px solid rgba(15, 165, 124, 0.25)',
    borderRadius: '10px',
    padding: '14px 16px',
  },
  otpCard: {
    background: 'hsl(168, 50%, 98%)',
    border: '1px solid rgba(15, 165, 124, 0.25)',
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  otpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  otpTitle: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    flex: 1,
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'var(--status-approved-bg)',
    color: 'var(--status-approved)',
    fontSize: '0.78rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
  },
  otpRow: {
    display: 'flex',
    gap: '10px',
  },
  otpInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '1rem',
    letterSpacing: '2px',
    fontWeight: 700,
  },
  otpActionBtn: {
    padding: '10px 16px',
    fontSize: '0.88rem',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    background: 'var(--primary-light)',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid rgba(15, 165, 124, 0.1)',
  },
  infoText: {
    fontSize: '0.85rem',
    color: 'var(--primary-hover)',
    lineHeight: '1.45',
    fontWeight: 600,
  },
  submitBtn: {
    marginTop: '12px',
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.9rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  loginLink: {
    color: 'var(--primary)',
    fontWeight: 700,
  },
};

export default Register;
