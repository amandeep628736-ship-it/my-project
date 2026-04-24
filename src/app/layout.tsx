import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus Learning — E-Learning Platform",
  description:
    "A modern full-stack e-learning platform built with Next.js 16, Prisma, and SQLite. Features course management, lessons, enrollments, and an admin dashboard.",
  openGraph: {
    title: "Nexus Learning — E-Learning Platform",
    description:
      "A modern full-stack e-learning platform built with Next.js 16, Prisma, and SQLite.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus Learning — E-Learning Platform",
    description:
      "A modern full-stack e-learning platform built with Next.js 16, Prisma, and SQLite.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
