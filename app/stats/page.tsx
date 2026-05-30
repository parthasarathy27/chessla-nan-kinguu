"use client";
import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { TrendingUp, Award, Zap, Shield, Flame, Activity } from "lucide-react";
import { motion } from "framer-motion";

const ACHIEVEMENTS = [
  { id: "a1", name: "First Victory", desc: "Win your first chess game.", unlocked: true, icon: "🏆" },
  { id: "a2", name: "Tactical Scholar", desc: "Solve 50 puzzles correctly.", unlocked: true, icon: "📚" },
  { id: "a3", name: "Speed Demon", desc: "Win a Bullet match with < 5 seconds left.", unlocked: false, icon: "⚡" },
  { id: "a4", name: "Impenetrable Wall", desc: "Secure a draw against a higher ELO bot.", unlocked: true, icon: "🛡️" },
];

export default function StatsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session) redirect("/login");

  const user = session.user as any;
  const rating = user.rating || 1200;
  const gamesPlayed = user.gamesPlayed || 0;
  const wins = user.wins || 0;
  const losses = user.losses || 0;
  const draws = user.draws || 0;

  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  const lossRate = gamesPlayed > 0 ? Math.round((losses / gamesPlayed) * 100) : 0;
  const drawRate = gamesPlayed > 0 ? Math.round((draws / gamesPlayed) * 100) : 0;

  // Generate SVG ELO progression path
  // Start from ELO 1000 and progress towards current ELO
  const eloHistory = [1000, 1050, 1020, 1100, 1150, 1130, rating];
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 20;

  const minVal = Math.min(...eloHistory) - 50;
  const maxVal = Math.max(...eloHistory) + 50;
  const points = eloHistory
    .map((val, idx) => {
      const x = padding + (idx * (chartWidth - padding * 2)) / (eloHistory.length - 1);
      const y = chartHeight - padding - ((val - minVal) * (chartHeight - padding * 2)) / (maxVal - minVal);
      return `${x},${y}`;
    })
    .join(" ");

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
          <TrendingUp size={28} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0 }}>Player Statistics</h1>
        </div>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Track your rating progression, game records, and performance metrics.
        </p>
      </motion.div>

      {/* Main Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 28 }}>
        {/* rating summary card */}
        <div className="glass-card" style={{ padding: 24, border: "1px solid var(--border-gold)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>ChessMaster Rating</span>
            <Zap size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0, fontFamily: "Orbitron, monospace", color: "var(--gold)" }}>
              {rating}
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Peak Rating: {Math.max(rating, 1200)} ELO
            </p>
          </div>
        </div>

        {/* Win/loss record card */}
        <div className="glass-card" style={{ padding: 24, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>W / L / D Record</span>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
              {wins}W - {losses}L - {draws}D
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Total Games: {gamesPlayed} Played
            </p>
          </div>
          {/* Win/Loss Bar */}
          <div style={{ height: 8, width: "100%", borderRadius: 999, background: "rgba(255,255,255,0.05)", display: "flex", overflow: "hidden", marginTop: 8 }}>
            <div style={{ width: `${winRate}%`, background: "var(--ok)", height: "100%" }} />
            <div style={{ width: `${drawRate}%`, background: "var(--text-muted)", height: "100%" }} />
            <div style={{ width: `${lossRate}%`, background: "var(--err)", height: "100%" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)" }}>
            <span>Win: {winRate}%</span>
            <span>Draw: {drawRate}%</span>
            <span>Loss: {lossRate}%</span>
          </div>
        </div>

        {/* General Activity */}
        <div className="glass-card" style={{ padding: 24, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Account Tier</span>
            <Shield size={18} style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.65rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
              Elite Challenger
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Member since: May 2026
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
        {/* Rating Progression Graph */}
        <div className="glass-card" style={{ padding: 24, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={18} style={{ color: "var(--gold)" }} /> Rating Progression
          </h3>
          <div style={{ width: "100%", height: 160, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255,255,255,0.01)", borderRadius: 8, padding: 8, border: "1px solid rgba(255,255,255,0.02)" }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "100%" }}>
              {/* Grid lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />

              {/* Line graph */}
              <polyline fill="none" stroke="var(--border-gold)" strokeWidth="3" points={points} />

              {/* Data points */}
              {eloHistory.map((val, idx) => {
                const x = padding + (idx * (chartWidth - padding * 2)) / (eloHistory.length - 1);
                const y = chartHeight - padding - ((val - minVal) * (chartHeight - padding * 2)) / (maxVal - minVal);
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="5" fill="var(--gold)" />
                    <text x={x} y={y - 8} fill="var(--text2)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Achievements list */}
        <div className="glass-card" style={{ padding: 24, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} style={{ color: "var(--gold)" }} /> Unlocked Achievements
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: a.unlocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                  border: a.unlocked ? "1px solid var(--border)" : "1px solid rgba(255,255,255,0.02)",
                  opacity: a.unlocked ? 1 : 0.45,
                }}
              >
                <span style={{ fontSize: "1.6rem" }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: a.unlocked ? "var(--text)" : "var(--text-muted)" }}>
                    {a.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{a.desc}</div>
                </div>
                {a.unlocked ? (
                  <span className="badge badge-gold" style={{ fontSize: "0.6rem" }}>Unlocked</span>
                ) : (
                  <span className="badge badge-ghost" style={{ fontSize: "0.6rem" }}>Locked</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
