"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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
  const colors: Record<string, { bg: string; text: string }> = {
    HIGH:    { bg: "#7f1d1d", text: "#fca5a5" },
    MEDIUM:  { bg: "#78350f", text: "#fcd34d" },
    LOW:     { bg: "#14532d", text: "#86efac" },
    UNKNOWN: { bg: "#1e1b4b", text: "#a5b4fc" },
  };
  const { bg, text } = colors[level] || colors.UNKNOWN;
  return (
    <span style={{ background: bg, color: text, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
      {level}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    REJECTED: { bg: "#450a0a", text: "#f87171", border: "#991b1b" },
    WARNING:  { bg: "#451a03", text: "#fb923c", border: "#9a3412" },
    APPROVED: { bg: "#052e16", text: "#4ade80", border: "#166534" },
  };
  const { bg, text, border } = colors[verdict] || colors.REJECTED;
  return (
    <span style={{ background: bg, color: text, border: `1px solid ${border}`, padding: "0.4rem 1.2rem", borderRadius: "999px", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em" }}>
      {verdict}
    </span>
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      Loading report...
    </div>
  );

  if (error || !report) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      {error || "Something went wrong"}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", fontFamily: "monospace", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Back link */}
        <a href="/" style={{ color: "#7c4dff", textDecoration: "none", fontSize: "0.85rem" }}>← Back to upload</a>

        {/* Header */}
        <div style={{ marginTop: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>{report.app_label}</h1>
            <p style={{ color: "#64748b", margin: "0.3rem 0 0 0", fontSize: "0.85rem" }}>{report.package_name}</p>
          </div>
          <VerdictBadge verdict={report.verdict} />
        </div>

        {/* Verdict Card */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Rejection Probability</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.2rem" }}>{Math.round(report.rejection_probability * 100)}%</span>
          </div>
          {/* Probability Bar */}
          <div style={{ background: "#1f2937", borderRadius: "999px", height: "10px", width: "100%" }}>
            <div style={{
              width: `${report.rejection_probability * 100}%`,
              height: "100%",
              borderRadius: "999px",
              background: report.rejection_probability > 0.6 ? "#ef4444" : report.rejection_probability > 0.3 ? "#f97316" : "#22c55e",
              transition: "width 0.5s ease"
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
            <span style={{ color: "#64748b", fontSize: "0.7rem" }}>Low Risk</span>
            <span style={{ color: "#64748b", fontSize: "0.7rem" }}>High Risk</span>
          </div>
        </div>

        {/* Permissions */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ color: "#fff", fontSize: "0.9rem", margin: "0 0 1rem 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Permissions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {report.risk_report.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1f2937", padding: "0.6rem 0.8rem", borderRadius: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{item.permission}</span>
                <RiskBadge level={item.risk} />
              </div>
            ))}
          </div>
        </div>

        {/* Policy Issues */}
        {report.policy_issues.length > 0 && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ color: "#fff", fontSize: "0.9rem", margin: "0 0 1rem 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Policy Violations</h2>
            {report.policy_issues.map((issue, i) => (
              <div key={i} style={{ background: "#1f2937", borderRadius: "0.5rem", padding: "1rem", marginBottom: "0.75rem", borderLeft: `3px solid ${issue.severity === "HIGH" ? "#ef4444" : "#f97316"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#fff", fontWeight: 600 }}>{issue.permission}</span>
                  <RiskBadge level={issue.severity} />
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "0.3rem 0" }}>{issue.rejection_reason}</p>
                <p style={{ color: "#7c4dff", fontSize: "0.75rem", margin: "0.3rem 0 0 0" }}>💡 Fix: {issue.remediation}</p>
              </div>
            ))}
          </div>
        )}

        {/* Suspicious Services */}
        {report.suspicious_services.length > 0 && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ color: "#fff", fontSize: "0.9rem", margin: "0 0 1rem 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>⚠️ Suspicious Services</h2>
            {report.suspicious_services.map((svc, i) => (
              <div key={i} style={{ background: "#1f2937", borderRadius: "0.5rem", padding: "0.7rem 0.8rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "#fcd34d" }}>{svc.name}</span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>enabled: {svc.enabled}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reviewer Comment */}
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ color: "#fff", fontSize: "0.9rem", margin: "0 0 1rem 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>🤖 Reviewer Comment</h2>
          <div style={{ background: "#1f2937", borderRadius: "0.5rem", padding: "1rem" }}>
            <p style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
              {report.reviewer_comment || "No comment generated."}
            </p>
          </div>
        </div>

        {/* Back link bottom */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a href="/" style={{ color: "#7c4dff", textDecoration: "none", fontSize: "0.85rem" }}>← Analyze another app</a>
        </div>

      </div>
    </div>
  );
}