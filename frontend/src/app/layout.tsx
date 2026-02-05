import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Store Reviewer",
  description: "Android app policy analyzer - Professional grade compliance analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        background: "linear-gradient(135deg, #003049 0%, #0a1929 100%)",
        minHeight: "100vh",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflowX: "hidden"
      }}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, #fdf0d5, transparent)",
          zIndex: 1000
        }} />
        {children}
      </body>
    </html>
  );
}