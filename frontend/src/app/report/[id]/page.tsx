"use client";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info, Download, Share2, Clock, ChevronDown, ChevronUp, Copy, Check, Shield, FileText, Settings } from "lucide-react";

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
  const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    HIGH:    { 
      bg: "rgba(239, 68, 68, 0.15)", 
      text: "#fca5a5", 
      border: "rgba(239, 68, 68, 0.3)",
      icon: <AlertTriangle size={12} />
    },
    MEDIUM:  { 
      bg: "rgba(251, 191, 36, 0.15)", 
      text: "#fcd34d", 
      border: "rgba(251, 191, 36, 0.3)",
      icon: <AlertTriangle size={12} />
    },
    LOW:     { 
      bg: "rgba(16, 185, 129, 0.15)", 
      text: "#6ee7b7", 
      border: "rgba(16, 185, 129, 0.3)",
      icon: <CheckCircle size={12} />
    },
    UNKNOWN: { 
      bg: "rgba(71, 85, 105, 0.15)", 
      text: "#cbd5e1", 
      border: "rgba(71, 85, 105, 0.3)",
      icon: <Info size={12} />
    },
  };
  const config = configs[level] || configs.UNKNOWN;
  return (
    <span style={{
      background: config.bg,
      color: config.text,
      border: `1px solid ${config.border}`,
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }}>
      {config.icon}
      {level}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const configs: Record<string, { bg: string; text: string; icon: React.ReactNode; glow: string }> = {
    REJECTED: { 
      bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))", 
      text: "#fca5a5",
      icon: <XCircle size={24} />,
      glow: "0 0 30px rgba(239, 68, 68, 0.3)"
    },
    WARNING:  { 
      bg: "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))", 
      text: "#fcd34d",
      icon: <AlertTriangle size={24} />,
      glow: "0 0 30px rgba(251, 191, 36, 0.3)"
    },
    APPROVED: { 
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))", 
      text: "#6ee7b7",
      icon: <CheckCircle size={24} />,
      glow: "0 0 30px rgba(16, 185, 129, 0.3)"
    },
  };
  const config = configs[verdict] || configs.REJECTED;
  return (
    <div style={{
      background: config.bg,
      color: config.text,
      border: `1px solid ${config.text}40`,
      padding: "16px 28px",
      borderRadius: "16px",
      fontSize: "1.125rem",
      fontWeight: 800,
      letterSpacing: "0.05em",
      display: "inline-flex",
      alignItems: "center",
      gap: "12px",
      backdropFilter: "blur(20px)",
      boxShadow: config.glow,
      textTransform: "uppercase",
    }}>
      {config.icon}
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
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analysis Report - ${report.app_label}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    h1 { 
      color: #0f172a; 
      border-bottom: 4px solid #3b82f6; 
      padding-bottom: 16px;
      margin-bottom: 32px;
      font-size: 2.5rem;
      font-weight: 800;
    }
    h2 { 
      color: #1e293b; 
      margin: 40px 0 20px 0;
      border-left: 5px solid #8b5cf6; 
      padding-left: 16px;
      font-size: 1.75rem;
      font-weight: 700;
    }
    h3 { 
      color: #334155; 
      margin: 24px 0 12px 0;
      font-size: 1.25rem;
    }
    .header { 
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      padding: 32px;
      border-radius: 16px;
      margin-bottom: 40px;
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
    }
    .header h2 {
      color: white;
      border: none;
      padding: 0;
      margin: 0 0 16px 0;
      font-size: 2rem;
    }
    .info-row { 
      display: flex; 
      justify-content: space-between;
      margin: 12px 0;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .verdict { 
      display: inline-block;
      padding: 12px 24px;
      border-radius: 24px;
      font-weight: 800;
      margin: 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 1.125rem;
    }
    .verdict.REJECTED { background: #fee2e2; color: #dc2626; border: 2px solid #dc2626; }
    .verdict.WARNING { background: #fef3c7; color: #d97706; border: 2px solid #d97706; }
    .verdict.APPROVED { background: #d1fae5; color: #059669; border: 2px solid #059669; }
    .risk-score {
      font-size: 72px;
      font-weight: 900;
      text-align: center;
      margin: 32px 0;
      padding: 40px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    .risk-HIGH { color: #dc2626; }
    .risk-MEDIUM { color: #d97706; }
    .risk-LOW { color: #059669; }
    .issue {
      background: white;
      padding: 24px;
      margin: 16px 0;
      border-left: 5px solid #ef4444;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .issue h3 {
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .permission-list {
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin: 16px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .permission-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #f8fafc;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #e2e8f0;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-HIGH { background: #fee2e2; color: #dc2626; border: 1px solid #dc2626; }
    .badge-MEDIUM { background: #fef3c7; color: #d97706; border: 1px solid #d97706; }
    .badge-LOW { background: #d1fae5; color: #059669; border: 1px solid #059669; }
    .footer {
      margin-top: 64px;
      padding-top: 32px;
      border-top: 3px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }
    .comment-box {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 28px;
      border-radius: 12px;
      border: 2px solid #3b82f6;
      margin: 24px 0;
      white-space: pre-wrap;
      line-height: 1.8;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }
    .confidence-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 12px 20px;
      border-radius: 12px;
      margin-top: 16px;
      font-size: 0.95rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: #0f172a;
    }
  </style>
</head>
<body>
  <h1>📱 App Compliance Analysis Report</h1>
  
  <div class="header">
    <h2>${report.app_label}</h2>
    <div class="info-row">
      <strong>Package Name:</strong>
      <span style="font-family: monospace;">${report.package_name}</span>
    </div>
    <div class="info-row">
      <strong>Report ID:</strong>
      <span>#${report.id}</span>
    </div>
    <div class="info-row">
      <strong>Analysis Date:</strong>
      <span>${new Date(report.created_at).toLocaleString()}</span>
    </div>
    <div style="margin-top: 20px;">
      <div class="verdict ${report.verdict}">${report.verdict}</div>
    </div>
    <div class="confidence-badge">
      <strong>Analysis Confidence:</strong> ${report.confidence}
    </div>
  </div>

  <h2>📊 Risk Assessment Overview</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Rejection Risk</div>
      <div class="stat-value risk-${report.rejection_probability > 0.6 ? 'HIGH' : report.rejection_probability > 0.3 ? 'MEDIUM' : 'LOW'}">
        ${Math.round(report.rejection_probability * 100)}%
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Policy Issues</div>
      <div class="stat-value" style="color: #ef4444;">
        ${report.policy_issues.length}
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Permissions</div>
      <div class="stat-value" style="color: #3b82f6;">
        ${report.risk_report.length}
      </div>
    </div>
  </div>

  ${report.policy_issues.length > 0 ? `
  <h2>⚠️ Policy Violations (${report.policy_issues.length})</h2>
  ${report.policy_issues.map(issue => `
    <div class="issue">
      <h3>
        ${issue.permission}
        <span class="badge badge-${issue.severity}">${issue.severity}</span>
      </h3>
      <p style="margin: 12px 0;"><strong>📋 Policy:</strong> ${issue.policy}</p>
      <p style="margin: 12px 0; color: #dc2626;"><strong>❌ Issue:</strong> ${issue.rejection_reason}</p>
      <div style="background: #d1fae5; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #059669;">
        <p style="margin: 0; color: #065f46;"><strong>✅ Recommended Fix:</strong> ${issue.remediation}</p>
      </div>
    </div>
  `).join('')}
  ` : ''}

  <h2>🔐 Permissions Analysis (${report.risk_report.length})</h2>
  <div class="permission-list">
    ${report.risk_report.map(item => `
      <div class="permission-item">
        <span style="font-family: monospace; font-size: 0.9rem;">${item.permission}</span>
        <span class="badge badge-${item.risk}">${item.risk}</span>
      </div>
    `).join('')}
  </div>

  ${report.suspicious_services.length > 0 ? `
  <h2>🚨 Suspicious Services (${report.suspicious_services.length})</h2>
  <div class="permission-list">
    ${report.suspicious_services.map(svc => `
      <div class="permission-item">
        <span style="font-family: monospace; font-size: 0.9rem;">${svc.name}</span>
        <span style="color: ${svc.enabled === 'true' ? '#dc2626' : '#059669'}; font-weight: 700;">
          ${svc.enabled === 'true' ? '● Enabled' : '○ Disabled'}
        </span>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <h2>🤖 AI Review Summary</h2>
  <div class="comment-box">
    ${report.reviewer_comment || 'No comment generated.'}
  </div>

  <div class="footer">
    <p style="font-weight: 700; font-size: 1rem; margin-bottom: 8px;">App Analyzer v1.0</p>
    <p>Professional Compliance Analysis Tool</p>
    <p style="margin-top: 16px;">Report generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `;

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
    const subject = `App Analysis Report - ${report.app_label}`;
    const body = `I wanted to share this compliance analysis report with you:\n\nApp: ${report.app_label}\nPackage: ${report.package_name}\nVerdict: ${report.verdict}\nRisk Score: ${Math.round(report.rejection_probability * 100)}%\n\nView full report: ${window.location.href}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)",
      color: "#f1f5f9",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      position: "relative" as const,
      overflow: "hidden",
      padding: "24px",
    },
    backgroundElement1: {
      position: "absolute" as const,
      top: "-200px",
      right: "-200px",
      width: "500px",
      height: "500px",
      background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)",
      borderRadius: "50%",
      filter: "blur(60px)",
      animation: "float 8s ease-in-out infinite",
    },
    backgroundElement2: {
      position: "absolute" as const,
      bottom: "-200px",
      left: "-200px",
      width: "500px",
      height: "500px",
      background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
      borderRadius: "50%",
      filter: "blur(60px)",
      animation: "float 10s ease-in-out infinite reverse",
    },
    backgroundElement3: {
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "400px",
      height: "400px",
      background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
      borderRadius: "50%",
      filter: "blur(80px)",
      animation: "pulse 6s ease-in-out infinite",
    },
    contentWrapper: {
      position: "relative" as const,
      zIndex: 10,
      maxWidth: "1400px",
      margin: "0 auto",
    },
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      background: styles.container.background,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        border: "3px solid rgba(59, 130, 246, 0.2)",
        borderTop: "3px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#94a3b8", fontSize: "1.125rem", fontWeight: 600 }}>Loading detailed analysis...</p>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (error || !report) return (
    <div style={{
      minHeight: "100vh",
      background: styles.container.background,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "24px",
      padding: "40px",
    }}>
      <AlertTriangle size={64} color="#f87171" />
      <h2 style={{ color: "#f8fafc", fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Error Loading Report</h2>
      <p style={{ color: "#94a3b8", fontSize: "1.125rem", margin: 0 }}>{error || "Report not found"}</p>
      <a href="/" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "14px 28px",
        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
        color: "#ffffff",
        textDecoration: "none",
        borderRadius: "12px",
        fontWeight: 700,
        fontSize: "1rem",
        marginTop: "16px",
      }}>
        <ArrowLeft size={20} />
        Back to Analyzer
      </a>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Background Elements */}
      <div style={styles.backgroundElement1} />
      <div style={styles.backgroundElement2} />
      <div style={styles.backgroundElement3} />

      {/* Share Modal */}
      {showShareModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div 
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
              border: "1px solid rgba(71, 85, 105, 0.5)",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(20px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              color: "#f8fafc", 
              fontSize: "1.75rem", 
              fontWeight: 800, 
              margin: "0 0 8px 0",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Share Report
            </h3>
            <p style={{ 
              color: "#94a3b8", 
              fontSize: "0.9375rem", 
              margin: "0 0 24px 0" 
            }}>
              Share this analysis report with others
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  type="text" 
                  value={window.location.href} 
                  readOnly 
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.5)",
                    borderRadius: "10px",
                    color: "#f1f5f9",
                    fontSize: "0.875rem",
                    fontFamily: "Monaco, monospace",
                  }}
                />
                <button 
                  onClick={handleCopyLink}
                  style={{
                    padding: "12px 20px",
                    background: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)",
                    border: copied ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(59, 130, 246, 0.4)",
                    borderRadius: "10px",
                    color: copied ? "#6ee7b7" : "#93c5fd",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <button 
                onClick={handleShareViaEmail}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(71, 85, 105, 0.5)",
                  borderRadius: "10px",
                  color: "#f1f5f9",
                  cursor: "pointer",
                  fontWeight: 600,
                  textAlign: "left",
                  fontSize: "0.9375rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.7)";
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                  e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                }}
              >
                📧 Share via Email
              </button>

              {navigator.share && (
                <button 
                  onClick={() => {
                    navigator.share({
                      title: `Analysis Report - ${report.app_label}`,
                      text: `Check out this compliance analysis for ${report.app_label}`,
                      url: window.location.href
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    background: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.5)",
                    borderRadius: "10px",
                    color: "#f1f5f9",
                    cursor: "pointer",
                    fontWeight: 600,
                    textAlign: "left",
                    fontSize: "0.9375rem",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.7)";
                    e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                    e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                  }}
                >
                  📱 Share via Device
                </button>
              )}
            </div>

            <button 
              onClick={() => setShowShareModal(false)}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: "rgba(71, 85, 105, 0.2)",
                border: "1px solid rgba(71, 85, 105, 0.4)",
                borderRadius: "10px",
                color: "#cbd5e1",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.2)";
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={styles.contentWrapper}>
        {/* Header */}
        <header style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <a 
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
                color: "#cbd5e1",
                textDecoration: "none",
                fontSize: "0.9375rem",
                fontWeight: 600,
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.8)";
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                e.currentTarget.style.transform = "translateX(-2px)";
                e.currentTarget.style.color = "#93c5fd";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.color = "#cbd5e1";
              }}
            >
              <ArrowLeft size={18} />
              Back to Analyzer
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "0.875rem" }}>
              <Clock size={16} />
              {new Date(report.created_at).toLocaleString()}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
              <div style={{ flex: 1, minWidth: "300px" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 20px",
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
                  borderRadius: "100px",
                  marginBottom: "16px",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#93c5fd",
                  backdropFilter: "blur(10px)",
                }}>
                  <FileText size={16} />
                  Analysis Report
                </div>
                <h1 style={{
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 800,
                  marginBottom: "12px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradient 4s ease infinite",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  wordBreak: "break-word",
                }}>
                  {report.app_label}
                </h1>
                <p style={{
                  color: "#64748b",
                  margin: 0,
                  fontSize: "0.875rem",
                  fontFamily: "Monaco, 'Courier New', monospace",
                  background: "rgba(30, 41, 59, 0.5)",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  display: "inline-block",
                  border: "1px solid rgba(71, 85, 105, 0.5)",
                  wordBreak: "break-all",
                }}>
                  {report.package_name}
                </p>
              </div>

              <VerdictBadge verdict={report.verdict} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button 
              onClick={handleExportJSON}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: "0.9375rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.8)";
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Download size={18} />
              Export JSON
            </button>

            <button 
              onClick={handleExportPDF}
              disabled={exporting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
                color: "#cbd5e1",
                cursor: exporting ? "not-allowed" : "pointer",
                fontSize: "0.9375rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
                opacity: exporting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!exporting) {
                  e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.8)";
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!exporting) {
                  e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                  e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <Download size={18} />
              {exporting ? "Exporting..." : "Download HTML"}
            </button>

            <button 
              onClick={handleShare}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(71, 85, 105, 0.5)",
                borderRadius: "12px",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: "0.9375rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.8)";
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: window.innerWidth >= 1024 ? "1fr 400px" : "1fr",
          gap: "24px",
          marginBottom: "40px",
        }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Risk Score Card */}
            <div style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(71, 85, 105, 0.4)",
              borderRadius: "20px",
              padding: "32px",
              backdropFilter: "blur(30px)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px", marginBottom: "24px" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    color: "#f8fafc", 
                    fontSize: "1.25rem", 
                    fontWeight: 700, 
                    margin: "0 0 8px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                    <Shield size={24} color="#3b82f6" />
                    Rejection Risk Score
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9375rem", margin: 0 }}>
                    Probability of Play Store rejection
                  </p>
                </div>

                <div style={{ position: "relative", width: "120px", height: "120px" }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="rgba(71, 85, 105, 0.3)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={report.rejection_probability > 0.6 ? "#ef4444" : report.rejection_probability > 0.3 ? "#fbbf24" : "#10b981"}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${report.rejection_probability * 327} 327`}
                      transform="rotate(-90 60 60)"
                      style={{ transition: "stroke-dasharray 1s ease" }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: report.rejection_probability > 0.6 ? "#fca5a5" : report.rejection_probability > 0.3 ? "#fcd34d" : "#6ee7b7",
                    textAlign: "center",
                  }}>
                    {Math.round(report.rejection_probability * 100)}%
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 20px",
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "12px",
                color: "#93c5fd",
                fontSize: "0.9375rem",
              }}>
                <Info size={20} />
                <span>
                  Analysis confidence: <strong>{report.confidence}</strong>
                </span>
              </div>
            </div>

            {/* Policy Issues */}
            {report.policy_issues.length > 0 && (
              <div style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "20px",
                padding: "32px",
                backdropFilter: "blur(30px)",
              }}>
                <h3 style={{ 
                  color: "#fca5a5", 
                  fontSize: "1.25rem", 
                  fontWeight: 700, 
                  margin: "0 0 24px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <AlertTriangle size={24} />
                  Policy Violations ({report.policy_issues.length})
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {report.policy_issues.map((issue, i) => (
                    <div 
                      key={i}
                      style={{
                        background: "rgba(30, 41, 59, 0.4)",
                        borderRadius: "16px",
                        padding: "24px",
                        borderLeft: `5px solid ${issue.severity === "HIGH" ? "#ef4444" : issue.severity === "MEDIUM" ? "#fbbf24" : "#10b981"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <h4 style={{ 
                            color: "#f8fafc", 
                            fontSize: "1rem", 
                            fontWeight: 700, 
                            margin: "0 0 6px 0",
                            wordBreak: "break-word",
                          }}>
                            {issue.permission}
                          </h4>
                          <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
                            Policy: {issue.policy}
                          </p>
                        </div>
                        <RiskBadge level={issue.severity} />
                      </div>

                      <p style={{ color: "#cbd5e1", fontSize: "0.9375rem", lineHeight: 1.7, margin: "0 0 16px 0" }}>
                        {issue.rejection_reason}
                      </p>

                      <div style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "12px",
                        padding: "16px",
                      }}>
                        <p style={{ 
                          color: "#6ee7b7", 
                          fontSize: "0.875rem", 
                          fontWeight: 700, 
                          margin: "0 0 8px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}>
                          <CheckCircle size={16} />
                          Recommended Fix
                        </p>
                        <p style={{ color: "#cbd5e1", fontSize: "0.875rem", margin: 0, lineHeight: 1.6 }}>
                          {issue.remediation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Review */}
            <div style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(71, 85, 105, 0.4)",
              borderRadius: "20px",
              padding: "32px",
              backdropFilter: "blur(30px)",
            }}>
              <h3 style={{ 
                color: "#f8fafc", 
                fontSize: "1.25rem", 
                fontWeight: 700, 
                margin: "0 0 20px 0",
              }}>
                🤖 AI Review Summary
              </h3>
              <div style={{
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                padding: "20px",
              }}>
                <p style={{ 
                  color: "#cbd5e1", 
                  fontSize: "0.9375rem", 
                  lineHeight: 1.8, 
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}>
                  {report.reviewer_comment || "No comment generated."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Permissions */}
            <div style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(71, 85, 105, 0.4)",
              borderRadius: "20px",
              padding: "24px",
              backdropFilter: "blur(30px)",
            }}>
              <div 
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  marginBottom: "20px",
                  userSelect: "none",
                }}
                onClick={() => toggleSection('permissions')}
              >
                <h3 style={{ 
                  color: "#f8fafc", 
                  fontSize: "1.125rem", 
                  fontWeight: 700, 
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <Settings size={20} color="#3b82f6" />
                  Permissions ({report.risk_report.length})
                </h3>
                {expandedSections.permissions ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
              </div>

              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "8px",
                maxHeight: expandedSections.permissions ? "none" : "300px",
                overflow: expandedSections.permissions ? "visible" : "hidden",
              }}>
                {(expandedSections.permissions ? report.risk_report : report.risk_report.slice(0, 6)).map((item, i) => (
                  <div 
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      background: "rgba(30, 41, 59, 0.4)",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.5)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.4)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <span style={{ 
                      color: "#cbd5e1", 
                      fontSize: "0.8125rem", 
                      fontFamily: "Monaco, monospace",
                      wordBreak: "break-all",
                      flex: 1,
                    }}>
                      {item.permission}
                    </span>
                    <RiskBadge level={item.risk} />
                  </div>
                ))}
                {!expandedSections.permissions && report.risk_report.length > 6 && (
                  <div style={{
                    textAlign: "center",
                    padding: "12px",
                    color: "#64748b",
                    fontSize: "0.875rem",
                    fontStyle: "italic",
                  }}>
                    +{report.risk_report.length - 6} more permissions
                  </div>
                )}
              </div>
            </div>

            {/* Suspicious Services */}
            {report.suspicious_services.length > 0 && (
              <div style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                borderRadius: "20px",
                padding: "24px",
                backdropFilter: "blur(30px)",
              }}>
                <div 
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    marginBottom: "20px",
                    userSelect: "none",
                  }}
                  onClick={() => toggleSection('suspicious')}
                >
                  <h3 style={{ 
                    color: "#fcd34d", 
                    fontSize: "1.125rem", 
                    fontWeight: 700, 
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                    <AlertTriangle size={20} />
                    Suspicious Services ({report.suspicious_services.length})
                  </h3>
                  {expandedSections.suspicious ? <ChevronUp size={20} color="#fcd34d" /> : <ChevronDown size={20} color="#fcd34d" />}
                </div>

                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "12px",
                  maxHeight: expandedSections.suspicious ? "none" : "250px",
                  overflow: expandedSections.suspicious ? "visible" : "hidden",
                }}>
                  {(expandedSections.suspicious ? report.suspicious_services : report.suspicious_services.slice(0, 4)).map((svc, i) => (
                    <div 
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        background: "rgba(251, 191, 36, 0.05)",
                        border: "1px solid rgba(251, 191, 36, 0.2)",
                        padding: "16px",
                        borderRadius: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          color: "#fcd34d", 
                          fontSize: "0.875rem", 
                          fontWeight: 700, 
                          margin: "0 0 4px 0",
                          fontFamily: "Monaco, monospace",
                          wordBreak: "break-all",
                        }}>
                          {svc.name}
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}>
                          Status: {svc.enabled}
                        </p>
                      </div>
                      <div style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: svc.enabled === "true" ? "#ef4444" : "#10b981",
                        boxShadow: `0 0 10px ${svc.enabled === "true" ? "#ef4444" : "#10b981"}`,
                      }} />
                    </div>
                  ))}
                  {!expandedSections.suspicious && report.suspicious_services.length > 4 && (
                    <div style={{
                      textAlign: "center",
                      padding: "12px",
                      color: "#94a3b8",
                      fontSize: "0.875rem",
                      fontStyle: "italic",
                    }}>
                      +{report.suspicious_services.length - 4} more services
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(71, 85, 105, 0.4)",
              borderRadius: "20px",
              padding: "24px",
              backdropFilter: "blur(30px)",
            }}>
              <h3 style={{ 
                color: "#f8fafc", 
                fontSize: "1.125rem", 
                fontWeight: 700, 
                margin: "0 0 16px 0",
              }}>
                Quick Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a 
                  href="/"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <ArrowLeft size={18} />
                  Analyze Another App
                </a>

                <a 
                  href="/history"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    background: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(71, 85, 105, 0.5)",
                    borderRadius: "12px",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.8)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Clock size={18} />
                  View History
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: "48px",
          paddingTop: "32px",
          borderTop: "1px solid rgba(71, 85, 105, 0.3)",
          color: "#64748b",
          fontSize: "0.875rem",
          textAlign: "center",
        }}>
          <p style={{ margin: 0 }}>
            Report ID: {report.id} • Generated on {new Date(report.created_at).toLocaleDateString()} • App Analyzer v1.0
          </p>
        </footer>
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(0.98);
          }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        * {
          box-sizing: border-box;
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.7);
        }
      `}</style>
    </div>
  );
}