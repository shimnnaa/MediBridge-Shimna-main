import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Heart size={16} fill="currentColor" />
            </div>
            <span style={styles.logoText}>Medi<span style={styles.logoAccent}>Bridge</span></span>
          </div>
          <p style={styles.description}>
            Connecting donors with verified NGOs and beneficiaries to redistribute surplus, unexpired, and sealed medicines to patients in need. Reducing waste, saving lives.
          </p>
        </div>
        <div style={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} MediBridge. All rights reserved.</p>
          <p style={styles.credit}>
            Promoting healthcare accessibility and social responsibility.
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: 'hsl(210, 30%, 12%)',
    color: 'hsl(210, 17%, 82%)',
    padding: '40px 24px 20px 24px',
    borderTop: '1px solid hsl(210, 20%, 20%)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '500px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    background: 'var(--primary)',
    color: '#fff',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#fff',
  },
  logoAccent: {
    color: 'var(--primary)',
  },
  description: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
    color: 'hsl(210, 15%, 70%)',
  },
  bottom: {
    borderTop: '1px solid hsl(210, 20%, 20%)',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    fontSize: '0.85rem',
    color: 'hsl(210, 10%, 60%)',
  },
  credit: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

export default Footer;
