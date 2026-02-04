"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info, Download, Share2, Clock, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface Remediation {
  permission: string;
  fix: string;
}

interface PolicyIssue {
  permission: string;
  policy: string;
  severity: string;
  rejection_reason: string;
  remediation: string;
}

interface RiskItem {
  permission: string;
  risk: string;
}

interface Report {
  id: number;
  package_name: string;
  app_label: string;
  permissions: string[];
  risk_report: RiskItem[];
  policy_issues: PolicyIssue[];
  suspicious_services: { name: string; enabled: string }[];
  verdict: string;
  rejection_probability: number;
  confidence: string;
  reasons: string[];
  remediations: Remediation[];
  reviewer_comment: string;
  created_at: string;
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    HIGH:    { bg: "rgba(139, 0, 0, 0.2)", text: "#ff6b6b", border: "rgba(255, 107, 107, 0.3)" },
    MEDIUM:  { bg: "rgba(184, 134, 11, 0.2)", text: "#ffd700", border: "rgba(255, 215, 0, 0.3)" },
    LOW:     { bg: "rgba(34, 139, 34, 0.2)", text: "#90ee90", border: "rgba(144, 238, 144, 0.3)" },
    UNKNOWN: { bg: "rgba(253, 240, 213, 0.1)", text: "#fdf0d5", border: "rgba(253, 240, 213, 0.2)" },
  };
  const { bg, text, border } = colors[level] || colors.UNKNOWN;
  return (
    <span style={{
      background: bg,
      color: text,
      border: `1px solid ${border}`,
      padding: "0.5rem 1rem",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: "0.25rem",
      whiteSpace: "nowrap"
    }}>
      {level === "HIGH" && <AlertTriangle size={12} />}
      {level}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    REJECTED: { 
      bg: "linear-gradient(135deg, rgba(139, 0, 0, 0.2), rgba(178, 34, 34, 0.2))", 
      text: "#ff6b6b",
      icon: <XCircle size={20} />
    },
    WARNING:  { 
      bg: "linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(218, 165, 32, 0.2))", 
      text: "#ffd700",
      icon: <AlertTriangle size={20} />
    },
    APPROVED: { 
      bg: "linear-gradient(135deg, rgba(40, 54, 24, 0.3), rgba(60, 80, 30, 0.3))", 
      text: "#90ee90",
      icon: <CheckCircle size={20} />
    },
  };
  const { bg, text, icon } = colors[verdict] || colors.REJECTED;
  return (
    <div style={{
      background: bg,
      color: text,
      border: `1px solid rgba(253, 240, 213, 0.1)`,
      padding: "1rem 1.5rem",
      borderRadius: "16px",
      fontSize: "1rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.75rem",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
    }}>
      {icon}
      {verdict}
    </div>
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    permissions: false,
    suspicious: false
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/reports/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Report not found");
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExportJSON = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.package_name}-analysis-${report.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (!report) return;
    
    setExporting(true);
    
    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analysis Report - ${report.app_label}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #003049; border-bottom: 3px solid #003049; padding-bottom: 10px; }
    h2 { color: #283618; margin-top: 30px; border-left: 4px solid #283618; padding-left: 10px; }
    h3 { color: #003049; }
    .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
    .verdict { 
      display: inline-block;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: bold;
      margin: 10px 0;
    }
    .verdict.REJECTED { background: #ffebee; color: #c62828; }
    .verdict.WARNING { background: #fff8e1; color: #f57f17; }
    .verdict.APPROVED { background: #e8f5e9; color: #2e7d32; }
    .risk-score {
      font-size: 48px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .risk-HIGH { color: #c62828; }
    .risk-MEDIUM { color: #f57f17; }
    .risk-LOW { color: #2e7d32; }
    .issue {
      background: #f5f5f5;
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #ff6b6b;
      border-radius: 4px;
    }
    .permission-list {
      background: #fafafa;
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;
    }
    .permission-item {
      padding: 8px;
      margin: 5px 0;
      background: white;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-HIGH { background: #ffebee; color: #c62828; }
    .badge-MEDIUM { background: #fff8e1; color: #f57f17; }
    .badge-LOW { background: #e8f5e9; color: #2e7d32; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .comment-box {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #003049;
      margin: 20px 0;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <h1>Play Store Compliance Analysis Report</h1>
  
  <div class="header">
    <h2 style="margin-top: 0; border: none; padding: 0;">${report.app_label}</h2>
    <div class="info-row">
      <strong>Package Name:</strong>
      <span>${report.package_name}</span>
    </div>
    <div class="info-row">
      <strong>Report ID:</strong>
      <span>#${report.id}</span>
    </div>
    <div class="info-row">
      <strong>Analysis Date:</strong>
      <span>${new Date(report.created_at).toLocaleString()}</span>
    </div>
    <div>
      <strong>Verdict:</strong>
      <span class="verdict ${report.verdict}">${report.verdict}</span>
    </div>
  </div>

  <h2>Rejection Risk Assessment</h2>
  <div class="risk-score risk-${report.rejection_probability > 0.6 ? 'HIGH' : report.rejection_probability > 0.3 ? 'MEDIUM' : 'LOW'}">
    ${Math.round(report.rejection_probability * 100)}%
  </div>
  <p style="text-align: center; color: #666;">
    Analysis Confidence: <strong>${report.confidence}</strong>
  </p>

  ${report.policy_issues.length > 0 ? `
  <h2>Policy Violations (${report.policy_issues.length})</h2>
  ${report.policy_issues.map(issue => `
    <div class="issue">
      <h3>${issue.permission} <span class="badge badge-${issue.severity}">${issue.severity}</span></h3>
      <p><strong>Policy:</strong> ${issue.policy}</p>
      <p><strong>Issue:</strong> ${issue.rejection_reason}</p>
      <p style="background: #e8f5e9; padding: 10px; border-radius: 4px; margin-top: 10px;">
        <strong>✓ Recommended Fix:</strong> ${issue.remediation}
      </p>
    </div>
  `).join('')}
  ` : ''}

  <h2>Permissions Analysis (${report.risk_report.length})</h2>
  <div class="permission-list">
    ${report.risk_report.map(item => `
      <div class="permission-item">
        <span>${item.permission}</span>
        <span class="badge badge-${item.risk}">${item.risk}</span>
      </div>
    `).join('')}
  </div>

  ${report.suspicious_services.length > 0 ? `
  <h2>Suspicious Services (${report.suspicious_services.length})</h2>
  <div class="permission-list">
    ${report.suspicious_services.map(svc => `
      <div class="permission-item">
        <span>${svc.name}</span>
        <span style="color: ${svc.enabled === 'true' ? '#c62828' : '#2e7d32'};">
          ${svc.enabled === 'true' ? '● Enabled' : '○ Disabled'}
        </span>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <h2>AI Review Summary</h2>
  <div class="comment-box">
    ${report.reviewer_comment || 'No comment generated.'}
  </div>

  <div class="footer">
    <p>Play Store Reviewer v1.0 - Professional Compliance Analysis</p>
    <p>Report generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `;

    // Create and download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.package_name}-analysis-report-${report.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExporting(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareViaEmail = () => {
    if (!report) return;
    const subject = `Play Store Analysis Report - ${report.app_label}`;
    const body = `I wanted to share this Play Store compliance analysis report with you:\n\nApp: ${report.app_label}\nPackage: ${report.package_name}\nVerdict: ${report.verdict}\nRisk Score: ${Math.round(report.rejection_probability * 100)}%\n\nView full report: ${window.location.href}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-large" />
      <p className="loading-text">Loading detailed analysis...</p>
      <style jsx>{`
        .loading-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #003049 0%, #0a1929 100%);
          color: #fdf0d5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          flex-direction: column;
          gap: 1rem;
        }
        .spinner-large {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(253, 240, 213, 0.1);
          border-top-color: #fdf0d5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .loading-text {
          color: rgba(253, 240, 213, 0.7);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (error || !report) return (
    <div className="error-container">
      <AlertTriangle size={48} />
      <p className="error-text">{error || "Something went wrong"}</p>
      <a href="/" className="back-link">Back to Upload</a>
      <style jsx>{`
        .error-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #003049 0%, #0a1929 100%);
          color: #ff6b6b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          flex-direction: column;
          gap: 1rem;
          padding: 2rem;
        }
        .error-text {
          font-size: 1.125rem;
          font-weight: 600;
        }
        .back-link {
          color: #fdf0d5;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          background: rgba(253, 240, 213, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(253, 240, 213, 0.2);
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );

  return (
    <div className="report-container">
      <div className="bg-pattern" />

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Share Report</h3>
            <p className="modal-subtitle">Share this analysis report with others</p>
            
            <div className="share-options">
              <div className="share-link-container">
                <input 
                  type="text" 
                  value={window.location.href} 
                  readOnly 
                  className="share-link-input"
                />
                <button onClick={handleCopyLink} className="copy-button">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <button onClick={handleShareViaEmail} className="share-method-button">
                📧 Share via Email
              </button>

              {navigator.share && (
                <button 
                  onClick={() => {
                    navigator.share({
                      title: `Analysis Report - ${report.app_label}`,
                      text: `Check out this Play Store compliance analysis for ${report.app_label}`,
                      url: window.location.href
                    });
                  }}
                  className="share-method-button"
                >
                  📱 Share via Device
                </button>
              )}
            </div>

            <button onClick={() => setShowShareModal(false)} className="close-modal-button">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-top">
            <a href="/" className="back-button">
              <ArrowLeft size={16} />
              Back to Upload
            </a>
            <div className="timestamp">
              <Clock size={14} />
              {new Date(report.created_at).toLocaleString()}
            </div>
          </div>

          <div className="header-main">
            <div className="app-info">
              <h1 className="app-name">{report.app_label}</h1>
              <p className="package-name">{report.package_name}</p>
            </div>
            <VerdictBadge verdict={report.verdict} />
          </div>

          <div className="action-buttons">
            <button onClick={handleExportJSON} className="action-btn" title="Export as JSON">
              <Download size={16} />
              <span className="btn-text">JSON</span>
            </button>
            <button 
              onClick={handleExportPDF} 
              className="action-btn" 
              disabled={exporting}
              title="Download as HTML Report"
            >
              <Download size={16} />
              <span className="btn-text">{exporting ? "Exporting..." : "HTML"}</span>
            </button>
            <button onClick={handleShare} className="action-btn" title="Share Report">
              <Share2 size={16} />
              <span className="btn-text">Share</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="main-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Risk Score Card */}
            <div className="card risk-card">
              <div className="risk-header">
                <div>
                  <h3 className="card-title">Rejection Risk Score</h3>
                  <p className="card-subtitle">Higher score indicates greater Play Store rejection probability</p>
                </div>
                <div className="risk-circle">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(253, 240, 213, 0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={report.rejection_probability > 0.6 ? "#ff6b6b" : report.rejection_probability > 0.3 ? "#ffd700" : "#90ee90"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${report.rejection_probability * 283} 283`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="risk-value">
                    {Math.round(report.rejection_probability * 100)}%
                  </div>
                </div>
              </div>

              <div className="confidence-badge">
                <Info size={20} />
                <span>Analysis confidence: <strong>{report.confidence}</strong></span>
              </div>
            </div>

            {/* Policy Issues */}
            {report.policy_issues.length > 0 && (
              <div className="card">
                <h3 className="card-title issues-title">
                  <AlertTriangle size={20} />
                  Policy Violations ({report.policy_issues.length})
                </h3>
                <div className="issues-list">
                  {report.policy_issues.map((issue, i) => (
                    <div key={i} className="issue-item" style={{
                      borderLeftColor: issue.severity === "HIGH" ? "#ff6b6b" :
                        issue.severity === "MEDIUM" ? "#ffd700" : "#90ee90"
                    }}>
                      <div className="issue-header">
                        <div className="issue-info">
                          <h4 className="issue-permission">{issue.permission}</h4>
                          <p className="issue-policy">Policy: {issue.policy}</p>
                        </div>
                        <RiskBadge level={issue.severity} />
                      </div>
                      <p className="issue-reason">{issue.rejection_reason}</p>
                      <div className="issue-fix">
                        <p className="fix-label">
                          <CheckCircle size={16} />
                          Recommended Fix
                        </p>
                        <p className="fix-text">{issue.remediation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewer Comment */}
            <div className="card">
              <h3 className="card-title">
                🤖 AI Review Summary
              </h3>
              <div className="comment-box">
                <p className="comment-text">{report.reviewer_comment || "No comment generated."}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Permissions Summary */}
            <div className="card">
              <div 
                className="collapsible-header"
                onClick={() => toggleSection('permissions')}
              >
                <h3 className="card-title">
                  Permissions Analysis ({report.risk_report.length})
                </h3>
                {expandedSections.permissions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              <div className={`permissions-list ${expandedSections.permissions ? 'expanded' : ''}`}>
                {report.risk_report.slice(0, expandedSections.permissions ? undefined : 5).map((item, i) => (
                  <div key={i} className="permission-item">
                    <span className="permission-name">{item.permission}</span>
                    <RiskBadge level={item.risk} />
                  </div>
                ))}
                {!expandedSections.permissions && report.risk_report.length > 5 && (
                  <div className="show-more">
                    +{report.risk_report.length - 5} more
                  </div>
                )}
              </div>
            </div>

            {/* Suspicious Services */}
            {report.suspicious_services.length > 0 && (
              <div className="card suspicious-card">
                <div 
                  className="collapsible-header"
                  onClick={() => toggleSection('suspicious')}
                >
                  <h3 className="card-title alert-title">
                    <AlertTriangle size={20} />
                    Suspicious Services ({report.suspicious_services.length})
                  </h3>
                  {expandedSections.suspicious ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                
                <div className={`services-list ${expandedSections.suspicious ? 'expanded' : ''}`}>
                  {report.suspicious_services.slice(0, expandedSections.suspicious ? undefined : 3).map((svc, i) => (
                    <div key={i} className="service-item">
                      <div>
                        <p className="service-name">{svc.name}</p>
                        <p className="service-status">Status: {svc.enabled}</p>
                      </div>
                      <div className="service-indicator" style={{
                        background: svc.enabled === "true" ? "#ff6b6b" : "#90ee90"
                      }} />
                    </div>
                  ))}
                  {!expandedSections.suspicious && report.suspicious_services.length > 3 && (
                    <div className="show-more">
                      +{report.suspicious_services.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <h3 className="card-title">Quick Actions</h3>
              <div className="quick-actions">
                <button onClick={handleExportJSON} className="quick-btn primary">
                  <Download size={16} />
                  Export as JSON
                </button>
                <button onClick={handleExportPDF} disabled={exporting} className="quick-btn primary">
                  <Download size={16} />
                  {exporting ? "Generating..." : "Download HTML Report"}
                </button>
                <button onClick={handleShare} className="quick-btn secondary">
                  <Share2 size={16} />
                  Share Report
                </button>
                <a href="/" className="quick-btn tertiary">
                  <ArrowLeft size={16} />
                  Analyze Another App
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          Report ID: {report.id} • Generated on {new Date(report.created_at).toLocaleDateString()} • Play Store Reviewer v1.0
        </footer>
      </div>

      <style jsx>{`
        .report-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #003049 0%, #0a1929 100%);
          color: #fdf0d5;
          font-family: 'Inter', sans-serif;
          padding: 1rem;
          position: relative;
        }

        @media (min-width: 768px) {
          .report-container {
            padding: 2rem;
          }
        }

        .bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(40, 54, 24, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 48, 73, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: linear-gradient(135deg, #003049, #0a1929);
          border: 1px solid rgba(253, 240, 213, 0.2);
          border-radius: 20px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .modal-title {
          color: #fdf0d5;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .modal-subtitle {
          color: rgba(253, 240, 213, 0.7);
          font-size: 0.875rem;
          margin: 0 0 1.5rem 0;
        }

        .share-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .share-link-container {
          display: flex;
          gap: 0.5rem;
        }

        .share-link-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: rgba(253, 240, 213, 0.05);
          border: 1px solid rgba(253, 240, 213, 0.1);
          border-radius: 8px;
          color: #fdf0d5;
          font-size: 0.875rem;
          font-family: 'Monaco', monospace;
        }

        .copy-button {
          padding: 0.75rem 1rem;
          background: rgba(40, 54, 24, 0.5);
          border: 1px solid rgba(40, 54, 24, 0.7);
          border-radius: 8px;
          color: #fdf0d5;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .copy-button:hover {
          background: rgba(40, 54, 24, 0.7);
        }

        .share-method-button {
          width: 100%;
          padding: 1rem;
          background: rgba(0, 48, 73, 0.5);
          border: 1px solid rgba(0, 48, 73, 0.7);
          border-radius: 8px;
          color: #fdf0d5;
          cursor: pointer;
          font-weight: 600;
          text-align: left;
        }

        .share-method-button:hover {
          background: rgba(0, 48, 73, 0.7);
        }

        .close-modal-button {
          width: 100%;
          padding: 0.75rem;
          background: rgba(253, 240, 213, 0.1);
          border: 1px solid rgba(253, 240, 213, 0.2);
          border-radius: 8px;
          color: #fdf0d5;
          cursor: pointer;
          font-weight: 600;
        }

        .close-modal-button:hover {
          background: rgba(253, 240, 213, 0.15);
        }

        .header {
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .header {
            margin-bottom: 3rem;
          }
        }

        .header-top {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .back-button {
          color: rgba(253, 240, 213, 0.8);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: rgba(253, 240, 213, 0.05);
          border: 1px solid rgba(253, 240, 213, 0.1);
        }

        .back-button:hover {
          background: rgba(253, 240, 213, 0.1);
        }

        .timestamp {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(253, 240, 213, 0.6);
          font-size: 0.875rem;
        }

        .header-main {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .header-main {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }

        .app-info {
          flex: 1;
          min-width: 0;
        }

        .app-name {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #fdf0d5, #e6d9c2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          word-break: break-word;
        }

        @media (min-width: 768px) {
          .app-name {
            font-size: 2.5rem;
          }
        }

        .package-name {
          color: rgba(253, 240, 213, 0.7);
          margin: 0;
          font-size: 0.875rem;
          font-family: 'Monaco', 'Courier New', monospace;
          background: rgba(0, 48, 73, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          display: inline-block;
          word-break: break-all;
        }

        @media (min-width: 768px) {
          .package-name {
            font-size: 1rem;
          }
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.75rem;
          background: rgba(253, 240, 213, 0.05);
          border: 1px solid rgba(253, 240, 213, 0.1);
          border-radius: 8px;
          color: #fdf0d5;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .action-btn:hover:not(:disabled) {
          background: rgba(253, 240, 213, 0.1);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-text {
          display: none;
        }

        @media (min-width: 640px) {
          .btn-text {
            display: inline;
          }
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr 350px;
          }
        }

        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .card {
          background: linear-gradient(135deg, rgba(0, 48, 73, 0.3), rgba(40, 54, 24, 0.3));
          border: 1px solid rgba(253, 240, 213, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        @media (min-width: 768px) {
          .card {
            padding: 2rem;
          }
        }

        .card-title {
          color: #fdf0d5;
          font-size: 1rem;
          margin: 0 0 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        @media (min-width: 768px) {
          .card-title {
            font-size: 1.125rem;
          }
        }

        .card-subtitle {
          color: rgba(253, 240, 213, 0.7);
          font-size: 0.875rem;
          margin: 0;
        }

        .risk-card {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .risk-header {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .risk-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .risk-circle {
          width: 100px;
          height: 100px;
          position: relative;
          flex-shrink: 0;
          margin: 0 auto;
        }

        @media (min-width: 640px) {
          .risk-circle {
            margin: 0;
          }
        }

        .risk-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5rem;
          font-weight: 700;
          color: #fdf0d5;
        }

        .confidence-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(253, 240, 213, 0.05);
          border-radius: 12px;
          color: rgba(253, 240, 213, 0.7);
          font-size: 0.875rem;
        }

        .issues-title,
        .alert-title {
          color: #ff6b6b;
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .issue-item {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 1.25rem;
          border-left: 4px solid;
        }

        @media (min-width: 768px) {
          .issue-item {
            padding: 1.5rem;
          }
        }

        .issue-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        @media (min-width: 640px) {
          .issue-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }

        .issue-info {
          flex: 1;
          min-width: 0;
        }

        .issue-permission {
          color: #fdf0d5;
          font-size: 0.95rem;
          margin: 0 0 0.25rem 0;
          font-weight: 600;
          word-break: break-word;
        }

        @media (min-width: 768px) {
          .issue-permission {
            font-size: 1rem;
          }
        }

        .issue-policy {
          color: rgba(253, 240, 213, 0.6);
          font-size: 0.875rem;
          margin: 0;
        }

        .issue-reason {
          color: rgba(253, 240, 213, 0.8);
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
          line-height: 1.6;
        }

        .issue-fix {
          background: rgba(40, 54, 24, 0.3);
          border: 1px solid rgba(40, 54, 24, 0.5);
          border-radius: 8px;
          padding: 1rem;
        }

        .fix-label {
          color: #90ee90;
          font-size: 0.875rem;
          margin: 0 0 0.5rem 0;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .fix-text {
          color: rgba(253, 240, 213, 0.8);
          font-size: 0.875rem;
          margin: 0;
        }

        .comment-box {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 1.25rem;
        }

        @media (min-width: 768px) {
          .comment-box {
            padding: 1.5rem;
          }
        }

        .comment-text {
          color: rgba(253, 240, 213, 0.9);
          font-size: 0.875rem;
          line-height: 1.8;
          margin: 0;
          white-space: pre-wrap;
        }

        @media (min-width: 768px) {
          .comment-text {
            font-size: 0.95rem;
          }
        }

        .collapsible-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          margin-bottom: 1.5rem;
          user-select: none;
        }

        .collapsible-header:hover {
          opacity: 0.8;
        }

        .permissions-list,
        .services-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 200px;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .permissions-list.expanded,
        .services-list.expanded {
          max-height: none;
        }

        .permission-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.875rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        @media (min-width: 768px) {
          .permission-item {
            padding: 1rem;
          }
        }

        .permission-item:hover {
          background: rgba(253, 240, 213, 0.05);
          transform: translateY(-2px);
        }

        .permission-name {
          font-size: 0.8rem;
          color: #fdf0d5;
          font-family: 'Monaco', 'Courier New', monospace;
          word-break: break-all;
          flex: 1;
        }

        @media (min-width: 768px) {
          .permission-name {
            font-size: 0.875rem;
          }
        }

        .suspicious-card {
          background: linear-gradient(135deg, rgba(139, 0, 0, 0.2), rgba(178, 34, 34, 0.2));
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
        }

        .service-name {
          color: #ffd700;
          font-size: 0.8rem;
          margin: 0 0 0.25rem 0;
          font-weight: 600;
          font-family: 'Monaco', 'Courier New', monospace;
          word-break: break-all;
        }

        @media (min-width: 768px) {
          .service-name {
            font-size: 0.875rem;
          }
        }

        .service-status {
          color: rgba(253, 240, 213, 0.6);
          font-size: 0.75rem;
          margin: 0;
        }

        .service-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .show-more {
          text-align: center;
          padding: 0.75rem;
          color: rgba(253, 240, 213, 0.6);
          font-size: 0.875rem;
          font-style: italic;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quick-btn {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        @media (min-width: 768px) {
          .quick-btn {
            padding: 1rem;
          }
        }

        .quick-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .quick-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quick-btn.primary {
          background: rgba(40, 54, 24, 0.5);
          border-color: rgba(40, 54, 24, 0.7);
          color: #fdf0d5;
        }

        .quick-btn.primary:hover:not(:disabled) {
          background: rgba(40, 54, 24, 0.7);
        }

        .quick-btn.secondary {
          background: rgba(0, 48, 73, 0.5);
          border-color: rgba(0, 48, 73, 0.7);
          color: #fdf0d5;
        }

        .quick-btn.secondary:hover {
          background: rgba(0, 48, 73, 0.7);
        }

        .quick-btn.tertiary {
          background: rgba(253, 240, 213, 0.1);
          border-color: rgba(253, 240, 213, 0.2);
          color: #fdf0d5;
        }

        .quick-btn.tertiary:hover {
          background: rgba(253, 240, 213, 0.15);
        }

        .footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(253, 240, 213, 0.1);
          color: rgba(253, 240, 213, 0.5);
          font-size: 0.7rem;
          text-align: center;
        }

        @media (min-width: 768px) {
          .footer {
            margin-top: 3rem;
            font-size: 0.75rem;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}