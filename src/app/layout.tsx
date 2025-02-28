import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import SignIn from "../components/SignIn";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ludicrous Batting Order",
  description: "Decide batting order with upvotes and downvotes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen`}
      >
        <AuthProvider>
          <header className="sticky top-0 z-50 w-full border-b bg-white/80 shadow-sm backdrop-blur-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Team Ludicrous
              </h1>
              <SignIn />
            </div>
          </header>
          <div className="container mx-auto max-w-7xl">
            <main className="px-4 py-6">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
