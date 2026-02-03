"use client";
import { useState, useEffect } from "react";

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
    REJECTED: { bg: "#450a0a", text: "#f87171", border: "#991b1b" },
    WARNING:  { bg: "#451a03", text: "#fb923c", border: "#9a3412" },
    APPROVED: { bg: "#052e16", text: "#4ade80", border: "#166534" },
  };
  const c = colors[verdict] || colors.REJECTED;
  return (
    <span style={{ background: c.bg, color: c.text, border: "1px solid " + c.border, padding: "0.2rem 0.7rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
      {verdict}
    </span>
  );
}

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      Loading history...
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#f87171", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      {error}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", fontFamily: "monospace", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <a href="/" style={{ color: "#7c4dff", textDecoration: "none", fontSize: "0.85rem" }}>Back to upload</a>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginTop: "1.5rem", marginBottom: "0.3rem" }}>Past Analyses</h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 1.5rem 0" }}>{reports.length} reports found</p>

        {reports.length === 0 && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "0.75rem", padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>No reports yet.</p>
            <a href="/" style={{ color: "#7c4dff", textDecoration: "none", fontSize: "0.85rem" }}>Analyze your first app</a>
          </div>
        )}

        {reports.length > 0 && (
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "0.75rem", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 120px", padding: "0.75rem 1rem", background: "#1a2332", borderBottom: "1px solid #1f2937" }}>
              <span style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase" }}>App</span>
              <span style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase" }}>Verdict</span>
              <span style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase" }}>Risk</span>
              <span style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase" }}>Date</span>
            </div>

            {reports.map((report) => (
              <a key={report.id} href={"/report/" + report.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 120px", padding: "0.9rem 1rem", borderBottom: "1px solid #1f2937", textDecoration: "none", color: "inherit" }}>
                <div>
                  <p style={{ color: "#fff", fontSize: "0.85rem", margin: 0, fontWeight: 600 }}>{report.app_label}</p>
                  <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0.2rem 0 0 0" }}>{report.package_name}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <VerdictBadge verdict={report.verdict} />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: report.rejection_probability > 0.6 ? "#f87171" : report.rejection_probability > 0.3 ? "#fb923c" : "#4ade80", fontSize: "0.85rem", fontWeight: 600 }}>
                    {Math.round(report.rejection_probability * 100)}%
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: "#64748b", fontSize: "0.78rem" }}>
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}