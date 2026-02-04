"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, Shield, AlertTriangle, FileText } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".xml")) {
      setFile(dropped);
      setError(null);
    } else {
      setError("Please upload only AndroidManifest.xml files");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #003049 0%, #0a1929 100%)",
      color: "#fdf0d5",
      padding: "2rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background elements */}
      <div style={{
        position: "absolute",
        top: "-50%",
        right: "-30%",
        width: "80%",
        height: "80%",
        background: "radial-gradient(circle, rgba(40, 54, 24, 0.1) 0%, transparent 70%)",
        filter: "blur(40px)"
      }} />
      
      <div style={{
        position: "absolute",
        bottom: "-30%",
        left: "-20%",
        width: "60%",
        height: "60%",
        background: "radial-gradient(circle, rgba(0, 48, 73, 0.2) 0%, transparent 70%)",
        filter: "blur(40px)"
      }} />

      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "3rem",
          padding: "1rem 0"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #283618, #3d5a1c)",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(40, 54, 24, 0.4)"
          }}>
            <Shield size={24} color="#fdf0d5" />
          </div>
          <div>
            <h1 style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(135deg, #fdf0d5, #e6d9c2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em"
            }}>
              Play Store Reviewer
            </h1>
            <p style={{
              color: "rgba(253, 240, 213, 0.7)",
              margin: "0.5rem 0 0 0",
              fontSize: "1rem"
            }}>
              Professional Android App Compliance Analyzer
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "3rem"
        }}>
          <div style={{
            background: "rgba(40, 54, 24, 0.3)",
            border: "1px solid rgba(40, 54, 24, 0.5)",
            borderRadius: "16px",
            padding: "1.5rem",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{
                background: "rgba(253, 240, 213, 0.1)",
                borderRadius: "8px",
                padding: "0.5rem"
              }}>
                <AlertTriangle size={20} color="#fdf0d5" />
              </div>
              <span style={{ fontSize: "0.875rem", color: "rgba(253, 240, 213, 0.7)" }}>Policy Checks</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#fdf0d5" }}>150+</div>
          </div>

          <div style={{
            background: "rgba(0, 48, 73, 0.3)",
            border: "1px solid rgba(0, 48, 73, 0.5)",
            borderRadius: "16px",
            padding: "1.5rem",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{
                background: "rgba(253, 240, 213, 0.1)",
                borderRadius: "8px",
                padding: "0.5rem"
              }}>
                <FileText size={20} color="#fdf0d5" />
              </div>
              <span style={{ fontSize: "0.875rem", color: "rgba(253, 240, 213, 0.7)" }}>Manifests Analyzed</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#fdf0d5" }}>2.5K+</div>
          </div>
        </div>

        {/* Upload Zone */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            border: `2px ${isDragging ? "dashed" : "solid"} ${isDragging ? "#283618" : "rgba(253, 240, 213, 0.2)"}`,
            borderRadius: "20px",
            padding: "4rem 2rem",
            width: "100%",
            textAlign: "center",
            cursor: "pointer",
            background: file 
              ? "linear-gradient(135deg, rgba(40, 54, 24, 0.4), rgba(0, 48, 73, 0.4))" 
              : "linear-gradient(135deg, rgba(0, 48, 73, 0.1), rgba(40, 54, 24, 0.1))",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden"
          }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            {file ? (
              <>
                <div style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "rgba(40, 54, 24, 0.8)",
                  color: "#fdf0d5",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <FileText size={16} />
                  Ready for Analysis
                </div>
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "rgba(40, 54, 24, 0.6)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem"
                }}>
                  <FileText size={40} color="#fdf0d5" />
                </div>
                <h3 style={{ color: "#fdf0d5", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  {file.name}
                </h3>
                <p style={{ color: "rgba(253, 240, 213, 0.7)", fontSize: "0.875rem", margin: 0 }}>
                  Click to change file or drop another
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #283618, #003049)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: "0 8px 32px rgba(0, 48, 73, 0.4)"
                }}>
                  <Upload size={40} color="#fdf0d5" />
                </div>
                <h3 style={{ color: "#fdf0d5", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  Drop AndroidManifest.xml Here
                </h3>
                <p style={{ color: "rgba(253, 240, 213, 0.7)", fontSize: "1rem", marginBottom: "1.5rem" }}>
                  Or click to browse files
                </p>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(253, 240, 213, 0.1)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(253, 240, 213, 0.2)"
                }}>
                  <Upload size={16} />
                  <span>Browse Files</span>
                </div>
              </>
            )}
            <input 
              id="fileInput" 
              type="file" 
              accept=".xml" 
              onChange={handleFileInput} 
              style={{ display: "none" }} 
            />
          </div>

          {error && (
            <div style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "rgba(139, 0, 0, 0.2)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              borderRadius: "12px",
              color: "#ff6b6b",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <AlertTriangle size={20} />
              {error}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          style={{
            width: "100%",
            padding: "1.25rem",
            background: !file || loading 
              ? "rgba(253, 240, 213, 0.1)" 
              : "linear-gradient(135deg, #283618 0%, #003049 100%)",
            color: "#fdf0d5",
            border: "none",
            borderRadius: "16px",
            fontSize: "1.125rem",
            fontWeight: 600,
            cursor: file && !loading ? "pointer" : "not-allowed",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.3s ease",
            boxShadow: file 
              ? "0 8px 32px rgba(40, 54, 24, 0.4)" 
              : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            marginBottom: "2rem"
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: "20px",
                height: "20px",
                border: "2px solid rgba(253, 240, 213, 0.3)",
                borderTopColor: "#fdf0d5",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Analyzing Manifest...
            </>
          ) : (
            <>
              <Shield size={20} />
              {file ? "Analyze App Compliance" : "Upload Manifest to Begin"}
            </>
          )}
        </button>

        {/* Navigation Links */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(253, 240, 213, 0.1)"
        }}>
          <a 
            href="/history" 
            style={{
              color: "rgba(253, 240, 213, 0.8)",
              textDecoration: "none",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "color 0.3s ease",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "rgba(253, 240, 213, 0.05)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fdf0d5"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(253, 240, 213, 0.8)"}
          >
            <FileText size={16} />
            View Analysis History
          </a>
          <a 
            href="/docs" 
            style={{
              color: "rgba(253, 240, 213, 0.8)",
              textDecoration: "none",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "color 0.3s ease",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "rgba(253, 240, 213, 0.05)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fdf0d5"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(253, 240, 213, 0.8)"}
          >
            <Shield size={16} />
            Compliance Guidelines
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}