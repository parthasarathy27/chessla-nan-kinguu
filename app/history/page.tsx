"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { History, Calendar, Award, User, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cacheGet, CACHE_KEYS, RecentGame } from "@/lib/cache";

const MOCK_DEFAULT_GAMES: RecentGame[] = [
  {
    id: "g1",
    date: "May 28, 2026",
    opponent: "Nelson (AI)",
    result: "win" as const,
    moves: 42,
    duration: "6m 12s",
    opening: "Sicilian Defense",
  },
  {
    id: "g2",
    date: "May 26, 2026",
    opponent: "Grand Master (AI)",
    result: "loss" as const,
    moves: 56,
    duration: "14m 05s",
    opening: "Queen's Gambit Declined",
  },
  {
    id: "g3",
    date: "May 25, 2026",
    opponent: "Jimmy (AI)",
    result: "win" as const,
    moves: 22,
    duration: "3m 48s",
    opening: "King's Pawn Game",
  },
];

export default function GameHistoryPage() {
  const { data: session, status } = useSession();
  const [games, setGames] = useState<RecentGame[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) redirect("/login");

    // Fetch from cache, merge with mock defaults
    const cachedGames = cacheGet<RecentGame[]>(CACHE_KEYS.RECENT_GAMES, []);
    if (cachedGames.length === 0) {
      setGames(MOCK_DEFAULT_GAMES);
    } else {
      // Merge unique games, prioritizing cached ones
      const merged = [...cachedGames, ...MOCK_DEFAULT_GAMES.filter(mg => !cachedGames.some(cg => cg.id === mg.id))];
      setGames(merged);
    }
  }, [session, status]);

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <History size={28} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0 }}>Game History</h1>
        </div>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Review and analyze your recently completed chess matches.
        </p>
      </motion.div>

      {/* History table */}
      <div className="glass-card" style={{ padding: "8px 0", border: "1px solid var(--border)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              <th style={{ padding: "16px 24px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Date</th>
              <th style={{ padding: "16px 24px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Opponent</th>
              <th style={{ padding: "16px 24px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Result</th>
              <th style={{ padding: "16px 24px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Moves</th>
              <th style={{ padding: "16px 24px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Duration</th>
              <th style={{ padding: "16px 24px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Opening</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g, idx) => (
              <tr
                key={g.id}
                style={{
                  borderBottom: idx === games.length - 1 ? "none" : "1px solid var(--border)",
                  background: "transparent",
                  transition: "background 0.2s",
                  cursor: "default",
                }}
                className="history-row"
              >
                <td style={{ padding: "18px 24px", fontSize: "0.85rem", color: "var(--text2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={14} style={{ color: "var(--gold)" }} />
                    {g.date}
                  </div>
                </td>
                <td style={{ padding: "18px 24px", fontSize: "0.88rem", fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={14} style={{ color: "var(--text-muted)" }} />
                    {g.opponent}
                  </div>
                </td>
                <td style={{ padding: "18px 24px", fontSize: "0.85rem" }}>
                  {g.result === "win" ? (
                    <span className="badge badge-success" style={{ padding: "4px 8px" }}>Win</span>
                  ) : g.result === "loss" ? (
                    <span className="badge badge-red" style={{ padding: "4px 8px" }}>Loss</span>
                  ) : (
                    <span className="badge badge-ghost" style={{ padding: "4px 8px", color: "var(--text2)" }}>Draw</span>
                  )}
                </td>
                <td style={{ padding: "18px 24px", fontSize: "0.85rem", color: "var(--text2)", fontFamily: "monospace" }}>
                  {g.moves} moves
                </td>
                <td style={{ padding: "18px 24px", fontSize: "0.85rem", color: "var(--text2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={13} />
                    {g.duration}
                  </div>
                </td>
                <td style={{ padding: "18px 24px", fontSize: "0.85rem", color: "var(--gold)", fontWeight: 500 }}>
                  {g.opening}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
