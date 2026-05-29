"use client";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { cacheClear, cacheGet, CACHE_KEYS } from "@/lib/cache";
import Link from "next/link";
import { Mail, Star, ShieldCheck, Gamepad2, BarChart3, User, Zap, Trash2, LogOut, Award, Trophy, Target, Crown, Bot } from "lucide-react";
import Header from "@/components/Header";

export default function ProfileClient({ user }: { user: any }) {
  const prefs = cacheGet(CACHE_KEYS.USER_PREFERENCES, { boardTheme: "classic", notifications: true });
  const winRate = user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0;

  async function handleLogout() {
    cacheClear();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="profile-page" style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
      <Header />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <div className="dashboard-bento-grid" style={{ marginTop: 20 }}>
          {/* Profile Card / Header - Span 8 */}
          <div className="glass-card bento-col-8" style={{ padding: 28, display: "flex", gap: 24, alignItems: "center", minHeight: "220px" }}>
            <div className="profile-avatar-lg" style={{ flexShrink: 0 }}>{user.avatar || user.name?.[0]}</div>
            <div className="profile-info" style={{ flexGrow: 1 }}>
              <h1 className="profile-name gold-text" style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 4px 0", fontFamily: "Orbitron, sans-serif" }}>{user.name}</h1>
              <p className="profile-email" style={{ display: "inline-flex", alignItems: "center", gap: 6, margin: "0 0 16px 0", color: "var(--text2)", fontSize: "0.9rem" }}>
                <Mail size={14} /> {user.email}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span className="badge badge-gold" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "Orbitron, monospace" }}><Star size={12} /> {user.rating} ELO</span>
                <span className="badge badge-green" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><ShieldCheck size={12} /> Active</span>
                <span className="badge badge-purple" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Gamepad2 size={12} /> Chess Player</span>
              </div>
            </div>
          </div>

          {/* Quick Actions - Span 4 */}
          <div className="glass-card bento-col-4" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "220px" }}>
            <h2 className="section-title" style={{ margin: "0 0 16px 0", display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1.1rem" }}>
              <Zap size={18} style={{ color: "var(--gold)" }} /> Quick Actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexGrow: 1, justifyContent: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/play" className="btn btn-gold btn-sm" style={{ flex: 1, display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <Gamepad2 size={14} /> Play
                </Link>
                <Link href="/dashboard" className="btn btn-outline btn-sm" style={{ flex: 1, display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <BarChart3 size={14} /> Dashboard
                </Link>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { cacheClear(); window.location.reload(); }}
                style={{ width: "100%", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center", border: "1px solid var(--border)" }}
              >
                <Trash2 size={14} /> Clear Game Cache
              </button>
            </div>
          </div>

          {/* Game Stats - Span 8 */}
          <div className="glass-card bento-col-8" style={{ padding: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 18, display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1.2rem" }}>
              <BarChart3 size={18} style={{ color: "var(--gold)" }} /> Game Statistics
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { label: "Total Games", value: user.gamesPlayed, color: "var(--text)" },
                { label: "Wins", value: user.wins, color: "var(--gold)" },
                { label: "Losses", value: user.losses, color: "var(--err)" },
                { label: "Draws", value: user.draws, color: "var(--text2)" },
                { label: "Win Rate", value: `${winRate}%`, color: "var(--gold-l)" },
                { label: "ELO Rating", value: user.rating, color: "var(--gold)" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "16px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ color: "var(--text2)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</span>
                  <span style={{ fontWeight: 800, color: s.color, fontFamily: "Orbitron, monospace", fontSize: "1.4rem" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Info - Span 4 */}
          <div className="glass-card bento-col-4" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <h2 className="section-title" style={{ marginBottom: 18, display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1.2rem" }}>
              <User size={18} style={{ color: "var(--gold)" }} /> Account Info
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Username", value: user.username || user.name },
                { label: "Email", value: user.email },
                { label: "Account Type", value: "Demo Account" },
                { label: "Member Since", value: "2024" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: i < 3 ? "1px solid var(--border)" : "none", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ color: "var(--text2)", fontSize: "0.85rem" }}>{s.label}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text)", maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements - Span 12 */}
          <div className="glass-card bento-col-12" style={{ padding: 28 }}>
            <h2 className="section-title" style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 8, fontSize: "1.2rem" }}>
              <Award size={18} style={{ color: "var(--gold)" }} /> achievements & Trophies
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { icon: <Trophy size={22} style={{ color: "var(--gold)" }} />, title: "First Win", desc: "Win your first game", unlocked: (user.wins ?? 0) >= 1 },
                { icon: <Target size={22} style={{ color: "var(--gold-l)" }} />, title: "Sharp Shooter", desc: "Win 10 games", unlocked: (user.wins ?? 0) >= 10 },
                { icon: <Crown size={22} style={{ color: "var(--gold)" }} />, title: "Champion", desc: "Reach 1800+ ELO", unlocked: (user.rating ?? 0) >= 1800 },
                { icon: <Bot size={22} style={{ color: "var(--gold-d)" }} />, title: "Bot Slayer", desc: "Beat AI on Hard mode", unlocked: (user.wins ?? 0) >= 5 },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "16px", alignItems: "center", opacity: a.unlocked ? 1 : 0.45 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    {a.icon}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{a.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text2)", marginTop: 2 }}>{a.desc}</div>
                  </div>
                  {a.unlocked && <span className="badge badge-gold" style={{ marginLeft: "auto", fontFamily: "Orbitron, monospace" }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
