"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".xml")) {
      setFile(dropped);
      setError(null);
    } else {
      setError("Please upload an AndroidManifest.xml file");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("manifest", file);

      const response = await fetch("http://localhost:8000/api/analyze/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const report = await response.json();
      router.push(`/report/${report.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "#e2e8f0", fontFamily: "monospace", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem", background: "linear-gradient(135deg, #00e5ff, #7c4dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Play Store Reviewer
      </h1>
      <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "1.1rem" }}>
        Upload an AndroidManifest.xml to analyze for policy violations
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput")?.click()}
        style={{ border: "2px dashed #334155", borderRadius: "1rem", padding: "3rem 2rem", width: "100%", maxWidth: "500px", textAlign: "center", cursor: "pointer", background: file ? "#1e293b" : "transparent" }}
      >
        <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📁</p>
        <p style={{ color: "#94a3b8", margin: 0 }}>
          {file ? file.name : "Drag & drop or click to upload"}
        </p>
        <input id="fileInput" type="file" accept=".xml" onChange={handleFileInput} style={{ display: "none" }} />
      </div>

      {error && <p style={{ color: "#ff5252", marginTop: "1rem" }}>{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        style={{ marginTop: "1.5rem", padding: "0.75rem 2rem", background: file ? "linear-gradient(135deg, #00e5ff, #7c4dff)" : "#334155", color: "#fff", border: "none", borderRadius: "0.5rem", fontSize: "1rem", fontWeight: 600, cursor: file ? "pointer" : "not-allowed", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Analyzing..." : "Analyze App"}
      </button>

      <a href="/history" style={{ marginTop: "2rem", color: "#7c4dff", textDecoration: "none", fontSize: "0.9rem" }}>
        View past analyses →
      </a>
    </div>
  );
}