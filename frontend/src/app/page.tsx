"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Shield, AlertTriangle, FileText, CheckCircle, ChevronRight, BarChart3, BookOpen, Sparkles, X } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Prevent FOUC by ensuring component is mounted before showing content
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as Node;
    const currentTarget = e.currentTarget as Node;
    if (!currentTarget.contains(relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.name.endsWith(".xml")) {
        setFile(selected);
        setError(null);
      } else {
        setError("Please select an XML file");
      }
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
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show loading state until mounted to prevent FOUC
  if (!mounted) {
    return (
      <>
        <div className="loading-container">
          <div className="spinner-large" />
        </div>
        <style jsx global>{`
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          *::-webkit-scrollbar {
            display: none;
          }
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          }
          #__next {
            height: 100%;
          }
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          }
          .spinner-large {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(241, 245, 249, 0.1);
            border-top-color: #f1f5f9;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  return (
    <div className="main-container">
      {/* Enhanced background with subtle patterns */}
      <div className="bg-pattern" />
      <div className="bg-gradient-main" />
      <div className="bg-gradient-accent" />
      <div className="bg-noise" />

      <div className="content-wrapper">
        {/* Header with better spacing */}
        <header className="header">
          <div className="logo-badge">
            <div className="logo-icon">
              <Shield size={24} />
            </div>
            <div className="logo-pulse" />
          </div>
          
          <div className="header-content">
            <div className="title-wrapper">
              <h1 className="main-title">
                Play Store
                <span className="title-highlight">Reviewer</span>
              </h1>
              <div className="title-underline" />
            </div>
            
            <p className="subtitle">
              Professional compliance analysis for Android applications
              <span className="subtitle-icon">
                <Sparkles size={14} />
              </span>
            </p>
            
            <div className="header-stats">
              <div className="stat-chip">
                <span className="stat-chip-label">Trusted by</span>
                <span className="stat-chip-value">2,500+</span>
                <span className="stat-chip-label">developers</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="main-content">
          {/* Stats with improved visual hierarchy */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon-wrapper stat-icon-warning">
                  <AlertTriangle size={18} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">150+</div>
                  <div className="stat-label">Policy Checks</div>
                  <div className="stat-description">Comprehensive compliance analysis</div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon-wrapper stat-icon-info">
                  <FileText size={18} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">2.5K+</div>
                  <div className="stat-label">Manifests Analyzed</div>
                  <div className="stat-description">Real-world experience</div>
                </div>
              </div>
            </div>

            <div className="stat-card stat-card-highlight">
              <div className="stat-card-inner">
                <div className="stat-icon-wrapper stat-icon-success">
                  <CheckCircle size={18} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">98%</div>
                  <div className="stat-label">Accuracy Rate</div>
                  <div className="stat-description">Industry-leading precision</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload section with better visual feedback */}
          <div className="upload-container">
            <div className="upload-header">
              <h2 className="upload-title">Upload Manifest</h2>
              <div className="upload-subtitle">
                Drop your AndroidManifest.xml file for instant compliance analysis
              </div>
            </div>

            <div 
              className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={file ? undefined : handleZoneClick}
              role="button"
              tabIndex={0}
            >
              <div className="upload-zone-content">
                {file ? (
                  <>
                    <div className="file-header">
                      <div className="file-indicator">
                        <div className="file-indicator-icon">
                          <FileText size={20} />
                        </div>
                        <div className="file-indicator-text">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      </div>
                      <button 
                        className="remove-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="upload-ready">
                      <CheckCircle size={16} />
                      <span>Ready for analysis</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="upload-icon">
                      <div className="upload-icon-circle">
                        <Upload size={24} />
                      </div>
                    </div>
                    <div className="upload-text">
                      <h3>Drag & drop your file here</h3>
                      <p>Supports .xml files only</p>
                    </div>
                    <div className="upload-actions">
                      <button 
                        className="browse-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoneClick();
                        }}
                      >
                        <Upload size={16} />
                        Browse files
                      </button>
                      <div className="upload-hint">
                        or click anywhere in this area
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <input 
                ref={fileInputRef}
                id="fileInput" 
                type="file" 
                accept=".xml" 
                onChange={handleFileInput} 
                style={{ display: "none" }} 
              />
            </div>

            {error && (
              <div className="error-container">
                <div className="error-message">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`analyze-button ${!file ? 'disabled' : ''} ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <div className="button-spinner" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Analyze Compliance</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Navigation with better visual separation */}
          <nav className="nav-container">
            <div className="nav-divider">
              <span>Quick Links</span>
              <div className="divider-line" />
            </div>
            
            <div className="nav-links">
              <a href="/history" className="nav-link">
                <div className="nav-link-icon">
                  <BarChart3 size={18} />
                </div>
                <div className="nav-link-content">
                  <div className="nav-link-title">Analysis History</div>
                  <div className="nav-link-subtitle">View past reports</div>
                </div>
                <ChevronRight size={18} className="nav-link-arrow" />
              </a>
              
              <a href="/docs" className="nav-link">
                <div className="nav-link-icon">
                  <BookOpen size={18} />
                </div>
                <div className="nav-link-content">
                  <div className="nav-link-title">Guidelines</div>
                  <div className="nav-link-subtitle">Compliance documentation</div>
                </div>
                <ChevronRight size={18} className="nav-link-arrow" />
              </a>
            </div>
          </nav>
        </main>
      </div>

      <style jsx global>{`
        /* Critical global styles */
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        *::-webkit-scrollbar {
          display: none;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
        }
        
        #__next {
          height: 100%;
        }
      `}</style>

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          max-height: 100vh;
          height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f1f5f9;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          padding: 1rem;
          box-sizing: border-box;
        }

        @media (min-width: 640px) {
          .main-container {
            padding: 1.5rem;
          }
        }

        @media (min-width: 768px) {
          .main-container {
            padding: 2rem;
          }
        }

        @media (min-width: 1024px) {
          .main-container {
            padding: 3rem;
          }
        }

        /* Background effects */
        .bg-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .bg-gradient-main {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.5;
        }

        .bg-gradient-accent {
          position: absolute;
          bottom: -20%;
          left: -10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.4;
        }

        .bg-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .content-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          height: 100%;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-right: 4px;
        }

        .content-wrapper::-webkit-scrollbar {
          display: none;
        }

        /* Header */
        .header {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          margin-bottom: 2rem;
          padding: 0.5rem 0;
        }

        @media (min-width: 640px) {
          .header {
            gap: 1.5rem;
            margin-bottom: 2.5rem;
          }
        }

        @media (min-width: 768px) {
          .header {
            margin-bottom: 3rem;
          }
        }

        .logo-badge {
          position: relative;
          flex-shrink: 0;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 8px 32px rgba(59, 130, 246, 0.25),
            inset 0 1px 1px rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 2;
        }

        @media (min-width: 768px) {
          .logo-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
          }
        }

        .logo-pulse {
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 18px;
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
          filter: blur(8px);
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }

        .header-content {
          flex: 1;
          min-width: 0;
        }

        .title-wrapper {
          margin-bottom: 0.75rem;
          position: relative;
        }

        .main-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .main-title {
            font-size: 2.25rem;
          }
        }

        @media (min-width: 768px) {
          .main-title {
            font-size: 2.75rem;
          }
        }

        @media (min-width: 1024px) {
          .main-title {
            font-size: 3.25rem;
          }
        }

        .title-highlight {
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
          margin-left: 0.5rem;
        }

        .title-underline {
          width: 100px;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
          margin-top: 0.5rem;
          opacity: 0.8;
        }

        @media (min-width: 768px) {
          .title-underline {
            width: 120px;
          }
        }

        .subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
          line-height: 1.5;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        @media (min-width: 640px) {
          .subtitle {
            font-size: 1rem;
            margin-bottom: 1.25rem;
          }
        }

        @media (min-width: 768px) {
          .subtitle {
            font-size: 1.125rem;
            margin-bottom: 1.5rem;
          }
        }

        .subtitle-icon {
          color: #fbbf24;
        }

        .header-stats {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .stat-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 20px;
          padding: 0.375rem 0.875rem;
          font-size: 0.75rem;
          backdrop-filter: blur(10px);
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .stat-chip {
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
          }
        }

        .stat-chip-label {
          color: #cbd5e1;
        }

        .stat-chip-value {
          color: #f1f5f9;
          font-weight: 600;
        }

        /* Main content */
        .main-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .main-content {
            gap: 2.5rem;
          }
        }

        /* Stats */
        .stats-container {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1rem;
        }

        @media (min-width: 480px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .stats-container {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
          }
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 16px;
          padding: 1.25rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        @media (min-width: 768px) {
          .stat-card {
            padding: 1.5rem;
            border-radius: 20px;
          }
        }

        .stat-card:hover {
          border-color: rgba(100, 116, 139, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        }

        .stat-card-highlight {
          border-color: rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
        }

        .stat-card-inner {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .stat-icon-wrapper {
            width: 44px;
            height: 44px;
          }
        }

        .stat-icon-warning {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
          color: #f59e0b;
        }

        .stat-icon-info {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
          color: #60a5fa;
        }

        .stat-icon-success {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
          color: #34d399;
        }

        .stat-content {
          flex: 1;
          min-width: 0;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        @media (min-width: 768px) {
          .stat-value {
            font-size: 2rem;
          }
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 0.25rem;
        }

        .stat-description {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.4;
        }

        /* Upload section */
        .upload-container {
          width: 100%;
        }

        .upload-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .upload-header {
            margin-bottom: 2rem;
          }
        }

        .upload-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.5rem 0;
        }

        @media (min-width: 768px) {
          .upload-title {
            font-size: 1.875rem;
          }
        }

        .upload-subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
          line-height: 1.5;
          max-width: 600px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .upload-subtitle {
            font-size: 1rem;
          }
        }

        .upload-zone {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
          border: 2px dashed rgba(100, 116, 139, 0.4);
          border-radius: 20px;
          padding: 2rem 1.25rem;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .upload-zone {
            padding: 3rem 1.5rem;
            border-radius: 24px;
          }
        }

        .upload-zone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .upload-zone:hover:not(.has-file) {
          border-color: rgba(100, 116, 139, 0.6);
        }

        .upload-zone:hover:not(.has-file)::before {
          opacity: 1;
        }

        .upload-zone.dragging {
          border-color: #3b82f6;
          border-style: solid;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
        }

        .upload-zone.has-file {
          border-color: #10b981;
          border-style: solid;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
          padding: 1.5rem 1.25rem;
          cursor: default;
        }

        @media (min-width: 768px) {
          .upload-zone.has-file {
            padding: 2rem 1.5rem;
          }
        }

        .upload-zone-content {
          position: relative;
          z-index: 2;
        }

        .file-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .file-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }

        .file-indicator-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #34d399;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .file-indicator-icon {
            width: 48px;
            height: 48px;
          }
        }

        .file-indicator-text {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          display: block;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .remove-file-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .remove-file-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
        }

        .upload-icon {
          margin-bottom: 1.5rem;
        }

        .upload-icon-circle {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
        }

        @media (min-width: 768px) {
          .upload-icon-circle {
            width: 64px;
            height: 64px;
          }
        }

        .upload-text h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0 0 0.5rem 0;
          text-align: center;
        }

        @media (min-width: 768px) {
          .upload-text h3 {
            font-size: 1.25rem;
          }
        }

        .upload-text p {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0;
          text-align: center;
        }

        .upload-actions {
          margin-top: 1.5rem;
          text-align: center;
        }

        .browse-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .browse-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        .upload-hint {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.75rem;
        }

        .upload-ready {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(34, 197, 94, 0.1);
          color: #34d399;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .error-container {
          margin-top: 1rem;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          color: #f87171;
          font-size: 0.875rem;
        }

        .analyze-button {
          width: 100%;
          margin-top: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .analyze-button {
            padding: 1.125rem;
            font-size: 1.125rem;
          }
        }

        .analyze-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .analyze-button:hover:not(.disabled):not(.loading) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
        }

        .analyze-button:hover:not(.disabled):not(.loading)::before {
          opacity: 1;
        }

        .analyze-button.disabled {
          background: #475569;
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }

        .analyze-button.loading {
          cursor: wait;
        }

        .analyze-button > * {
          position: relative;
          z-index: 2;
        }

        .button-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Navigation */
        .nav-container {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(71, 85, 105, 0.3);
        }

        .nav-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .nav-divider span {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .nav-divider span {
            font-size: 0.875rem;
          }
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(71, 85, 105, 0.3), transparent);
        }

        .nav-links {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .nav-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 16px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          min-height: 72px;
        }

        @media (min-width: 768px) {
          .nav-link {
            padding: 1.25rem;
          }
        }

        .nav-link:hover {
          border-color: rgba(100, 116, 139, 0.5);
          background: rgba(30, 41, 59, 0.8);
          transform: translateX(4px);
        }

        .nav-link-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .nav-link-icon {
            width: 44px;
            height: 44px;
          }
        }

        .nav-link-content {
          flex: 1;
          min-width: 0;
        }

        .nav-link-title {
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        @media (min-width: 768px) {
          .nav-link-title {
            font-size: 1rem;
          }
        }

        .nav-link-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .nav-link-arrow {
          color: #94a3b8;
          opacity: 0.7;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .nav-link:hover .nav-link-arrow {
          transform: translateX(4px);
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
}