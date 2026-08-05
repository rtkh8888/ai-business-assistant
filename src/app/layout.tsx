import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Business Research & Outreach Assistant",
  description: "MVP for researching business websites and saving structured lead analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
