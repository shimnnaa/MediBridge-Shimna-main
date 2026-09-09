import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShieldCheck, ShieldAlert, Award, ArrowRight, Activity, Globe, HeartHandshake, Mail, Lock, LogIn, AlertCircle, UserCheck, PlusCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Landing page login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleQuickFill = (role) => {
    if (role === 'donor') {
      setEmail('donor@medibridge.com');
      setPassword('donor123');
    } else if (role === 'ngo') {
      setEmail('ngo@medibridge.com');
      setPassword('ngo123');
    }
    setLoginError('');
  };

  const handleHomeLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Hero Section */}
      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <Activity size={14} color="var(--primary)" />
            <span>Redistributing Hope, One Dose at a Time</span>
          </div>
          <h1 style={styles.heroTitle}>
            Don't Discard.<br />
            <span style={styles.accentText}>Donate & Share</span> Surplus Medicines.
          </h1>
          <p style={styles.heroSub}>
            MediBridge bridges the gap between generous donors with unexpired, sealed surplus medicines and verified NGOs supporting vulnerable patients in need.
          </p>
          <div style={styles.heroHighlights}>
            <div style={styles.highlightItem}>
              <HeartHandshake size={18} color="var(--primary)" />
              <span>100% Free & Transparent Redistribution</span>
            </div>
            <div style={styles.highlightItem}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>Rigorous Expiry & Safety Verification</span>
            </div>
          </div>
        </div>

        {/* Hero Right Column: Direct User Login Form on Landing Page */}
        <div style={styles.heroFormArea}>
          {user ? (
            /* Active User Welcome Card */
            <div style={styles.loggedInCard} className="card animate-fade-in">
              <div style={styles.loggedInHeader}>
                <div style={styles.avatarBox}>
                  <UserCheck size={28} color="var(--primary)" />
                </div>
                <div>
                  <span style={styles.rolePill}>{user.role.toUpperCase()} ACCOUNT</span>
                  <h3 style={styles.welcomeName}>Welcome back, {user.name}</h3>
                  <p style={styles.userEmailText}>{user.email}</p>
                </div>
              </div>

              <div style={styles.quickActionList}>
                <Link to="/dashboard" className="btn btn-primary" style={styles.actionBtn}>
                  Open Full Dashboard <ArrowRight size={16} />
                </Link>

                {user.role === 'donor' && (
                  <Link to="/donate" className="btn btn-secondary" style={styles.actionBtn}>
                    <PlusCircle size={16} /> Donate Medicine
                  </Link>
                )}

                {(user.role === 'beneficiary' || user.role === 'ngo') && (
                  <Link to="/available-medicines" className="btn btn-secondary" style={styles.actionBtn}>
                    <Search size={16} /> Request Medicines
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Normal User Login Form Embedded on Landing Page */
            <div id="login-section" style={styles.loginCard} className="card animate-fade-in">
              <div style={styles.loginHeader}>
                <div style={styles.loginIconWrap}>
                  <LogIn size={22} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={styles.loginCardTitle}>User Account Login</h3>
                  <p style={styles.loginCardSub}>For Donors and Beneficiary NGOs</p>
                </div>
              </div>

              {/* Quick Fill Demo Role Switchers */}
              <div style={styles.quickFillWrap}>
                <span style={styles.quickFillLabel}>Demo Quick-Fill:</span>
                <div style={styles.quickFillBtns}>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('donor')}
                    style={styles.roleFillBtn}
                  >
                    🩺 Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('ngo')}
                    style={styles.roleFillBtn}
                  >
                    🏥 Beneficiary / NGO
                  </button>
                </div>
              </div>

              {loginError && (
                <div style={styles.errorAlert}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleHomeLogin} style={styles.homeLoginForm}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="home-email" style={styles.inputLabel}>Email Address</label>
                  <div style={styles.inputWrap}>
                    <Mail size={16} style={styles.fieldIcon} />
                    <input
                      id="home-email"
                      type="email"
                      placeholder="donor@medibridge.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      style={styles.formInput}
                      disabled={loginLoading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="home-password" style={styles.inputLabel}>Password</label>
                  <div style={styles.inputWrap}>
                    <Lock size={16} style={styles.fieldIcon} />
                    <input
                      id="home-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control"
                      style={styles.formInput}
                      disabled={loginLoading}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={styles.submitBtn}
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Signing in...' : (
                    <>
                      <LogIn size={18} /> Sign In to MediBridge
                    </>
                  )}
                </button>
              </form>

              <div style={styles.formFooter}>
                <span>Don't have an account yet?</span>
                <Link to="/register" style={styles.registerLink}>
                  Register Securely <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <h2>12K+</h2>
            <p>Medicines Redistributed</p>
          </div>
          <div style={styles.statBox}>
            <h2>150+</h2>
            <p>Verified NGOs Joined</p>
          </div>
          <div style={styles.statBox}>
            <h2>98%</h2>
            <p>Safety & Integrity Score</p>
          </div>
          <div style={styles.statBox}>
            <h2>$50K+</h2>
            <p>Healthcare Costs Saved</p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section style={styles.workflowSection}>
        <h2 style={styles.sectionTitle}>How MediBridge Works</h2>
        <p style={styles.sectionSub}>A secure, simple, and transparent medicine sharing pipeline.</p>
        
        <div style={styles.stepGrid}>
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepNumber, background: 'var(--primary-glow)', color: 'var(--primary)' }}>1</div>
            <h4>Donate Medicines</h4>
            <p>Donors securely upload medicine information, including batch details, manufacturer, and expiry date.</p>
          </div>
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepNumber, background: 'rgba(0, 180, 216, 0.1)', color: 'var(--secondary)' }}>2</div>
            <h4>Admin Verification</h4>
            <p>Our administrators verify the authenticity and expiry of the submitted batch to maintain safety protocols.</p>
          </div>
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepNumber, background: 'var(--primary-glow)', color: 'var(--primary)' }}>3</div>
            <h4>NGO Requests</h4>
            <p>Verified beneficiaries and charities search the index and place requests for their local clinical needs.</p>
          </div>
          <div style={styles.stepCard}>
            <div style={{ ...styles.stepNumber, background: 'rgba(0, 180, 216, 0.1)', color: 'var(--secondary)' }}>4</div>
            <h4>Transparent Delivery</h4>
            <p>Admin approves requests, stocks are decremented, and distribution is executed safely.</p>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section style={styles.benefitsSection}>
        <div style={styles.benefitsGrid}>
          <div style={styles.benefitsContent}>
            <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>Why Donate Through MediBridge?</h2>
            <div style={styles.benefitRow}>
              <Award size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <h5>Minimize Medical Wastage</h5>
                <p>Prevent valuable, unexpired prescription batches from clogging landfills and harming the environment.</p>
              </div>
            </div>
            <div style={styles.benefitRow}>
              <Globe size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <h5>Support Local Communities</h5>
                <p>Equip rural clinics, disaster relief agencies, and community care centers with critical pharmacy inventory.</p>
              </div>
            </div>
            <div style={styles.benefitRow}>
              <ShieldAlert size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <h5>Rigorous Expiry Monitoring</h5>
                <p>Our smart platform flags and blocks expired listings, guaranteeing security and compliance.</p>
              </div>
            </div>
          </div>
          <div style={styles.benefitsVisual}>
            <div style={styles.visualCard}>
              <Heart size={48} color="#e63946" fill="#e63946" />
              <h4>Join Our Mission Today</h4>
              <p>Sign up now to register as an individual donor, an organization, or apply as a healthcare recipient NGO.</p>
              <Link to="/register" style={{ marginTop: '15px' }} className="btn btn-primary">Create Secure Account</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '80px',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '40px',
    alignItems: 'center',
    paddingTop: '20px',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '20px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--primary-light)',
    border: '1px solid rgba(15, 165, 124, 0.2)',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    lineHeight: '1.15',
    letterSpacing: '-1.5px',
  },
  accentText: {
    color: 'var(--primary)',
    background: 'linear-gradient(120deg, var(--primary) 0%, var(--secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    maxWidth: '540px',
  },
  heroHighlights: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '4px',
  },
  highlightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  heroFormArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginCard: {
    width: '100%',
    maxWidth: '430px',
    background: '#ffffff',
    border: '1px solid rgba(15, 165, 124, 0.2)',
    borderRadius: '20px',
    padding: '30px 28px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 165, 124, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  loginHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  loginIconWrap: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  loginCardTitle: {
    fontSize: '1.35rem',
    fontWeight: 800,
    color: 'hsl(210, 24%, 12%)',
    margin: 0,
  },
  loginCardSub: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    margin: 0,
  },
  quickFillWrap: {
    background: 'var(--bg-app)',
    border: '1px dashed var(--border-color)',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  quickFillLabel: {
    fontSize: '0.76rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
  },
  quickFillBtns: {
    display: 'flex',
    gap: '8px',
  },
  roleFillBtn: {
    background: '#fff',
    border: '1px solid var(--border-color)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  errorAlert: {
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    border: '1px solid rgba(220, 53, 69, 0.2)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.84rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  homeLoginForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputLabel: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '4px',
    display: 'block',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
  },
  formInput: {
    paddingLeft: '38px',
    width: '100%',
    height: '42px',
    fontSize: '0.92rem',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '0.96rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  formFooter: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
  },
  registerLink: {
    color: 'var(--primary)',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  loggedInCard: {
    width: '100%',
    maxWidth: '430px',
    background: '#ffffff',
    border: '1px solid rgba(15, 165, 124, 0.25)',
    borderRadius: '20px',
    padding: '32px 28px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  loggedInHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatarBox: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rolePill: {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: 800,
    color: 'var(--primary)',
    background: 'var(--primary-light)',
    padding: '2px 8px',
    borderRadius: '6px',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  welcomeName: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'hsl(210, 24%, 12%)',
    margin: 0,
  },
  userEmailText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    margin: 0,
  },
  quickActionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    fontWeight: 700,
    fontSize: '0.92rem',
  },
  statsSection: {
    background: 'linear-gradient(135deg, hsl(210, 30%, 12%), hsl(210, 30%, 8%))',
    color: '#fff',
    borderRadius: '24px',
    padding: '40px 24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '30px',
    textAlign: 'center',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  workflowSection: {
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '2rem',
    marginBottom: '12px',
  },
  sectionSub: {
    color: 'var(--text-muted)',
    fontSize: '1.05rem',
    marginBottom: '48px',
  },
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },
  stepCard: {
    background: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    boxShadow: 'var(--shadow-sm)',
  },
  stepNumber: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 800,
  },
  benefitsSection: {
    background: 'linear-gradient(to right, var(--primary-light), var(--secondary-light))',
    borderRadius: '24px',
    padding: '50px 40px',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '50px',
    alignItems: 'center',
  },
  benefitsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  benefitRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  benefitsVisual: {
    display: 'flex',
    justifyContent: 'center',
  },
  visualCard: {
    background: '#fff',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: 'var(--shadow-lg)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '320px',
  },
};

export default Home;
