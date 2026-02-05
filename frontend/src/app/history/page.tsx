"use client";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Search, Calendar, Eye, Trash2, AlertCircle, TrendingUp, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Report {
  id: number;
  package_name: string;
  app_label: string;
  verdict: string;
  rejection_probability: number;
  created_at: string;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const configs: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode}> = {
    REJECTED: { 
      bg: "rgba(239, 68, 68, 0.15)", 
      text: "#fca5a5", 
      border: "rgba(239, 68, 68, 0.3)",
      icon: <XCircle size={14} />
    },
    WARNING:  { 
      bg: "rgba(251, 191, 36, 0.15)", 
      text: "#fcd34d", 
      border: "rgba(251, 191, 36, 0.3)",
      icon: <AlertTriangle size={14} />
    },
    APPROVED: { 
      bg: "rgba(16, 185, 129, 0.15)", 
      text: "#6ee7b7", 
      border: "rgba(16, 185, 129, 0.3)",
      icon: <CheckCircle size={14} />
    },
  };
  const config = configs[verdict] || configs.REJECTED;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: 700,
      background: config.bg,
      color: config.text,
      border: `1px solid ${config.border}`,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }}>
      {config.icon}
      {verdict}
    </span>
  );
}

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/reports/");
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setReports(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const response = await fetch(`http://localhost:8000/api/reports/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      setReports(reports.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError("Error deleting report: " + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleting(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.app_label.toLowerCase().includes(search.toLowerCase()) ||
      report.package_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === "all" ||
      (filter === "rejected" && report.verdict === "REJECTED") ||
      (filter === "warning" && report.verdict === "WARNING") ||
      (filter === "approved" && report.verdict === "APPROVED");
    
    return matchesSearch && matchesFilter;
  });

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)",
      color: "#f1f5f9",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      position: "relative" as const,
      overflow: "hidden",
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
      padding: "40px 24px",
    },
    header: {
      marginBottom: "48px",
    },
    backButton: {
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
      marginBottom: "24px",
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(10px)",
    },
    headerContent: {
      display: "flex",
      flexDirection: "row" as const,
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "32px",
      flexWrap: "wrap" as const,
      gap: "24px",
    },
    headerLeft: {
      flex: 1,
      minWidth: "300px",
    },
    badge: {
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
    },
    pulseDot: {
      width: "8px",
      height: "8px",
      backgroundColor: "#3b82f6",
      borderRadius: "50%",
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
    },
    pageTitle: {
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
    },
    pageSubtitle: {
      fontSize: "clamp(1rem, 2vw, 1.125rem)",
      color: "#cbd5e1",
      lineHeight: 1.6,
    },
    totalCard: {
      padding: "20px 28px",
      background: "rgba(30, 41, 59, 0.5)",
      border: "1px solid rgba(71, 85, 105, 0.5)",
      borderRadius: "16px",
      textAlign: "center" as const,
      backdropFilter: "blur(20px)",
      minWidth: "140px",
    },
    totalLabel: {
      fontSize: "0.875rem",
      color: "#94a3b8",
      marginBottom: "8px",
      fontWeight: 500,
    },
    totalValue: {
      fontSize: "2rem",
      fontWeight: 800,
      color: "#f8fafc",
      letterSpacing: "-0.02em",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "20px",
      marginBottom: "32px",
    },
    statCard: {
      padding: "24px",
      borderRadius: "16px",
      border: "1px solid rgba(71, 85, 105, 0.4)",
      backdropFilter: "blur(20px)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "default",
    },
    statIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
      transition: "transform 0.3s ease",
    },
    statLabel: {
      fontSize: "0.875rem",
      color: "#94a3b8",
      marginBottom: "8px",
      fontWeight: 500,
      letterSpacing: "0.02em",
    },
    statValue: {
      fontSize: "1.75rem",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    controls: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "16px",
      marginBottom: "32px",
    },
    searchBox: {
      position: "relative" as const,
      flex: 1,
    },
    searchIcon: {
      position: "absolute" as const,
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#64748b",
      pointerEvents: "none" as const,
    },
    searchInput: {
      width: "100%",
      padding: "14px 16px 14px 48px",
      background: "rgba(30, 41, 59, 0.5)",
      border: "1px solid rgba(71, 85, 105, 0.5)",
      borderRadius: "12px",
      color: "#f1f5f9",
      fontSize: "0.9375rem",
      outline: "none",
      backdropFilter: "blur(10px)",
      transition: "all 0.2s ease",
    },
    filterButtons: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: "12px",
    },
    filterButton: {
      padding: "12px 20px",
      background: "rgba(30, 41, 59, 0.5)",
      color: "#94a3b8",
      border: "1px solid rgba(71, 85, 105, 0.5)",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "0.9375rem",
      fontWeight: 600,
      textTransform: "capitalize" as const,
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(10px)",
    },
    reportsContainer: {
      background: "rgba(15, 23, 42, 0.6)",
      border: "1px solid rgba(71, 85, 105, 0.4)",
      borderRadius: "20px",
      overflow: "hidden",
      backdropFilter: "blur(30px)",
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1.2fr 1fr 120px",
      padding: "20px 24px",
      background: "rgba(30, 41, 59, 0.6)",
      borderBottom: "1px solid rgba(71, 85, 105, 0.3)",
      alignItems: "center",
      gap: "20px",
    },
    tableHeaderCell: {
      color: "#94a3b8",
      fontSize: "0.75rem",
      textTransform: "uppercase" as const,
      fontWeight: 700,
      letterSpacing: "0.1em",
    },
    tableBody: {
      maxHeight: "600px",
      overflowY: "auto" as const,
    },
    tableRow: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1.2fr 1fr 120px",
      padding: "20px 24px",
      borderBottom: "1px solid rgba(71, 85, 105, 0.2)",
      alignItems: "center",
      gap: "20px",
      transition: "all 0.2s ease",
    },
    appName: {
      color: "#f8fafc",
      textDecoration: "none",
      fontSize: "1rem",
      fontWeight: 600,
      display: "block",
      marginBottom: "6px",
      transition: "color 0.2s ease",
    },
    packageName: {
      color: "#64748b",
      fontSize: "0.8125rem",
      margin: 0,
      fontFamily: "'SF Mono', Monaco, 'Fira Code', monospace",
    },
    riskBarContainer: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    riskBarBg: {
      flex: 1,
      height: "8px",
      background: "rgba(71, 85, 105, 0.3)",
      borderRadius: "4px",
      overflow: "hidden",
      minWidth: "80px",
    },
    riskBarFill: {
      height: "100%",
      transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      borderRadius: "4px",
    },
    riskPercentage: {
      fontSize: "0.875rem",
      fontWeight: 700,
      minWidth: "42px",
      textAlign: "right" as const,
    },
    dateCell: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#94a3b8",
      fontSize: "0.875rem",
    },
    actionsCell: {
      display: "flex",
      gap: "8px",
      justifyContent: "flex-end",
    },
    actionButton: {
      padding: "8px",
      border: "1px solid",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
      textDecoration: "none",
    },
    deleteConfirm: {
      display: "flex",
      gap: "6px",
    },
    confirmButton: {
      padding: "8px 12px",
      border: "1px solid",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: 700,
      minWidth: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    emptyState: {
      padding: "80px 40px",
      textAlign: "center" as const,
    },
    emptyIcon: {
      width: "80px",
      height: "80px",
      background: "rgba(71, 85, 105, 0.2)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
      color: "#64748b",
    },
    emptyTitle: {
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "#f8fafc",
      marginBottom: "12px",
    },
    emptyText: {
      color: "#94a3b8",
      marginBottom: "32px",
      fontSize: "1rem",
    },
    ctaButton: {
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
      transition: "all 0.3s ease",
      border: "none",
    },
    footer: {
      marginTop: "48px",
      paddingTop: "32px",
      borderTop: "1px solid rgba(71, 85, 105, 0.3)",
      color: "#64748b",
      fontSize: "0.875rem",
      textAlign: "center" as const,
    },
    errorBanner: {
      position: "fixed" as const,
      top: "24px",
      right: "24px",
      left: "24px",
      maxWidth: "500px",
      margin: "0 auto",
      padding: "16px 20px",
      background: "rgba(239, 68, 68, 0.15)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      borderRadius: "12px",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      animation: "slideDown 0.3s ease-out",
      zIndex: 1000,
    },
    mobileCard: {
      background: "rgba(30, 41, 59, 0.4)",
      border: "1px solid rgba(71, 85, 105, 0.4)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "16px",
      backdropFilter: "blur(10px)",
    },
    mobileCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      marginBottom: "16px",
      paddingBottom: "16px",
      borderBottom: "1px solid rgba(71, 85, 105, 0.3)",
    },
    mobileCardBody: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
      marginBottom: "16px",
    },
    mobileCardRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
    },
    mobileCardLabel: {
      color: "#94a3b8",
      fontSize: "0.875rem",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: 500,
    },
    mobileCardActions: {
      display: "flex",
      gap: "12px",
    },
    mobileButton: {
      flex: 1,
      padding: "12px 20px",
      border: "1px solid",
      borderRadius: "10px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontSize: "0.875rem",
      fontWeight: 600,
      textDecoration: "none",
      transition: "all 0.2s ease",
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
      <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>Loading analysis history...</p>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (error && reports.length === 0) return (
    <div style={{
      minHeight: "100vh",
      background: styles.container.background,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      padding: "40px",
    }}>
      <AlertCircle size={64} color="#f87171" />
      <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", fontWeight: 700 }}>Error Loading Reports</h2>
      <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>{error}</p>
      <a href="/" style={{
        ...styles.ctaButton,
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

      {/* Error Banner */}
      {error && reports.length > 0 && (
        <div style={styles.errorBanner}>
          <AlertCircle size={20} color="#f87171" />
          <span style={{ color: "#fca5a5", fontWeight: 600, flex: 1 }}>{error}</span>
        </div>
      )}

      <div style={styles.contentWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <a 
            href="/" 
            style={styles.backButton}
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

          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <div style={styles.badge}>
                <div style={styles.pulseDot} />
                <span>Analysis History</span>
              </div>
              <h1 style={styles.pageTitle}>Your Reports</h1>
              <p style={styles.pageSubtitle}>Review and manage past app compliance analyses</p>
            </div>

            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Total Analyses</div>
              <div style={styles.totalValue}>{reports.length}</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div 
              style={{
                ...styles.statCard,
                backgroundColor: "rgba(16, 185, 129, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
                e.currentTarget.style.transform = "translateY(-4px)";
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (icon) icon.style.transform = "scale(1.1) rotate(5deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.1)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.4)";
                e.currentTarget.style.transform = "translateY(0)";
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (icon) icon.style.transform = "scale(1) rotate(0deg)";
              }}
            >
              <div 
                data-icon
                style={{ ...styles.statIcon, backgroundColor: "rgba(16, 185, 129, 0.2)" }}
              >
                <CheckCircle size={24} color="#10b981" />
              </div>
              <div>
                <p style={styles.statLabel}>Approved Apps</p>
                <p style={{ ...styles.statValue, color: "#6ee7b7" }}>
                  {reports.filter(r => r.verdict === "APPROVED").length}
                </p>
              </div>
            </div>

            <div 
              style={{
                ...styles.statCard,
                backgroundColor: "rgba(251, 191, 36, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(251, 191, 36, 0.15)";
                e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.4)";
                e.currentTarget.style.transform = "translateY(-4px)";
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (icon) icon.style.transform = "scale(1.1) rotate(5deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(251, 191, 36, 0.1)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.4)";
                e.currentTarget.style.transform = "translateY(0)";
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (icon) icon.style.transform = "scale(1) rotate(0deg)";
              }}
            >
              <div 
                data-icon
                style={{ ...styles.statIcon, backgroundColor: "rgba(251, 191, 36, 0.2)" }}
              >
                <AlertTriangle size={24} color="#fbbf24" />
              </div>
              <div>
                <p style={styles.statLabel}>Warnings</p>
                <p style={{ ...styles.statValue, color: "#fcd34d" }}>
                  {reports.filter(r => r.verdict === "WARNING").length}
                </p>
              </div>
            </div>

            <div 
              style={{
                ...styles.statCard,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                e.currentTarget.style.transform = "translateY(-4px)";
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (icon) icon.style.transform = "scale(1.1) rotate(5deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.4)";
                e.currentTarget.style.transform = "translateY(0)";
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (icon) icon.style.transform = "scale(1) rotate(0deg)";
              }}
            >
              <div 
                data-icon
                style={{ ...styles.statIcon, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
              >
                <XCircle size={24} color="#ef4444" />
              </div>
              <div>
                <p style={styles.statLabel}>Rejected Apps</p>
                <p style={{ ...styles.statValue, color: "#fca5a5" }}>
                  {reports.filter(r => r.verdict === "REJECTED").length}
                </p>
              </div>
            </div>

            <div 
              style={{
                ...styles.statCard,
                backgroundColor: "rgba(59, 130, 246, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.15)";
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
                e.currentTarget.style.transform = "translateY(-4px)";
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (icon) icon.style.transform = "scale(1.1) rotate(5deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.4)";
                e.currentTarget.style.transform = "translateY(0)";
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
                if (icon) icon.style.transform = "scale(1) rotate(0deg)";
              }}
            >
              <div 
                data-icon
                style={{ ...styles.statIcon, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
              >
                <TrendingUp size={24} color="#3b82f6" />
              </div>
              <div>
                <p style={styles.statLabel}>Avg Risk Score</p>
                <p style={{ ...styles.statValue, color: "#93c5fd" }}>
                  {reports.length > 0 
                    ? Math.round(reports.reduce((acc, r) => acc + r.rejection_probability, 0) / reports.length * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <div style={styles.searchBox}>
              <Search size={20} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by app name or package..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                  e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.7)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                  e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
                }}
              />
            </div>

            <div style={styles.filterButtons}>
              {["all", "approved", "warning", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...styles.filterButton,
                    ...(filter === f && {
                      backgroundColor: f === "all" ? "rgba(71, 85, 105, 0.5)" :
                                     f === "approved" ? "rgba(16, 185, 129, 0.2)" :
                                     f === "warning" ? "rgba(251, 191, 36, 0.2)" :
                                     "rgba(239, 68, 68, 0.2)",
                      borderColor: f === "all" ? "rgba(71, 85, 105, 0.7)" :
                                  f === "approved" ? "rgba(16, 185, 129, 0.4)" :
                                  f === "warning" ? "rgba(251, 191, 36, 0.4)" :
                                  "rgba(239, 68, 68, 0.4)",
                      color: f === "all" ? "#cbd5e1" :
                            f === "approved" ? "#6ee7b7" :
                            f === "warning" ? "#fcd34d" :
                            "#fca5a5",
                    }),
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== f) {
                      e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.7)";
                      e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.7)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== f) {
                      e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
                      e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports */}
        <main>
          {filteredReports.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Search size={40} />
              </div>
              <h3 style={styles.emptyTitle}>No Analyses Found</h3>
              <p style={styles.emptyText}>
                {search 
                  ? "Try adjusting your search terms or filters" 
                  : "Start by analyzing your first app manifest"}
              </p>
              <a 
                href="/" 
                style={styles.ctaButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px -15px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Analyze New App
              </a>
            </div>
          ) : (
            <div style={styles.reportsContainer}>
              {/* Desktop Table */}
              <div style={{ display: window.innerWidth >= 1024 ? 'block' : 'none' }}>
                <div style={styles.tableHeader}>
                  <span style={styles.tableHeaderCell}>Application</span>
                  <span style={styles.tableHeaderCell}>Verdict</span>
                  <span style={styles.tableHeaderCell}>Risk Score</span>
                  <span style={styles.tableHeaderCell}>Date</span>
                  <span style={styles.tableHeaderCell}>Actions</span>
                </div>

                <div style={styles.tableBody}>
                  {filteredReports.map((report) => (
                    <div 
                      key={report.id} 
                      style={styles.tableRow}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div>
                        <a 
                          href={`/report/${report.id}`} 
                          style={styles.appName}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#93c5fd";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#f8fafc";
                          }}
                        >
                          {report.app_label}
                        </a>
                        <p style={styles.packageName}>{report.package_name}</p>
                      </div>

                      <div>
                        <VerdictBadge verdict={report.verdict} />
                      </div>

                      <div style={styles.riskBarContainer}>
                        <div style={styles.riskBarBg}>
                          <div 
                            style={{
                              ...styles.riskBarFill,
                              width: `${report.rejection_probability * 100}%`,
                              background: report.rejection_probability > 0.6 ? "#ef4444" : 
                                        report.rejection_probability > 0.3 ? "#fbbf24" : "#10b981"
                            }}
                          />
                        </div>
                        <span 
                          style={{
                            ...styles.riskPercentage,
                            color: report.rejection_probability > 0.6 ? "#fca5a5" : 
                                  report.rejection_probability > 0.3 ? "#fcd34d" : "#6ee7b7"
                          }}
                        >
                          {Math.round(report.rejection_probability * 100)}%
                        </span>
                      </div>

                      <div style={styles.dateCell}>
                        <Calendar size={16} />
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>

                      <div style={styles.actionsCell}>
                        <a 
                          href={`/report/${report.id}`} 
                          style={{
                            ...styles.actionButton,
                            background: "rgba(59, 130, 246, 0.15)",
                            borderColor: "rgba(59, 130, 246, 0.3)",
                            color: "#93c5fd",
                          }}
                          title="View Report"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.25)";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.15)";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <Eye size={18} />
                        </a>

                        {deleteConfirm === report.id ? (
                          <div style={styles.deleteConfirm}>
                            <button
                              onClick={() => handleDelete(report.id)}
                              disabled={deleting === report.id}
                              style={{
                                ...styles.confirmButton,
                                background: "rgba(239, 68, 68, 0.2)",
                                borderColor: "rgba(239, 68, 68, 0.4)",
                                color: "#fca5a5",
                              }}
                              onMouseEnter={(e) => {
                                if (deleting !== report.id) {
                                  e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.3)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
                              }}
                            >
                              {deleting === report.id ? "..." : "✓"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                ...styles.confirmButton,
                                background: "rgba(71, 85, 105, 0.2)",
                                borderColor: "rgba(71, 85, 105, 0.4)",
                                color: "#cbd5e1",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(71, 85, 105, 0.2)";
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(report.id)}
                            style={{
                              ...styles.actionButton,
                              background: "rgba(239, 68, 68, 0.15)",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              color: "#fca5a5",
                            }}
                            title="Delete"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.25)";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Cards */}
              <div style={{ display: window.innerWidth < 1024 ? 'block' : 'none', padding: "20px" }}>
                {filteredReports.map((report) => (
                  <div key={report.id} style={styles.mobileCard}>
                    <div style={styles.mobileCardHeader}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a 
                          href={`/report/${report.id}`} 
                          style={{ ...styles.appName, fontSize: "1.0625rem" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#93c5fd";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#f8fafc";
                          }}
                        >
                          {report.app_label}
                        </a>
                        <p style={styles.packageName}>{report.package_name}</p>
                      </div>
                      <VerdictBadge verdict={report.verdict} />
                    </div>

                    <div style={styles.mobileCardBody}>
                      <div style={styles.mobileCardRow}>
                        <span style={styles.mobileCardLabel}>Risk Score</span>
                        <div style={{ ...styles.riskBarContainer, flex: 1 }}>
                          <div style={styles.riskBarBg}>
                            <div 
                              style={{
                                ...styles.riskBarFill,
                                width: `${report.rejection_probability * 100}%`,
                                background: report.rejection_probability > 0.6 ? "#ef4444" : 
                                          report.rejection_probability > 0.3 ? "#fbbf24" : "#10b981"
                              }}
                            />
                          </div>
                          <span 
                            style={{
                              ...styles.riskPercentage,
                              color: report.rejection_probability > 0.6 ? "#fca5a5" : 
                                    report.rejection_probability > 0.3 ? "#fcd34d" : "#6ee7b7"
                            }}
                          >
                            {Math.round(report.rejection_probability * 100)}%
                          </span>
                        </div>
                      </div>

                      <div style={styles.mobileCardRow}>
                        <span style={styles.mobileCardLabel}>
                          <Calendar size={16} />
                          Date
                        </span>
                        <span style={{ color: "#cbd5e1", fontSize: "0.875rem", fontWeight: 600 }}>
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={styles.mobileCardActions}>
                      <a 
                        href={`/report/${report.id}`} 
                        style={{
                          ...styles.mobileButton,
                          background: "rgba(59, 130, 246, 0.15)",
                          borderColor: "rgba(59, 130, 246, 0.3)",
                          color: "#93c5fd",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.15)";
                        }}
                      >
                        <Eye size={18} />
                        View
                      </a>

                      {deleteConfirm === report.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(report.id)}
                            disabled={deleting === report.id}
                            style={{
                              ...styles.mobileButton,
                              background: "rgba(239, 68, 68, 0.2)",
                              borderColor: "rgba(239, 68, 68, 0.4)",
                              color: "#fca5a5",
                              opacity: deleting === report.id ? 0.5 : 1,
                            }}
                          >
                            {deleting === report.id ? "Deleting..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              ...styles.mobileButton,
                              background: "rgba(71, 85, 105, 0.2)",
                              borderColor: "rgba(71, 85, 105, 0.4)",
                              color: "#cbd5e1",
                              flex: 0.5,
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(report.id)}
                          style={{
                            ...styles.mobileButton,
                            background: "rgba(239, 68, 68, 0.15)",
                            borderColor: "rgba(239, 68, 68, 0.3)",
                            color: "#fca5a5",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                          }}
                        >
                          <Trash2 size={18} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={{ margin: 0 }}>
            Showing {filteredReports.length} of {reports.length} analyses • App Analyzer v1.0
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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