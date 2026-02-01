import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Store Reviewer",
  description: "Android app policy analyzer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0a0e1a" }}>
        {children}
      </body>
    </html>
  );
}