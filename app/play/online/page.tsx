"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Users, Trophy, X } from "lucide-react";

const ChessBoardGame = dynamic(() => import("@/components/ChessBoard"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: "var(--text-muted)" }}>Connecting to arena...</p>
    </div>
  ),
});

const SIMULATED_OPPONENTS = [
  { name: "BishopBlaster", rating: 1240, avatar: "♟️" },
  { name: "PawnStar99", rating: 1180, avatar: "⚔️" },
  { name: "QueenGambit", rating: 1290, avatar: "👑" },
  { name: "KnightRiderX", rating: 1215, avatar: "🐎" }
];

export default function PlayOnlinePage() {
  const { data: session, status } = useSession();
  const [matchState, setMatchState] = useState<"searching" | "found" | "playing">("searching");
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [opponent, setOpponent] = useState<typeof SIMULATED_OPPONENTS[0] | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) redirect("/login");
  }, [session, status]);

  // Matchmaking Timer
  useEffect(() => {
    if (matchState !== "searching") return;
    const interval = setInterval(() => {
      setMatchSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [matchState]);

  // Trigger Match Found
  useEffect(() => {
    if (matchState !== "searching") return;
    const timeout = setTimeout(() => {
      const chosen = SIMULATED_OPPONENTS[Math.floor(Math.random() * SIMULATED_OPPONENTS.length)];
      setOpponent(chosen);
      setMatchState("found");
    }, 4500); // 4.5 seconds matchmaking delay
    return () => clearTimeout(timeout);
  }, [matchState]);

  // Versus Countdown Timer
  useEffect(() => {
    if (matchState !== "found") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setMatchState("playing");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [matchState]);

  if (status === "loading") return null;
  if (!session) return null;

  const user = session.user as any;
  const userRating = user.rating || 1200;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
      {matchState !== "playing" && <Header />}

      <AnimatePresence mode="wait">
        {matchState === "searching" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card"
            style={{
              padding: "48px 24px",
              textAlign: "center",
              maxWidth: 500,
              margin: "40px auto 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              border: "1px solid var(--border)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background glowing pulse grid */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 320,
                height: 320,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Radar Ring 1 */}
                <motion.div
                  animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "2px solid var(--gold)" }}
                />
                {/* Radar Ring 2 */}
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.7, ease: "easeOut" }}
                  style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "1px solid var(--gold)" }}
                />
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-glass)", border: "2px solid var(--border-gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe size={28} style={{ color: "var(--gold)" }} className="spin-slow" />
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 700, margin: "0 0 6px 0" }}>Finding Match</h2>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
                  Searching for players in your ELO bracket ({userRating - 50} - {userRating + 50})
                </p>
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1, display: "flex", width: "100%", gap: 12, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 10, border: "1px solid var(--border)", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Queue Time</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "monospace" }}>{formatTime(matchSeconds)}</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Online Players</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "monospace", color: "var(--gold)" }}>1,842</span>
              </div>
            </div>

            <button
              onClick={() => redirect("/play")}
              className="btn btn-danger"
              style={{ width: "100%", justifyContent: "center", gap: 8, position: "relative", zIndex: 1 }}
            >
              <X size={16} /> Cancel Search
            </button>
          </motion.div>
        )}

        {matchState === "found" && opponent && (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card"
            style={{
              padding: "40px 24px",
              textAlign: "center",
              maxWidth: 550,
              margin: "60px auto 0 auto",
              border: "1px solid var(--border-gold)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--gold)", margin: "0 0 4px 0" }}>MATCH FOUND!</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>Starting in {countdown} seconds...</p>
            </div>

            {/* Matchup animation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", width: "100%", gap: 20 }}>
              {/* You */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 150 }}>
                <div className="user-avatar" style={{ width: 72, height: 72, fontSize: "1.8rem", border: "2px solid var(--border-gold)" }}>
                  {user.avatar || user.name?.[0] || "P"}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", textAlign: "center" }}>{user.name}</div>
                <div className="badge badge-gold" style={{ fontFamily: "Orbitron, monospace", fontSize: "0.7rem" }}>{userRating} ELO</div>
              </div>

              {/* VS Divider */}
              <div style={{ fontSize: "1.8rem", fontWeight: 900, fontStyle: "italic", color: "rgba(212,175,55,0.25)" }}>VS</div>

              {/* Opponent */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 150 }}>
                <div className="user-avatar" style={{ width: 72, height: 72, fontSize: "1.8rem", border: "2px solid var(--border)", background: "rgba(255,255,255,0.03)" }}>
                  {opponent.avatar}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", textAlign: "center" }}>{opponent.name}</div>
                <div className="badge badge-purple" style={{ fontFamily: "Orbitron, monospace", fontSize: "0.7rem" }}>{opponent.rating} ELO</div>
              </div>
            </div>
          </motion.div>
        )}

        {matchState === "playing" && opponent && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Header />
            <ChessBoardGame
              userName={user.name || "Player"}
              userRating={userRating}
              userAvatar={user.avatar || "P"}
              initialGameMode="ai"
              opponentName={opponent.name}
              opponentRating={opponent.rating}
              opponentAvatar={opponent.avatar}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
