import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ShieldCheck, UserCheck, HeartHandshake, User, Mail, Lock, Phone, MapPin, Building, FileText, Globe } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('donor'); // 'donor' or 'beneficiary'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Beneficiary specific states
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [website, setWebsite] = useState('');

  // OTP states
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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

    if (!otpSent) {
      setError('Please click "Send OTP" and verify your email address first.');
      return;
    }

    if (!otp) {
      setError('Please enter the verification OTP code sent to your email.');
      return;
    }

    // Role specific validation
    if (role === 'beneficiary') {
      if (!organizationName || !registrationNumber) {
        setError('Please provide organization name and registration credentials for verification.');
        return;
      }
    }

    const payload = {
      name,
      email,
      password,
      role,
      phone,
      address,
      otp,
      ...(role === 'beneficiary' && {
        organizationName,
        registrationNumber,
        website,
      }),
    };

    setLoading(true);
    try {
      await register(payload);
      setSuccess('Account created successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    // Basic email format check
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSuccess('');
    setSendingOtp(true);

    try {
      const response = await api('/auth/send-otp', {
        method: 'POST',
        body: { email },
      });

      if (response.success) {
        setOtpSent(true);
        setSuccess('Verification OTP code sent to your email! Please check your inbox.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setSendingOtp(false);
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

        {/* Role Toggles */}
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
              ...(role === 'beneficiary' ? styles.activeTab : {}),
            }}
            onClick={() => {
              setRole('beneficiary');
              setError('');
            }}
            disabled={loading}
          >
            <HeartHandshake size={16} /> Beneficiary / NGO
          </button>
        </div>

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
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ ...styles.inputWrapper, flex: 1 }}>
                  <Mail size={16} style={styles.inputIcon} />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    style={styles.inputWithIcon}
                    disabled={loading || otpSent}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0 16px', fontSize: '0.85rem', height: '42px' }}
                  disabled={sendingOtp || !email || loading}
                >
                  {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="form-group animate-fade-in" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="otp" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  Email Verification Code (OTP) *
                </label>
                <div style={styles.inputWrapper}>
                  <Lock size={16} style={{ ...styles.inputIcon, color: 'var(--primary)' }} />
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="form-control"
                    style={{ ...styles.inputWithIcon, borderColor: 'var(--primary)', fontWeight: 'bold', letterSpacing: '4px', textAlign: 'center' }}
                    maxLength="6"
                    disabled={loading}
                    required
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Please enter the 6-digit verification code sent to your email.
                </p>
              </div>
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

          {/* NGO/Beneficiary Fields */}
          {role === 'beneficiary' && (
            <div style={styles.ngoSection} className="animate-fade-in">
              <h3 style={styles.formSectionTitle}>NGO Verification Details</h3>
              
              <div className="form-group">
                <label htmlFor="orgName">Organization Name</label>
                <div style={styles.inputWrapper}>
                  <Building size={16} style={styles.inputIcon} />
                  <input
                    id="orgName"
                    type="text"
                    placeholder="Welfare Foundation NGO"
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
                  <label htmlFor="regNum">NGO Registration #</label>
                  <div style={styles.inputWrapper}>
                    <FileText size={16} style={styles.inputIcon} />
                    <input
                      id="regNum"
                      type="text"
                      placeholder="REG-987654"
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
                  NGO accounts require administrator manual verification. You will be able to browse dashboard details but cannot request medicines until verified.
                </p>
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
    gridTemplateColumns: '1fr 1fr',
    background: 'var(--bg-app)',
    padding: '4px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
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
  ngoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
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
