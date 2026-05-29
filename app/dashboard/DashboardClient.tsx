"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import Link from "next/link";
import { cacheGet, CACHE_KEYS } from "@/lib/cache";
import Header from "@/components/Header";
import {
  Gamepad2,
  Trophy,
  TrendingUp,
  Skull,
  Handshake,
  BookOpen,
  Bot,
  ArrowRight,
  Bell,
  Wallet,
  Search,
  Play,
  Puzzle,
  User,
  Zap,
  Eye,
  List,
  Users,
  Award,
  Settings,
  Star,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { signOut } from "next-auth/react";
import { cacheClear } from "@/lib/cache";

const LEADERBOARD = [
  { name: "GrandBot AI", avatar: "🤖", rating: 3240, wins: 999, subtext: "Global Core" },
  { name: "Hikaru_Fan_92", avatar: "🥈", rating: 2912, wins: 282, subtext: "Int. Sub-Master" },
  { name: "Grand Master (You)", avatar: "👑", rating: 2800, wins: 98, subtext: "Legend Protocol", isYou: true },
];

export default function DashboardClient({ user }: { user: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();
  const recentGames = cacheGet(CACHE_KEYS.RECENT_GAMES, []) as any[];
  const winRate = user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0;

  const handleLogout = async () => {
    cacheClear();
    await signOut({ callbackUrl: "/login" });
  };

  // Use recent games or fallback to mock logs to ensure dashboard looks alive
  const displayedGames = recentGames.length > 0 ? recentGames.map(g => ({
    opponent: g.opponent,
    result: g.result,
    date: g.date,
    format: "Blitz 5+0",
    isOffline: g.result !== "win"
  })) : [
    { opponent: "MagnusCarlsen_Bot", result: "loss", date: "2h ago", format: "Blitz 5+0", isOffline: true },
    { opponent: "ChessMaster_99", result: "win", date: "5h ago", format: "Bullet 1+0", isOffline: false },
    { opponent: "Tournament: Matrix 2026", result: "win", date: "Yesterday", format: "Rapid Arena", isOffline: false }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Fade/Slide in the header
      tl.fromTo(
        ".dashboard-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );

      // 2. Slide in the bento components
      tl.fromTo(
        ".bento-hero",
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.1)" },
        "-=0.4"
      );

      tl.fromTo(
        ".bento-puzzle",
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.1)" },
        "-=0.45"
      );

      // 3. Stagger stats cards
      tl.fromTo(
        ".bento-stat-card",
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.35"
      );

      // 4. Stagger tables/details
      tl.fromTo(
        ".bento-logs, .bento-leaderboard",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" },
        "-=0.3"
      );

      // 5. Stagger footer blocks
      tl.fromTo(
        ".bento-footer-card",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.25"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="dashboard-page-wrapper" ref={containerRef}>
      {/* Top Bar / Header */}
      <Header />

      {/* Main Bento Grid */}
      <div className="dashboard-bento-grid">
        {/* Bento Card 1: Hero Play Banner */}
        <section className="bento-hero" style={{ opacity: 0 }}>
          <div style={{ zIndex: 10, maxWidth: "480px" }}>
            <span style={{ display: "inline-block", padding: "4px 12px", background: "rgba(181, 136, 99, 0.15)", color: "var(--gold)", border: "1px solid var(--border-gold)", borderRadius: 99, fontSize: "0.68rem", fontFamily: "Orbitron, monospace", fontWeight: 600, marginBottom: 16 }}>
              LIVE NOW • 12,402 ACTIVE TABLES
            </span>
            <h2 className="gold-text" style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 12px 0", fontFamily: "Orbitron, sans-serif" }}>Master the Circuit</h2>
            <p style={{ color: "var(--text2)", fontSize: "0.9rem", margin: "0 0 28px 0", lineHeight: 1.6 }}>
              Join the high-frequency elite arena. Every calculation counts in the pursuit of Grand Master status. Are you ready for the next node?
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/play" className="btn btn-gold" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px" }}>
                <Play size={16} fill="currentColor" /> Start New Protocol
              </Link>
              <Link href="/play" className="btn btn-ghost" style={{ padding: "12px 24px", border: "1px solid var(--border)" }}>
                Tournament Access
              </Link>
            </div>
          </div>
          {/* Fading Background Visual Image */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "45%", overflow: "hidden", opacity: 0.25 }}>
            <img
              alt="Cinematic cyberpunk chess visual"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQ6507QT9L4y0B-o09k3Erj6fF6KF059VIVIoh3PNfNlZj6LdVLZOEALcnuztXjN4QuG4FfrVpf1cu-8fonKFROLsdapRVYgW9eFxoohgb53IgUB_eY5Mf1Y7a2rFJIeuzORo0z0NGB4j8s4zemCNET2Pu9SNAGEen8ASHffoSnX1sJFQlhBVQygpBCjQb8KzmkYZoouWADptCNqA84gH0YYo_R6XxQpPeUa8igqd2GlHM-qO94jKbBFWn_Yu1LJTmMYmdtt-7bJk"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--bg-card) 5%, transparent)" }} />
          </div>
        </section>

        {/* Bento Card 2: Cyber Puzzle */}
        <section className="bento-puzzle" style={{ opacity: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>Cyber Puzzle</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.72rem", color: "var(--text2)", fontFamily: "Orbitron, monospace" }}>System: Cyan • Resolve in 3</p>
            </div>
            <div style={{ background: "rgba(181, 136, 99, 0.15)", border: "1px solid var(--border-gold)", color: "var(--gold)", padding: "4px 10px", borderRadius: 99, fontSize: "0.68rem", fontFamily: "Orbitron, monospace" }}>
              +15 NODE
            </div>
          </div>
          
          <div className="neon-pulse" style={{ flex: 1, background: "rgba(0,0,0,0.15)", borderRadius: 16, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", minHeight: 120 }}>
            {/* Mini Board Decorator */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", width: 100, height: 100, opacity: 0.15 }}>
              {[...Array(16)].map((_, i) => (
                <div key={i} style={{ background: (Math.floor(i / 4) + i) % 2 === 0 ? "var(--gold)" : "transparent" }} />
              ))}
            </div>
            <Puzzle size={36} style={{ position: "absolute", color: "var(--gold)" }} />
          </div>

          <Link href="/puzzles" className="btn btn-ghost" style={{ marginTop: 16, width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)" }}>
            Initiate Solve
          </Link>
        </section>

        {/* Bento Row 2: Stats Grid */}
        <div className="bento-stats-grid">
          {[
            { label: "ELO RATING", value: user.rating ?? "—", sub: "TOP 1.2%", percent: 92, icon: <Star size={16} /> },
            { label: "GAMES PLAYED", value: user.gamesPlayed ?? 0, sub: "+12 this cycle", percent: null, icon: <Gamepad2 size={16} /> },
            { label: "TOTAL WINS", value: user.wins ?? 0, sub: "Streak: 5 wins", percent: null, icon: <Trophy size={16} /> },
            { label: "WIN RATE", value: `${winRate}%`, sub: "1.4% efficiency+", percent: null, icon: <TrendingUp size={16} /> },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="glass-card bento-stat-card"
              style={{ opacity: 0, padding: 24, borderRadius: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              whileHover={{ scale: 1.03, borderColor: "var(--border-gold)" }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "0.68rem", fontFamily: "Orbitron, monospace", color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--gold)" }}>{s.icon}</span> {s.label}
                </p>
                <p className="gold-text" style={{ margin: "12px 0 0 0", fontSize: "2rem", fontWeight: 700, fontFamily: "Orbitron, monospace" }}>{s.value}</p>
              </div>
              {s.percent !== null ? (
                <div style={{ height: 4, background: "rgba(0,0,0,0.2)", borderRadius: 99, marginTop: 16, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.percent}%`, background: "var(--gold)", borderRadius: 99, boxShadow: "var(--shadow-gold)" }} />
                </div>
              ) : (
                <p style={{ margin: "16px 0 0 0", fontSize: "0.68rem", fontFamily: "Orbitron, monospace", color: "var(--gold)" }}>{s.sub}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bento Row 3: Active Logs & Leaderboard */}
        {/* Column 1: Active Logs */}
        <section className="bento-logs" style={{ opacity: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>Active Logs</h3>
            <Link href="/play" style={{ fontSize: "0.68rem", fontFamily: "Orbitron, monospace", color: "var(--gold)", textDecoration: "none" }}>
              VIEW FULL HISTORY
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {displayedGames.map((g: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", border: "1px solid var(--border)" }}>
                  <User size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "var(--text)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{g.opponent}</p>
                    <span style={{ fontSize: "0.62rem", fontFamily: "Orbitron, monospace", padding: "2px 6px", borderRadius: 4, background: g.result === "win" ? "rgba(181, 136, 99, 0.15)" : "rgba(225,29,72,0.1)", color: g.result === "win" ? "var(--gold)" : "var(--err)" }}>
                      {g.isOffline ? "OFFLINE" : "LINKED"}
                    </span>
                  </div>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.72rem", color: "var(--text2)", fontFamily: "Orbitron, monospace" }}>{g.format}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontFamily: "Orbitron, monospace", fontWeight: 700, color: g.result === "win" ? "var(--gold)" : "var(--err)" }}>
                    {g.result === "win" ? "+18 ELO" : "-14 ELO"}
                  </p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.68rem", color: "var(--muted)" }}>{g.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Column 2: Leaderboard */}
        <section className="bento-leaderboard" style={{ opacity: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>Global Matrix</h3>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="theme-toggle" style={{ width: 32, height: 32, borderRadius: 6 }}><List size={14} /></button>
              <button className="theme-toggle" style={{ width: 32, height: 32, borderRadius: 6 }}><Users size={14} /></button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LEADERBOARD.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 16, background: p.isYou ? "rgba(181, 136, 99, 0.1)" : "transparent", border: p.isYou ? "1px solid var(--border-gold)" : "1px solid transparent" }}>
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.72rem", fontWeight: 700, color: "var(--gold)", width: 20 }}>
                  {i === 0 ? "01" : i === 1 ? "02" : "12"}
                </div>
                <div className="user-avatar" style={{ width: 34, height: 34, fontSize: "0.8rem", margin: 0 }}>
                  {p.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.85rem", color: "var(--text)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{p.name}</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.7rem", color: "var(--text2)" }}>{p.subtext}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "0.78rem", fontFamily: "Orbitron, monospace", fontWeight: 700, color: "var(--gold)" }}>{p.rating}</p>
                  {i === 0 && <p style={{ margin: "2px 0 0 0", fontSize: "0.62rem", fontFamily: "Orbitron, monospace", color: "var(--gold)" }}>TOP 0.1%</p>}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-ghost" style={{ marginTop: 24, width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", padding: "12px" }}>
            <Award size={16} /> Access Achievements Core
          </button>
        </section>

        {/* Bento Row 4: Footer Intelligence Info */}
        <div className="bento-footer-grid">
          {/* Card 1: System Logic */}
          <div className="glass-card bento-footer-card" style={{ opacity: 0, padding: 24, borderRadius: 24 }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.68rem", fontFamily: "Orbitron, monospace", color: "var(--gold)", letterSpacing: 0.8 }}>SYSTEM LOGIC</h4>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text2)", lineHeight: 1.5, fontStyle: "italic" }}>
              "Efficiency is not just speed, but the economy of motion. Calibrate your control of the center nodes."
            </p>
          </div>

          {/* Card 2: Signal Sync */}
          <div className="glass-card bento-footer-card" style={{ opacity: 0, padding: 24, borderRadius: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.68rem", fontFamily: "Orbitron, monospace", color: "var(--gold)", letterSpacing: 0.8 }}>SIGNAL SYNC</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 6, background: "rgba(0,0,0,0.2)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "95%", background: "var(--gold)", borderRadius: 99, boxShadow: "var(--shadow-gold)" }} />
              </div>
              <span style={{ fontSize: "0.68rem", fontFamily: "Orbitron, monospace", color: "var(--gold)", whiteSpace: "nowrap" }}>Optimal (24ms)</span>
            </div>
          </div>

          {/* Card 3: Uplink Stream */}
          <div className="glass-card bento-footer-card" style={{ opacity: 0, padding: 24, borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "0.68rem", fontFamily: "Orbitron, monospace", color: "var(--gold)", letterSpacing: 0.8 }}>UPLINK STREAM</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>GM Polgar Analysis</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--text2)" }}>ETA</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", fontFamily: "Orbitron, monospace", fontWeight: 700, color: "var(--gold)" }}>02:45:12</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
