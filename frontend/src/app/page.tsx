"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".xml")) {
      setFile(dropped);
      setError(null);
    } else {
      setError("Please upload a valid AndroidManifest.xml file");
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

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      padding: "60px 24px",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "56px",
      maxWidth: "800px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 20px",
      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
      borderRadius: "100px",
      marginBottom: "24px",
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
    mainTitle: {
      fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
      fontWeight: 800,
      marginBottom: "20px",
      background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
      backgroundSize: "200% auto",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "gradient 4s ease infinite",
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
    },
    subtitle: {
      fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
      color: "#cbd5e1",
      lineHeight: 1.7,
      maxWidth: "700px",
      margin: "0 auto",
    },
    fileName: {
      fontFamily: "'SF Mono', Monaco, 'Fira Code', monospace",
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "0.95em",
      color: "#93c5fd",
      fontWeight: 600,
      border: "1px solid rgba(59, 130, 246, 0.3)",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "20px",
      marginBottom: "48px",
      width: "100%",
      maxWidth: "900px",
    },
    statCard: {
      padding: "24px",
      backgroundColor: "rgba(30, 41, 59, 0.4)",
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
    statTitle: {
      fontSize: "0.875rem",
      color: "#94a3b8",
      marginBottom: "6px",
      fontWeight: 500,
      letterSpacing: "0.02em",
    },
    statValue: {
      fontSize: "1.125rem",
      fontWeight: 700,
      color: "#f1f5f9",
      letterSpacing: "-0.01em",
    },
    uploadSection: {
      width: "100%",
      maxWidth: "900px",
    },
    uploadCardWrapper: {
      position: "relative" as const,
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isDragging ? "scale(1.02)" : "scale(1)",
    },
    uploadCardGlow: {
      position: "absolute" as const,
      inset: "-2px",
      background: isDragging 
        ? "linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)"
        : "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
      borderRadius: "24px",
      filter: "blur(20px)",
      opacity: isDragging || file ? 1 : 0.3,
      transition: "all 0.4s ease",
      zIndex: 0,
    },
    uploadCard: {
      position: "relative" as const,
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(30px)",
      border: isDragging
        ? "2px solid rgba(59, 130, 246, 0.6)"
        : file
          ? "2px solid rgba(139, 92, 246, 0.5)"
          : "2px dashed rgba(100, 116, 139, 0.4)",
      borderRadius: "24px",
      padding: "56px 40px",
      textAlign: "center" as const,
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: 1,
    },
    uploadIconContainer: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "96px",
      height: "96px",
      background: file 
        ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)"
        : "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
      borderRadius: "24px",
      marginBottom: "28px",
      border: file ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(71, 85, 105, 0.5)",
      transition: "all 0.3s ease",
    },
    uploadTitle: {
      fontSize: "1.75rem",
      fontWeight: 700,
      marginBottom: "12px",
      color: "#f8fafc",
      letterSpacing: "-0.01em",
    },
    uploadDescription: {
      color: "#cbd5e1",
      marginBottom: "32px",
      fontSize: "1.0625rem",
      lineHeight: 1.6,
    },
    fileInfo: {
      display: "inline-flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 20px",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderRadius: "12px",
      marginBottom: "28px",
      border: "1px solid rgba(16, 185, 129, 0.3)",
    },
    removeButton: {
      color: "#94a3b8",
      background: "rgba(51, 65, 85, 0.5)",
      border: "none",
      cursor: "pointer",
      padding: "6px",
      borderRadius: "8px",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    browseButton: {
      padding: "14px 28px",
      backgroundColor: "rgba(30, 41, 59, 0.8)",
      border: "1px solid rgba(71, 85, 105, 0.5)",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 600,
      color: "#f1f5f9",
      cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(10px)",
    },
    formatInfo: {
      marginTop: "32px",
      paddingTop: "24px",
      borderTop: "1px solid rgba(71, 85, 105, 0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      fontSize: "0.9375rem",
      color: "#64748b",
      fontWeight: 500,
    },
    errorContainer: {
      marginTop: "28px",
      padding: "18px 20px",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      borderRadius: "14px",
      backdropFilter: "blur(10px)",
      animation: "slideIn 0.3s ease-out",
    },
    errorContent: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    errorIcon: {
      width: "36px",
      height: "36px",
      backgroundColor: "rgba(239, 68, 68, 0.2)",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    analyzeButton: {
      position: "relative" as const,
      padding: "18px 48px",
      borderRadius: "14px",
      fontSize: "1.125rem",
      fontWeight: 700,
      cursor: file && !loading ? "pointer" : "not-allowed",
      border: "none",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      margin: "40px auto 0",
      display: "block",
      minWidth: "320px",
      overflow: "hidden",
    },
    analyzeButtonGradient: {
      position: "absolute" as const,
      inset: 0,
      background: file 
        ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" 
        : "rgba(71, 85, 105, 0.4)",
      borderRadius: "14px",
      transition: "all 0.3s ease",
    },
    analyzeButtonContent: {
      position: "relative" as const,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      color: "#ffffff",
      zIndex: 1,
    },
    spinner: {
      width: "20px",
      height: "20px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderTop: "2px solid #ffffff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    actionButtons: {
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      flexWrap: "wrap" as const,
      marginTop: "48px",
    },
    actionButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "12px 24px",
      background: "rgba(30, 41, 59, 0.6)",
      border: "1px solid rgba(71, 85, 105, 0.5)",
      borderRadius: "12px",
      color: "#cbd5e1",
      cursor: "pointer",
      fontSize: "0.9375rem",
      fontWeight: 600,
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      textDecoration: "none",
      backdropFilter: "blur(10px)",
    },
  };

  return (
    <div style={styles.container}>
      {/* Enhanced Background Elements */}
      <div style={styles.backgroundElement1} />
      <div style={styles.backgroundElement2} />
      <div style={styles.backgroundElement3} />

      <div style={styles.contentWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>
            <div style={styles.pulseDot} />
            <span>AI-Powered Policy Analysis</span>
          </div>
          
          <h1 style={styles.mainTitle}>App Analyzer</h1>
          
          <p style={styles.subtitle}>
            Upload your <code style={styles.fileName}>AndroidManifest.xml</code> for instant 
            policy compliance analysis and vulnerability detection
          </p>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)";
              e.currentTarget.style.transform = "translateY(-4px)";
              const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
              if (icon) icon.style.transform = "scale(1.1) rotate(5deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.4)";
              e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.4)";
              e.currentTarget.style.transform = "translateY(0)";
              const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
              if (icon) icon.style.transform = "scale(1) rotate(0deg)";
            }}
          >
            <div 
              data-icon
              style={{ ...styles.statIcon, backgroundColor: "rgba(59, 130, 246, 0.15)" }}
            >
              <svg style={{ width: "24px", height: "24px", color: "#3b82f6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p style={styles.statTitle}>File Format</p>
              <p style={styles.statValue}>XML Manifest</p>
            </div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
              e.currentTarget.style.transform = "translateY(-4px)";
              const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
              if (icon) icon.style.transform = "scale(1.1) rotate(5deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.4)";
              e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.4)";
              e.currentTarget.style.transform = "translateY(0)";
              const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
              if (icon) icon.style.transform = "scale(1) rotate(0deg)";
            }}
          >
            <div 
              data-icon
              style={{ ...styles.statIcon, backgroundColor: "rgba(139, 92, 246, 0.15)" }}
            >
              <svg style={{ width: "24px", height: "24px", color: "#8b5cf6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p style={styles.statTitle}>Security Check</p>
              <p style={styles.statValue}>Real-time Scan</p>
            </div>
          </div>

          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
              e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
              e.currentTarget.style.transform = "translateY(-4px)";
              const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
              if (icon) icon.style.transform = "scale(1.1) rotate(5deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.4)";
              e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.4)";
              e.currentTarget.style.transform = "translateY(0)";
              const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement;
              if (icon) icon.style.transform = "scale(1) rotate(0deg)";
            }}
          >
            <div 
              data-icon
              style={{ ...styles.statIcon, backgroundColor: "rgba(16, 185, 129, 0.15)" }}
            >
              <svg style={{ width: "24px", height: "24px", color: "#10b981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p style={styles.statTitle}>Privacy Focused</p>
              <p style={styles.statValue}>Local Processing</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div style={styles.uploadSection}>
          <div style={styles.uploadCardWrapper}>
            <div style={styles.uploadCardGlow} />

            <div
              style={styles.uploadCard}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={styles.uploadIconContainer}>
                {file ? (
                  <svg style={{ width: "48px", height: "48px", color: "#10b981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg style={{ width: "48px", height: "48px", color: "#3b82f6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>

              <h3 style={styles.uploadTitle}>
                {file ? "File Ready for Analysis" : "Drop Your Manifest File"}
              </h3>

              <p style={styles.uploadDescription}>
                {file
                  ? "Your file has been uploaded successfully"
                  : "Drag & drop your AndroidManifest.xml file here or click to browse"
                }
              </p>

              {file && (
                <div style={styles.fileInfo}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg style={{ width: "18px", height: "18px", color: "#10b981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#f1f5f9" }}>{file.name}</span>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={removeFile}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
                      e.currentTarget.style.color = "#f87171";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.5)";
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <button
                style={styles.browseButton}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.9)";
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(59, 130, 246, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.8)";
                  e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {file ? "Choose Different File" : "Browse Files"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileInput}
                style={{ display: "none" }}
              />

              {!file && (
                <div style={styles.formatInfo}>
                  <svg style={{ width: "18px", height: "18px", color: "#64748b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Only .xml files are accepted</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorContainer}>
              <div style={styles.errorContent}>
                <div style={styles.errorIcon}>
                  <svg style={{ width: "18px", height: "18px", color: "#f87171" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p style={{ color: "#fca5a5", fontWeight: 600, margin: 0 }}>{error}</p>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            style={styles.analyzeButton}
            onMouseEnter={(e) => {
              if (file && !loading) {
                const gradient = e.currentTarget.querySelector('[data-gradient]') as HTMLElement;
                if (gradient) {
                  gradient.style.background = "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)";
                }
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 20px 40px -15px rgba(59, 130, 246, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (file && !loading) {
                const gradient = e.currentTarget.querySelector('[data-gradient]') as HTMLElement;
                if (gradient) {
                  gradient.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                }
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <div data-gradient style={styles.analyzeButtonGradient} />
            <div style={styles.analyzeButtonContent}>
              {loading ? (
                <>
                  <div style={styles.spinner} />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <svg style={{ width: "22px", height: "22px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Analyze Manifest</span>
                </>
              )}
            </div>
          </button>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button
              onClick={() => router.push("/history")}
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.8)";
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.color = "#93c5fd";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.color = "#cbd5e1";
              }}
            >
              <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>View History</span>
            </button>

            <a
              href="https://play.google/developer-content-policy/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.actionButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.8)";
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.color = "#c4b5fd";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.6)";
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.color = "#cbd5e1";
              }}
            >
              <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Google Play Policy</span>
            </a>
          </div>
        </div>
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
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}