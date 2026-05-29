import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "ChessMaster Pro — Premium Chess Gaming",
  description: "Play chess online with AI opponents, track your rating, and compete on the leaderboard.",
  keywords: "chess, chess game, play chess online, chess AI",
  openGraph: {
    title: "ChessMaster Pro",
    description: "Premium chess gaming platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider>
            <Navbar />
            <main>{children}</main>
            <footer className="footer">
              <p>© 2024 ChessMaster Pro — Powered by Gaming Co. All rights reserved.</p>
            </footer>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
