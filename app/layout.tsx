import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";

const font = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "StockSense AI",
  description: "Educational stock market chatbot that keeps things simple."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className="bg-surface text-slate-100">
        <Navbar />
        <div className="min-h-screen pt-20">{children}</div>
      </body>
    </html>
  );
}
