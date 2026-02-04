"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter, Calendar, Download, Trash2, Eye, TrendingUp } from "lucide-react";

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
    <span style={{
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      padding: "0.4rem 0.8rem",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: "0.25rem"
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

  useEffect(() => {
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
  }, []);

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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #003049 0%, #0a1929 100%)",
      color: "#fdf0d5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        border: "3px solid rgba(253, 240, 213, 0.1)",
        borderTopColor: "#fdf0d5",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <p style={{ color: "rgba(253, 240, 213, 0.7)" }}>Loading analysis history...</p>
    </div>
  );

  if (error) return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #003049 0%, #0a1929 100%)",
      color: "#ff6b6b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      flexDirection: "column",
      gap: "1rem",
      padding: "2rem"
    }}>
      <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>{error}</p>
      <a 
        href="/"
        style={{
          color: "#fdf0d5",
          textDecoration: "none",
          padding: "0.75rem 1.5rem",
          background: "rgba(253, 240, 213, 0.1)",
          borderRadius: "12px",
          border: "1px solid rgba(253, 240, 213, 0.2)",
          marginTop: "1rem"
        }}
      >
        Back to Upload
      </a>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #003049 0%, #0a1929 100%)",
      color: "#fdf0d5",
      fontFamily: "'Inter', sans-serif",
      padding: "2rem",
      position: "relative"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <a 
                href="/"
                style={{
                  color: "rgba(253, 240, 213, 0.8)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  marginBottom: "1rem"
                }}
              >
                <ArrowLeft size={16} />
                Back to Analyzer
              </a>
              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                margin: "0 0 0.5rem 0",
                background: "linear-gradient(135deg, #fdf0d5, #e6d9c2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em"
              }}>
                Analysis History
              </h1>
              <p style={{
                color: "rgba(253, 240, 213, 0.7)",
                margin: 0,
                fontSize: "1rem"
              }}>
                Review past app compliance analyses
              </p>
            </div>
            <div style={{
              padding: "1rem 1.5rem",
              background: "rgba(40, 54, 24, 0.3)",
              border: "1px solid rgba(40, 54, 24, 0.5)",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.875rem", color: "rgba(253, 240, 213, 0.7)", marginBottom: "0.25rem" }}>
                Total Analyses
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#fdf0d5" }}>
                {reports.length}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem"
          }}>
            <div style={{
              background: "rgba(40, 54, 24, 0.2)",
              border: "1px solid rgba(40, 54, 24, 0.4)",
              borderRadius: "16px",
              padding: "1.5rem",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ fontSize: "0.875rem", color: "rgba(253, 240, 213, 0.7)", marginBottom: "0.5rem" }}>
                Approved Apps
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#90ee90" }}>
                {reports.filter(r => r.verdict === "APPROVED").length}
              </div>
            </div>
            <div style={{
              background: "rgba(184, 134, 11, 0.2)",
              border: "1px solid rgba(184, 134, 11, 0.4)",
              borderRadius: "16px",
              padding: "1.5rem",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ fontSize: "0.875rem", color: "rgba(253, 240, 213, 0.7)", marginBottom: "0.5rem" }}>
                Warnings
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffd700" }}>
                {reports.filter(r => r.verdict === "WARNING").length}
              </div>
            </div>
            <div style={{
              background: "rgba(139, 0, 0, 0.2)",
              border: "1px solid rgba(139, 0, 0, 0.4)",
              borderRadius: "16px",
              padding: "1.5rem",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ fontSize: "0.875rem", color: "rgba(253, 240, 213, 0.7)", marginBottom: "0.5rem" }}>
                Rejected Apps
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ff6b6b" }}>
                {reports.filter(r => r.verdict === "REJECTED").length}
              </div>
            </div>
            <div style={{
              background: "rgba(0, 48, 73, 0.3)",
              border: "1px solid rgba(0, 48, 73, 0.5)",
              borderRadius: "16px",
              padding: "1.5rem",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ fontSize: "0.875rem", color: "rgba(253, 240, 213, 0.7)", marginBottom: "0.5rem" }}>
                Avg Risk Score
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fdf0d5" }}>
                {Math.round(reports.reduce((acc, r) => acc + r.rejection_probability, 0) / reports.length * 100) || 0}%
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap"
          }}>
            <div style={{
              flex: 1,
              minWidth: "300px",
              position: "relative"
            }}>
              <Search size={20} style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(253, 240, 213, 0.5)"
              }} />
              <input
                type="text"
                placeholder="Search by app name or package..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem 0.875rem 3rem",
                  background: "rgba(253, 240, 213, 0.05)",
                  border: "1px solid rgba(253, 240, 213, 0.1)",
                  borderRadius: "12px",
                  color: "#fdf0d5",
                  fontSize: "0.875rem",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["all", "approved", "warning", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: filter === f 
                      ? f === "all" ? "rgba(253, 240, 213, 0.1)" :
                        f === "approved" ? "rgba(40, 54, 24, 0.5)" :
                        f === "warning" ? "rgba(184, 134, 11, 0.5)" :
                        "rgba(139, 0, 0, 0.5)"
                      : "rgba(253, 240, 213, 0.05)",
                    color: filter === f ? "#fdf0d5" : "rgba(253, 240, 213, 0.6)",
                    border: "1px solid rgba(253, 240, 213, 0.1)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    transition: "all 0.3s ease"
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Reports Table */}
        <main>
          {filteredReports.length === 0 ? (
            <div style={{
              background: "rgba(0, 48, 73, 0.2)",
              border: "1px solid rgba(0, 48, 73, 0.4)",
              borderRadius: "20px",
              padding: "4rem 2rem",
              textAlign: "center",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                background: "rgba(253, 240, 213, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem"
              }}>
                <Search size={32} color="rgba(253, 240, 213, 0.5)" />
              </div>
              <h3 style={{
                color: "#fdf0d5",
                fontSize: "1.25rem",
                margin: "0 0 0.5rem 0"
              }}>
                No analyses found
              </h3>
              <p style={{
                color: "rgba(253, 240, 213, 0.7)",
                margin: "0 0 1.5rem 0"
              }}>
                {search ? "Try a different search term" : "Start by analyzing your first app"}
              </p>
              <a 
                href="/"
                style={{
                  color: "#fdf0d5",
                  textDecoration: "none",
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #283618, #003049)",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                Analyze New App
              </a>
            </div>
          ) : (
            <div style={{
              background: "rgba(0, 48, 73, 0.2)",
              border: "1px solid rgba(0, 48, 73, 0.4)",
              borderRadius: "20px",
              overflow: "hidden",
              backdropFilter: "blur(10px)"
            }}>
              {/* Table Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                padding: "1.25rem 1.5rem",
                background: "rgba(40, 54, 24, 0.3)",
                borderBottom: "1px solid rgba(253, 240, 213, 0.1)",
                alignItems: "center"
              }}>
                <span style={{ color: "rgba(253, 240, 213, 0.7)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Application
                </span>
                <span style={{ color: "rgba(253, 240, 213, 0.7)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Verdict
                </span>
                <span style={{ color: "rgba(253, 240, 213, 0.7)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Risk Score
                </span>
                <span style={{ color: "rgba(253, 240, 213, 0.7)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Date
                </span>
                <span style={{ color: "rgba(253, 240, 213, 0.7)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Actions
                </span>
              </div>

              {/* Table Rows */}
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                      padding: "1.25rem 1.5rem",
                      borderBottom: "1px solid rgba(253, 240, 213, 0.05)",
                      alignItems: "center",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(253, 240, 213, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div>
                      <a 
                        href={`/report/${report.id}`}
                        style={{
                          color: "#fdf0d5",
                          textDecoration: "none",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          margin: "0 0 0.25rem 0",
                          display: "block"
                        }}
                      >
                        {report.app_label}
                      </a>
                      <p style={{
                        color: "rgba(253, 240, 213, 0.6)",
                        fontSize: "0.75rem",
                        margin: 0,
                        fontFamily: "'Monaco', 'Courier New', monospace"
                      }}>
                        {report.package_name}
                      </p>
                    </div>
                    <div>
                      <VerdictBadge verdict={report.verdict} />
                    </div>
                    <div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        <div style={{
                          width: "100px",
                          height: "6px",
                          background: "rgba(253, 240, 213, 0.1)",
                          borderRadius: "3px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${report.rejection_probability * 100}%`,
                            height: "100%",
                            background: report.rejection_probability > 0.6 ? "#ff6b6b" : 
                                      report.rejection_probability > 0.3 ? "#ffd700" : "#90ee90",
                            transition: "width 0.5s ease"
                          }} />
                        </div>
                        <span style={{
                          color: report.rejection_probability > 0.6 ? "#ff6b6b" : 
                                report.rejection_probability > 0.3 ? "#ffd700" : "#90ee90",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          minWidth: "35px"
                        }}>
                          {Math.round(report.rejection_probability * 100)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        color: "rgba(253, 240, 213, 0.7)",
                        fontSize: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        <Calendar size={14} />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <a 
                        href={`/report/${report.id}`}
                        style={{
                          padding: "0.5rem",
                          background: "rgba(0, 48, 73, 0.5)",
                          border: "1px solid rgba(0, 48, 73, 0.7)",
                          borderRadius: "6px",
                          color: "#fdf0d5",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease"
                        }}
                        title="View Report"
                      >
                        <Eye size={16} />
                      </a>
                      <button
                        style={{
                          padding: "0.5rem",
                          background: "rgba(139, 0, 0, 0.3)",
                          border: "1px solid rgba(139, 0, 0, 0.5)",
                          borderRadius: "6px",
                          color: "#ff6b6b",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease"
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(253, 240, 213, 0.1)",
          color: "rgba(253, 240, 213, 0.5)",
          fontSize: "0.75rem",
          textAlign: "center"
        }}>
          {filteredReports.length} of {reports.length} analyses shown • Play Store Reviewer v1.0
        </footer>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}