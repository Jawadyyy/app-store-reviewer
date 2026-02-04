"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info, Download, Share2, Clock } from "lucide-react";

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
      gap: "0.25rem"
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
      fontSize: "1.125rem",
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
  const [activeTab, setActiveTab] = useState("overview");

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
  })
  }, [id]);

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
      <p style={{ color: "rgba(253, 240, 213, 0.7)" }}>Loading detailed analysis...</p>
    </div>
  );

  if (error || !report) return (
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
      <AlertTriangle size={48} />
      <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>{error || "Something went wrong"}</p>
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
      {/* Background Pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle at 20% 80%, rgba(40, 54, 24, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(0, 48, 73, 0.1) 0%, transparent 50%)`,
        pointerEvents: "none"
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <header style={{
          marginBottom: "3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "2rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <a 
                href="/"
                style={{
                  color: "rgba(253, 240, 213, 0.8)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(253, 240, 213, 0.05)",
                  border: "1px solid rgba(253, 240, 213, 0.1)"
                }}
              >
                <ArrowLeft size={16} />
                Back to Upload
              </a>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "rgba(253, 240, 213, 0.6)",
                fontSize: "0.875rem"
              }}>
                <Clock size={14} />
                {new Date(report.created_at).toLocaleString()}
              </div>
            </div>
            
            <h1 style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              margin: "0 0 0.5rem 0",
              background: "linear-gradient(135deg, #fdf0d5, #e6d9c2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em"
            }}>
              {report.app_label}
            </h1>
            <p style={{
              color: "rgba(253, 240, 213, 0.7)",
              margin: 0,
              fontSize: "1rem",
              fontFamily: "'Monaco', 'Courier New', monospace",
              background: "rgba(0, 48, 73, 0.3)",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              display: "inline-block"
            }}>
              {report.package_name}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
            <VerdictBadge verdict={report.verdict} />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button style={{
                padding: "0.75rem",
                background: "rgba(253, 240, 213, 0.05)",
                border: "1px solid rgba(253, 240, 213, 0.1)",
                borderRadius: "8px",
                color: "#fdf0d5",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <Download size={16} />
                Export
              </button>
              <button style={{
                padding: "0.75rem",
                background: "rgba(253, 240, 213, 0.05)",
                border: "1px solid rgba(253, 240, 213, 0.1)",
                borderRadius: "8px",
                color: "#fdf0d5",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          borderBottom: "1px solid rgba(253, 240, 213, 0.1)",
          paddingBottom: "1rem"
        }}>
          {["overview", "risks", "remediations", "details"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.75rem 1.5rem",
                background: activeTab === tab 
                  ? "rgba(253, 240, 213, 0.1)" 
                  : "transparent",
                color: activeTab === tab ? "#fdf0d5" : "rgba(253, 240, 213, 0.6)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "capitalize",
                transition: "all 0.3s ease"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
          {/* Left Column */}
          <div>
            {/* Risk Score Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(0, 48, 73, 0.3), rgba(40, 54, 24, 0.3))",
              border: "1px solid rgba(253, 240, 213, 0.1)",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "2rem",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem"
              }}>
                <div>
                  <h3 style={{
                    color: "#fdf0d5",
                    fontSize: "1.125rem",
                    margin: "0 0 0.5rem 0"
                  }}>
                    Rejection Risk Score
                  </h3>
                  <p style={{
                    color: "rgba(253, 240, 213, 0.7)",
                    fontSize: "0.875rem",
                    margin: 0
                  }}>
                    Higher score indicates greater Play Store rejection probability
                  </p>
                </div>
                <div style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "50%",
                  width: "100px",
                  height: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}>
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
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center"
                  }}>
                    <div style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#fdf0d5"
                    }}>
                      {Math.round(report.rejection_probability * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence Level */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                background: "rgba(253, 240, 213, 0.05)",
                borderRadius: "12px"
              }}>
                <Info size={20} color="rgba(253, 240, 213, 0.6)" />
                <span style={{ color: "rgba(253, 240, 213, 0.7)", fontSize: "0.875rem" }}>
                  Analysis confidence: <strong>{report.confidence}</strong>
                </span>
              </div>
            </div>

            {/* Policy Issues */}
            {report.policy_issues.length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, rgba(0, 48, 73, 0.3), rgba(40, 54, 24, 0.3))",
                border: "1px solid rgba(253, 240, 213, 0.1)",
                borderRadius: "20px",
                padding: "2rem",
                marginBottom: "2rem",
                backdropFilter: "blur(10px)"
              }}>
                <h3 style={{
                  color: "#fdf0d5",
                  fontSize: "1.125rem",
                  margin: "0 0 1.5rem 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}>
                  <AlertTriangle size={20} />
                  Policy Violations ({report.policy_issues.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {report.policy_issues.map((issue, i) => (
                    <div 
                      key={i}
                      style={{
                        background: "rgba(0, 0, 0, 0.2)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        borderLeft: `4px solid ${
                          issue.severity === "HIGH" ? "#ff6b6b" :
                          issue.severity === "MEDIUM" ? "#ffd700" : "#90ee90"
                        }`
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem"
                      }}>
                        <div>
                          <h4 style={{
                            color: "#fdf0d5",
                            fontSize: "1rem",
                            margin: "0 0 0.25rem 0",
                            fontWeight: 600
                          }}>
                            {issue.permission}
                          </h4>
                          <p style={{
                            color: "rgba(253, 240, 213, 0.6)",
                            fontSize: "0.875rem",
                            margin: 0
                          }}>
                            Policy: {issue.policy}
                          </p>
                        </div>
                        <RiskBadge level={issue.severity} />
                      </div>
                      <p style={{
                        color: "rgba(253, 240, 213, 0.8)",
                        fontSize: "0.875rem",
                        margin: "0 0 1rem 0",
                        lineHeight: 1.6
                      }}>
                        {issue.rejection_reason}
                      </p>
                      <div style={{
                        background: "rgba(40, 54, 24, 0.3)",
                        border: "1px solid rgba(40, 54, 24, 0.5)",
                        borderRadius: "8px",
                        padding: "1rem"
                      }}>
                        <p style={{
                          color: "#90ee90",
                          fontSize: "0.875rem",
                          margin: 0,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem"
                        }}>
                          <CheckCircle size={16} />
                          Recommended Fix
                        </p>
                        <p style={{
                          color: "rgba(253, 240, 213, 0.8)",
                          fontSize: "0.875rem",
                          margin: "0.5rem 0 0 0"
                        }}>
                          {issue.remediation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewer Comment */}
            <div style={{
              background: "linear-gradient(135deg, rgba(0, 48, 73, 0.3), rgba(40, 54, 24, 0.3))",
              border: "1px solid rgba(253, 240, 213, 0.1)",
              borderRadius: "20px",
              padding: "2rem",
              backdropFilter: "blur(10px)"
            }}>
              <h3 style={{
                color: "#fdf0d5",
                fontSize: "1.125rem",
                margin: "0 0 1.5rem 0",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                🤖 AI Review Summary
              </h3>
              <div style={{
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "12px",
                padding: "1.5rem"
              }}>
                <p style={{
                  color: "rgba(253, 240, 213, 0.9)",
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                  margin: 0,
                  whiteSpace: "pre-wrap"
                }}>
                  {report.reviewer_comment || "No comment generated."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Permissions Summary */}
            <div style={{
              background: "linear-gradient(135deg, rgba(0, 48, 73, 0.3), rgba(40, 54, 24, 0.3))",
              border: "1px solid rgba(253, 240, 213, 0.1)",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "2rem",
              backdropFilter: "blur(10px)"
            }}>
              <h3 style={{
                color: "#fdf0d5",
                fontSize: "1.125rem",
                margin: "0 0 1.5rem 0"
              }}>
                Permissions Analysis
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {report.risk_report.map((item, i) => (
                  <div 
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "1rem",
                      borderRadius: "8px",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(253, 240, 213, 0.05)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0, 0, 0, 0.2)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span style={{
                      fontSize: "0.875rem",
                      color: "#fdf0d5",
                      fontFamily: "'Monaco', 'Courier New', monospace"
                    }}>
                      {item.permission}
                    </span>
                    <RiskBadge level={item.risk} />
                  </div>
                ))}
              </div>
            </div>

            {/* Suspicious Services */}
            {report.suspicious_services.length > 0 && (
              <div style={{
                background: "linear-gradient(135deg, rgba(139, 0, 0, 0.2), rgba(178, 34, 34, 0.2))",
                border: "1px solid rgba(255, 107, 107, 0.3)",
                borderRadius: "20px",
                padding: "2rem",
                marginBottom: "2rem",
                backdropFilter: "blur(10px)"
              }}>
                <h3 style={{
                  color: "#ff6b6b",
                  fontSize: "1.125rem",
                  margin: "0 0 1.5rem 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}>
                  <AlertTriangle size={20} />
                  Suspicious Services ({report.suspicious_services.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {report.suspicious_services.map((svc, i) => (
                    <div 
                      key={i}
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "8px",
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <p style={{
                          color: "#ffd700",
                          fontSize: "0.875rem",
                          margin: "0 0 0.25rem 0",
                          fontWeight: 600,
                          fontFamily: "'Monaco', 'Courier New', monospace"
                        }}>
                          {svc.name}
                        </p>
                        <p style={{
                          color: "rgba(253, 240, 213, 0.6)",
                          fontSize: "0.75rem",
                          margin: 0
                        }}>
                          Status: {svc.enabled}
                        </p>
                      </div>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: svc.enabled === "true" ? "#ff6b6b" : "#90ee90"
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{
              background: "linear-gradient(135deg, rgba(0, 48, 73, 0.3), rgba(40, 54, 24, 0.3))",
              border: "1px solid rgba(253, 240, 213, 0.1)",
              borderRadius: "20px",
              padding: "2rem",
              backdropFilter: "blur(10px)"
            }}>
              <h3 style={{
                color: "#fdf0d5",
                fontSize: "1.125rem",
                margin: "0 0 1.5rem 0"
              }}>
                Quick Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <button style={{
                  width: "100%",
                  padding: "1rem",
                  background: "rgba(40, 54, 24, 0.5)",
                  border: "1px solid rgba(40, 54, 24, 0.7)",
                  borderRadius: "8px",
                  color: "#fdf0d5",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease"
                }}>
                  <Download size={16} />
                  Download Full Report
                </button>
                <button style={{
                  width: "100%",
                  padding: "1rem",
                  background: "rgba(0, 48, 73, 0.5)",
                  border: "1px solid rgba(0, 48, 73, 0.7)",
                  borderRadius: "8px",
                  color: "#fdf0d5",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease"
                }}>
                  <Share2 size={16} />
                  Share Analysis
                </button>
                <a 
                  href="/"
                  style={{
                    width: "100%",
                    padding: "1rem",
                    background: "rgba(253, 240, 213, 0.1)",
                    border: "1px solid rgba(253, 240, 213, 0.2)",
                    borderRadius: "8px",
                    color: "#fdf0d5",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.3s ease"
                  }}
                >
                  <ArrowLeft size={16} />
                  Analyze Another App
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(253, 240, 213, 0.1)",
          color: "rgba(253, 240, 213, 0.5)",
          fontSize: "0.75rem",
          textAlign: "center"
        }}>
          Report ID: {report.id} • Generated on {new Date(report.created_at).toLocaleDateString()} • Play Store Reviewer v1.0
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