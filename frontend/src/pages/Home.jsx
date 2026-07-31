import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, ShieldAlert, Award, ArrowRight, Activity, Globe, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

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
          <div style={styles.ctaGroup}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary" style={styles.ctaBtn}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={styles.ctaBtn}>
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary" style={styles.ctaBtnSec}>
                  Login Account
                </Link>
              </>
            )}
          </div>
        </div>
        <div style={styles.heroGraphics}>
          <div style={styles.graphicsCard}>
            <div style={styles.cardHeader}>
              <HeartHandshake size={32} color="var(--primary)" />
              <h3>Safe Redistribution</h3>
            </div>
            <p>Every donation undergoes administrative inspection and validation before listing.</p>
          </div>
          <div style={{ ...styles.graphicsCard, transform: 'translateY(30px)' }}>
            <div style={styles.cardHeader}>
              <ShieldCheck size={32} color="var(--secondary)" />
              <h3>Verified Beneficiaries</h3>
            </div>
            <p>Only verified NGOs and social welfare groups can claim medicines on our platform.</p>
          </div>
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
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '40px',
    alignItems: 'center',
    paddingTop: '20px',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '24px',
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
    fontSize: '3.2rem',
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
    fontSize: '1.15rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    maxWidth: '560px',
  },
  ctaGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  ctaBtn: {
    padding: '14px 28px',
    fontSize: '1.05rem',
    boxShadow: '0 8px 20px rgba(15, 165, 124, 0.25)',
  },
  ctaBtnSec: {
    padding: '14px 28px',
    fontSize: '1.05rem',
  },
  heroGraphics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'relative',
  },
  graphicsCard: {
    background: '#fff',
    border: '1px solid var(--border-color)',
    padding: '24px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-lg)',
    maxWidth: '340px',
    marginLeft: 'auto',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
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
