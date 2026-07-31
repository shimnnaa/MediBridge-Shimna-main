import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, ShieldCheck, AlertCircle } from 'lucide-react';

const AdminReports = () => {
  const [downloading, setDownloading] = useState({ donations: false, requests: false });
  const [error, setError] = useState('');

  const downloadReport = async (type) => {
    setError('');
    setDownloading(prev => ({ ...prev, [type]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/reports/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${type} report. Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_ledger_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message || `An error occurred while exporting the ${type} report.`);
    } finally {
      setDownloading(prev => ({ ...prev, [type]: false }));
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
          <h1 style={styles.title}>System Reports & Audits</h1>
          <p style={styles.subtitle}>Export database ledgers as CSV files for regulatory compliance and compliance archiving.</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.grid}>
          {/* Card 1: Donations */}
          <div className="card" style={styles.reportCard}>
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}>
                <FileText size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 style={styles.cardTitle}>Donations Registry Ledger</h3>
                <p style={styles.cardSubtitle}>Full archive of all registered medicine donations</p>
              </div>
            </div>
            <div style={styles.cardBody}>
              <p>Includes details on medicine name, manufacturer, batch number, original and current quantities, donor profile information, administrative verification status, and timestamps.</p>
            </div>
            <div style={styles.cardFooter}>
              <button
                onClick={() => downloadReport('donations')}
                className="btn btn-primary"
                style={styles.downloadBtn}
                disabled={downloading.donations}
              >
                {downloading.donations ? 'Generating CSV...' : (
                  <>
                    <Download size={18} /> Export Donations CSV
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Requests */}
          <div className="card" style={styles.reportCard}>
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}>
                <FileText size={24} color="var(--secondary)" />
              </div>
              <div>
                <h3 style={styles.cardTitle}>Redistribution Requests Ledger</h3>
                <p style={styles.cardSubtitle}>Comprehensive logs of all beneficiary clinic requests</p>
              </div>
            </div>
            <div style={styles.cardBody}>
              <p>Includes details on medicine requested, requesting NGO/organization name, credentials, requested quantities, clinical justification descriptions, admin approval status, and remarks.</p>
            </div>
            <div style={styles.cardFooter}>
              <button
                onClick={() => downloadReport('requests')}
                className="btn btn-primary"
                style={{ ...styles.downloadBtn, background: 'var(--secondary)' }}
                disabled={downloading.requests}
              >
                {downloading.requests ? 'Generating CSV...' : (
                  <>
                    <Download size={18} /> Export Requests CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div style={styles.auditNotice} className="card">
          <ShieldCheck size={20} color="var(--primary)" />
          <p style={{ fontSize: '0.88rem', color: 'hsl(210, 20%, 30%)', lineHeight: '1.45' }}>
            <strong>Audit Integrity Notice:</strong> All CSV reports are compiled directly from live database collections. Modifications are logged, and deletions are restricted for trace documentation. Keep downloads secure to respect patient and donor privacy.
          </p>
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
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  reportCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardHeader: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  cardSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  cardBody: {
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },
  cardFooter: {
    marginTop: 'auto',
  },
  downloadBtn: {
    width: '100%',
    padding: '12px',
  },
  auditNotice: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    background: 'var(--primary-light)',
    borderColor: 'rgba(15, 165, 124, 0.1)',
    padding: '16px 20px',
  },
};

export default AdminReports;
