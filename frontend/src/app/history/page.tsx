"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Search, Calendar, Eye, Trash2, AlertCircle } from "lucide-react";

interface Report {
  id: number;
  package_name: string;
  app_label: string;
  verdict: string;
  rejection_probability: number;
  created_at: string;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    REJECTED: { 
      bg: "rgba(139, 0, 0, 0.2)", 
      text: "#ff6b6b", 
      border: "rgba(255, 107, 107, 0.3)" 
    },
    WARNING:  { 
      bg: "rgba(184, 134, 11, 0.2)", 
      text: "#ffd700", 
      border: "rgba(255, 215, 0, 0.3)" 
    },
    APPROVED: { 
      bg: "rgba(40, 54, 24, 0.3)", 
      text: "#90ee90", 
      border: "rgba(144, 238, 144, 0.3)" 
    },
  };
  const c = colors[verdict] || colors.REJECTED;
  return (
    <span className="verdict-badge" style={{
      background: c.bg,
      color: c.text,
      borderColor: c.border
    }}>
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

  const fetchReports = () => {
    fetch("http://localhost:8000/api/reports/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reports");
        return res.json();
      })
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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

      // Remove from local state
      setReports(reports.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert("Error deleting report: " + err.message);
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

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-large" />
      <p className="loading-text">Loading analysis history...</p>
      <style jsx>{`
        .loading-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #003049 0%, #0a1929 100%);
          color: #fdf0d5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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

  if (error) return (
    <div className="error-container">
      <AlertCircle size={48} color="#ff6b6b" />
      <p className="error-text">{error}</p>
      <a href="/" className="back-link">Back to Upload</a>
      <style jsx>{`
        .error-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #003049 0%, #0a1929 100%);
          color: #ff6b6b;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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
    <div className="history-container">
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="header-left">
              <a href="/" className="back-button">
                <ArrowLeft size={16} />
                Back to Analyzer
              </a>
              <h1 className="page-title">Analysis History</h1>
              <p className="page-subtitle">Review past app compliance analyses</p>
            </div>
            <div className="total-card">
              <div className="total-label">Total Analyses</div>
              <div className="total-value">{reports.length}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card stat-approved">
              <div className="stat-label">Approved Apps</div>
              <div className="stat-value">{reports.filter(r => r.verdict === "APPROVED").length}</div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-label">Warnings</div>
              <div className="stat-value">{reports.filter(r => r.verdict === "WARNING").length}</div>
            </div>
            <div className="stat-card stat-rejected">
              <div className="stat-label">Rejected Apps</div>
              <div className="stat-value">{reports.filter(r => r.verdict === "REJECTED").length}</div>
            </div>
            <div className="stat-card stat-avg">
              <div className="stat-label">Avg Risk Score</div>
              <div className="stat-value">
                {Math.round(reports.reduce((acc, r) => acc + r.rejection_probability, 0) / reports.length * 100) || 0}%
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="controls">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search by app name or package..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              {["all", "approved", "warning", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-button ${filter === f ? 'active' : ''} filter-${f}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Reports */}
        <main>
          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Search size={32} />
              </div>
              <h3 className="empty-title">No analyses found</h3>
              <p className="empty-text">
                {search ? "Try a different search term" : "Start by analyzing your first app"}
              </p>
              <a href="/" className="cta-button">Analyze New App</a>
            </div>
          ) : (
            <div className="reports-container">
              {/* Desktop Table */}
              <div className="reports-table desktop-only">
                <div className="table-header">
                  <span className="th th-app">Application</span>
                  <span className="th th-verdict">Verdict</span>
                  <span className="th th-risk">Risk Score</span>
                  <span className="th th-date">Date</span>
                  <span className="th th-actions">Actions</span>
                </div>

                <div className="table-body">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="table-row">
                      <div className="td td-app">
                        <a href={`/report/${report.id}`} className="app-name">
                          {report.app_label}
                        </a>
                        <p className="package-name">{report.package_name}</p>
                      </div>
                      <div className="td td-verdict">
                        <VerdictBadge verdict={report.verdict} />
                      </div>
                      <div className="td td-risk">
                        <div className="risk-bar-container">
                          <div className="risk-bar-bg">
                            <div 
                              className="risk-bar-fill"
                              style={{
                                width: `${report.rejection_probability * 100}%`,
                                background: report.rejection_probability > 0.6 ? "#ff6b6b" : 
                                          report.rejection_probability > 0.3 ? "#ffd700" : "#90ee90"
                              }}
                            />
                          </div>
                          <span 
                            className="risk-percentage"
                            style={{
                              color: report.rejection_probability > 0.6 ? "#ff6b6b" : 
                                    report.rejection_probability > 0.3 ? "#ffd700" : "#90ee90"
                            }}
                          >
                            {Math.round(report.rejection_probability * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="td td-date">
                        <Calendar size={14} />
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                      <div className="td td-actions">
                        <a href={`/report/${report.id}`} className="action-button view-button" title="View Report">
                          <Eye size={16} />
                        </a>
                        {deleteConfirm === report.id ? (
                          <div className="delete-confirm">
                            <button
                              onClick={() => handleDelete(report.id)}
                              disabled={deleting === report.id}
                              className="confirm-yes"
                            >
                              {deleting === report.id ? "..." : "✓"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="confirm-no"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(report.id)}
                            className="action-button delete-button"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="reports-cards mobile-only">
                {filteredReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="card-header">
                      <div>
                        <a href={`/report/${report.id}`} className="card-app-name">
                          {report.app_label}
                        </a>
                        <p className="card-package-name">{report.package_name}</p>
                      </div>
                      <VerdictBadge verdict={report.verdict} />
                    </div>

                    <div className="card-body">
                      <div className="card-row">
                        <span className="card-label">Risk Score</span>
                        <div className="risk-bar-container">
                          <div className="risk-bar-bg">
                            <div 
                              className="risk-bar-fill"
                              style={{
                                width: `${report.rejection_probability * 100}%`,
                                background: report.rejection_probability > 0.6 ? "#ff6b6b" : 
                                          report.rejection_probability > 0.3 ? "#ffd700" : "#90ee90"
                              }}
                            />
                          </div>
                          <span 
                            className="risk-percentage"
                            style={{
                              color: report.rejection_probability > 0.6 ? "#ff6b6b" : 
                                    report.rejection_probability > 0.3 ? "#ffd700" : "#90ee90"
                            }}
                          >
                            {Math.round(report.rejection_probability * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="card-row">
                        <span className="card-label">
                          <Calendar size={14} />
                          Date
                        </span>
                        <span className="card-value">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <a href={`/report/${report.id}`} className="card-button view">
                        <Eye size={16} />
                        View Report
                      </a>
                      {deleteConfirm === report.id ? (
                        <div className="delete-confirm-mobile">
                          <button
                            onClick={() => handleDelete(report.id)}
                            disabled={deleting === report.id}
                            className="confirm-yes"
                          >
                            {deleting === report.id ? "Deleting..." : "Confirm Delete"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="confirm-no"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(report.id)}
                          className="card-button delete"
                        >
                          <Trash2 size={16} />
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
        <footer className="footer">
          {filteredReports.length} of {reports.length} analyses shown • Play Store Reviewer v1.0
        </footer>
      </div>

      <style jsx>{`
        .history-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #003049 0%, #0a1929 100%);
          color: #fdf0d5;
          font-family: 'Inter', sans-serif;
          padding: 1rem;
        }

        @media (min-width: 768px) {
          .history-container {
            padding: 2rem;
          }
        }

        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .header {
            margin-bottom: 3rem;
          }
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .header-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }

        .header-left {
          flex: 1;
        }

        .back-button {
          color: rgba(253, 240, 213, 0.8);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: rgba(253, 240, 213, 0.05);
          border: 1px solid rgba(253, 240, 213, 0.1);
        }

        .back-button:hover {
          background: rgba(253, 240, 213, 0.1);
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #fdf0d5, #e6d9c2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        @media (min-width: 768px) {
          .page-title {
            font-size: 2.5rem;
          }
        }

        .page-subtitle {
          color: rgba(253, 240, 213, 0.7);
          margin: 0;
          font-size: 0.875rem;
        }

        @media (min-width: 768px) {
          .page-subtitle {
            font-size: 1rem;
          }
        }

        .total-card {
          padding: 1rem 1.5rem;
          background: rgba(40, 54, 24, 0.3);
          border: 1px solid rgba(40, 54, 24, 0.5);
          border-radius: 12px;
          text-align: center;
          align-self: flex-start;
        }

        .total-label {
          font-size: 0.875rem;
          color: rgba(253, 240, 213, 0.7);
          margin-bottom: 0.25rem;
        }

        .total-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fdf0d5;
        }

        @media (min-width: 768px) {
          .total-value {
            font-size: 2rem;
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .stat-card {
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .stat-approved {
          background: rgba(40, 54, 24, 0.2);
          border: 1px solid rgba(40, 54, 24, 0.4);
        }

        .stat-warning {
          background: rgba(184, 134, 11, 0.2);
          border: 1px solid rgba(184, 134, 11, 0.4);
        }

        .stat-rejected {
          background: rgba(139, 0, 0, 0.2);
          border: 1px solid rgba(139, 0, 0, 0.4);
        }

        .stat-avg {
          background: rgba(0, 48, 73, 0.3);
          border: 1px solid rgba(0, 48, 73, 0.5);
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(253, 240, 213, 0.7);
          margin-bottom: 0.5rem;
          display: block;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-approved .stat-value {
          color: #90ee90;
        }

        .stat-warning .stat-value {
          color: #ffd700;
        }

        .stat-rejected .stat-value {
          color: #ff6b6b;
        }

        .stat-avg .stat-value {
          color: #fdf0d5;
        }

        .controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .controls {
            flex-direction: row;
          }
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(253, 240, 213, 0.5);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: rgba(253, 240, 213, 0.05);
          border: 1px solid rgba(253, 240, 213, 0.1);
          border-radius: 12px;
          color: #fdf0d5;
          font-size: 0.875rem;
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(253, 240, 213, 0.4);
        }

        .filter-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        @media (min-width: 640px) {
          .filter-buttons {
            display: flex;
          }
        }

        .filter-button {
          padding: 0.75rem 1rem;
          background: rgba(253, 240, 213, 0.05);
          color: rgba(253, 240, 213, 0.6);
          border: 1px solid rgba(253, 240, 213, 0.1);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: capitalize;
          transition: all 0.3s ease;
        }

        @media (min-width: 640px) {
          .filter-button {
            padding: 0.75rem 1.5rem;
          }
        }

        .filter-button.active {
          color: #fdf0d5;
        }

        .filter-button.active.filter-all {
          background: rgba(253, 240, 213, 0.1);
        }

        .filter-button.active.filter-approved {
          background: rgba(40, 54, 24, 0.5);
        }

        .filter-button.active.filter-warning {
          background: rgba(184, 134, 11, 0.5);
        }

        .filter-button.active.filter-rejected {
          background: rgba(139, 0, 0, 0.5);
        }

        .empty-state {
          background: rgba(0, 48, 73, 0.2);
          border: 1px solid rgba(0, 48, 73, 0.4);
          border-radius: 20px;
          padding: 3rem 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
        }

        @media (min-width: 768px) {
          .empty-state {
            padding: 4rem 2rem;
          }
        }

        .empty-icon {
          width: 60px;
          height: 60px;
          background: rgba(253, 240, 213, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: rgba(253, 240, 213, 0.5);
        }

        @media (min-width: 768px) {
          .empty-icon {
            width: 80px;
            height: 80px;
          }
        }

        .empty-title {
          color: #fdf0d5;
          font-size: 1.125rem;
          margin: 0 0 0.5rem 0;
        }

        @media (min-width: 768px) {
          .empty-title {
            font-size: 1.25rem;
          }
        }

        .empty-text {
          color: rgba(253, 240, 213, 0.7);
          margin: 0 0 1.5rem 0;
          font-size: 0.875rem;
        }

        @media (min-width: 768px) {
          .empty-text {
            font-size: 1rem;
          }
        }

        .cta-button {
          color: #fdf0d5;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #283618, #003049);
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .reports-container {
          background: rgba(0, 48, 73, 0.2);
          border: 1px solid rgba(0, 48, 73, 0.4);
          border-radius: 20px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .desktop-only {
          display: none;
        }

        @media (min-width: 1024px) {
          .desktop-only {
            display: block;
          }
        }

        .mobile-only {
          display: block;
        }

        @media (min-width: 1024px) {
          .mobile-only {
            display: none;
          }
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 100px;
          padding: 1.25rem 1.5rem;
          background: rgba(40, 54, 24, 0.3);
          border-bottom: 1px solid rgba(253, 240, 213, 0.1);
          align-items: center;
          gap: 1rem;
        }

        .th {
          color: rgba(253, 240, 213, 0.7);
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .table-body {
          max-height: 500px;
          overflow-y: auto;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 100px;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(253, 240, 213, 0.05);
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .table-row:hover {
          background: rgba(253, 240, 213, 0.05);
        }

        .td {
          font-size: 0.875rem;
        }

        .app-name {
          color: #fdf0d5;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          display: block;
          margin-bottom: 0.25rem;
        }

        .app-name:hover {
          text-decoration: underline;
        }

        .package-name {
          color: rgba(253, 240, 213, 0.6);
          font-size: 0.75rem;
          margin: 0;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .verdict-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          border: 1px solid;
          white-space: nowrap;
        }

        .risk-bar-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .risk-bar-bg {
          flex: 1;
          height: 6px;
          background: rgba(253, 240, 213, 0.1);
          border-radius: 3px;
          overflow: hidden;
          min-width: 60px;
        }

        .risk-bar-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .risk-percentage {
          font-size: 0.875rem;
          font-weight: 600;
          min-width: 35px;
        }

        .td-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(253, 240, 213, 0.7);
        }

        .td-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          padding: 0.5rem;
          border: 1px solid;
          border-radius: 6px;
          color: #fdf0d5;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .view-button {
          background: rgba(0, 48, 73, 0.5);
          border-color: rgba(0, 48, 73, 0.7);
        }

        .view-button:hover {
          background: rgba(0, 48, 73, 0.7);
        }

        .delete-button {
          background: rgba(139, 0, 0, 0.3);
          border-color: rgba(139, 0, 0, 0.5);
          color: #ff6b6b;
        }

        .delete-button:hover {
          background: rgba(139, 0, 0, 0.5);
        }

        .delete-confirm {
          display: flex;
          gap: 0.25rem;
        }

        .confirm-yes,
        .confirm-no {
          padding: 0.5rem;
          border: 1px solid;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .confirm-yes {
          background: rgba(139, 0, 0, 0.5);
          border-color: rgba(139, 0, 0, 0.7);
          color: #ff6b6b;
          min-width: 32px;
        }

        .confirm-yes:hover {
          background: rgba(139, 0, 0, 0.7);
        }

        .confirm-yes:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .confirm-no {
          background: rgba(253, 240, 213, 0.1);
          border-color: rgba(253, 240, 213, 0.2);
          color: #fdf0d5;
          min-width: 32px;
        }

        .confirm-no:hover {
          background: rgba(253, 240, 213, 0.15);
        }

        .reports-cards {
          padding: 1rem;
        }

        .report-card {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(253, 240, 213, 0.1);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(253, 240, 213, 0.1);
        }

        .card-app-name {
          color: #fdf0d5;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 600;
          display: block;
          margin-bottom: 0.25rem;
          word-break: break-word;
        }

        .card-package-name {
          color: rgba(253, 240, 213, 0.6);
          font-size: 0.75rem;
          margin: 0;
          font-family: 'Monaco', 'Courier New', monospace;
          word-break: break-all;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .card-label {
          color: rgba(253, 240, 213, 0.7);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-value {
          color: #fdf0d5;
          font-size: 0.875rem;
        }

        .card-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .card-button {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
        }

        .card-button.view {
          background: rgba(0, 48, 73, 0.5);
          border-color: rgba(0, 48, 73, 0.7);
          color: #fdf0d5;
        }

        .card-button.delete {
          background: rgba(139, 0, 0, 0.3);
          border-color: rgba(139, 0, 0, 0.5);
          color: #ff6b6b;
        }

        .delete-confirm-mobile {
          display: flex;
          gap: 0.5rem;
        }

        .delete-confirm-mobile .confirm-yes,
        .delete-confirm-mobile .confirm-no {
          flex: 1;
          padding: 0.75rem 1rem;
        }

        .footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(253, 240, 213, 0.1);
          color: rgba(253, 240, 213, 0.5);
          font-size: 0.75rem;
          text-align: center;
        }

        @media (min-width: 768px) {
          .footer {
            margin-top: 3rem;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}