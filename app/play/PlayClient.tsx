"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Globe, Bot, Sparkles, Trophy, Shuffle, Gamepad2, ArrowRight } from "lucide-react";
import Link from "next/link";

const ChessBoardGame = dynamic(() => import("@/components/ChessBoard"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: "var(--text-muted)" }}>Loading chess engine...</p>
    </div>
  ),
});

interface Props {
  userName: string;
  userRating: number;
  userAvatar: string;
}

export default function PlayClient({ userName, userRating, userAvatar }: Props) {
  const [showQuickBoard, setShowQuickBoard] = useState(false);

  if (showQuickBoard) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}
      >
        <div style={{ marginBottom: 12 }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setShowQuickBoard(false)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            ← Back to Play Hub
          </button>
        </div>
        <Header />
        <ChessBoardGame
          userName={userName}
          userRating={userRating}
          userAvatar={userAvatar}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}
    >
      <Header />

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 8px 0" }}>Play Chess</h1>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Select a game mode below to start playing. Challenge AI, play online, or join brackets.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        
        {/* Play Online Card */}
        <Link href="/play/online" style={{ textDecoration: "none" }}>
          <div className="glass-card play-hub-card" style={{ padding: 24, border: "1px solid var(--border)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(229,193,88,0.08)", border: "1px solid var(--border-gold)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                  <Globe size={24} style={{ color: "var(--gold)" }} />
                </div>
                <span className="badge badge-gold">Live Arena</span>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text)" }}>Play Online</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
                Challenge active chess players worldwide. Auto-matchmaking pairs you with opponents of similar ELO.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "var(--gold)" }}>
              Match Me Now <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Play Bots Card */}
        <Link href="/play/bots" style={{ textDecoration: "none" }}>
          <div className="glass-card play-hub-card" style={{ padding: 24, border: "1px solid var(--border)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                  <Bot size={24} style={{ color: "rgb(168, 85, 247)" }} />
                </div>
                <span className="badge badge-purple">VS Computer</span>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text)" }}>Play Bots</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
                Challenge customizable computer engines. Play against personalities from friendly tutors to Grandmaster AI.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "rgb(168, 85, 247)" }}>
              Choose Bot Opponent <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Play Coach Card */}
        <Link href="/play/coach" style={{ textDecoration: "none" }}>
          <div className="glass-card play-hub-card" style={{ padding: 24, border: "1px solid var(--border)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(212,175,55,0.08)", border: "1px solid var(--border-gold)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                  <Sparkles size={24} style={{ color: "var(--gold)" }} />
                </div>
                <span className="badge badge-gold">Tutor Mode</span>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text)" }}>Play Coach</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
                Play a training match with real-time feedback. The coach provides line evaluations and suggests the best moves.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "var(--gold)" }}>
              Start Tutored Match <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Tournaments Card */}
        <Link href="/tournaments" style={{ textDecoration: "none" }}>
          <div className="glass-card play-hub-card" style={{ padding: 24, border: "1px solid var(--border)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                  <Trophy size={24} style={{ color: "rgb(59, 130, 246)" }} />
                </div>
                <span className="badge badge-success">Arena Bracket</span>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text)" }}>Tournaments</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
                Enter live brackets, track tournament status, register for upcoming events, and check the bracket leaderboard.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "rgb(59, 130, 246)" }}>
              View Active Tournaments <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Variants Card */}
        <Link href="/variants" style={{ textDecoration: "none" }}>
          <div className="glass-card play-hub-card" style={{ padding: 24, border: "1px solid var(--border)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                  <Shuffle size={24} style={{ color: "rgb(34, 197, 94)" }} />
                </div>
                <span className="badge badge-success">Fun Modes</span>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text)" }}>Chess Variants</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
                Play asymmetric configurations. Try Fischer Random (Chess960), Horde Chess (36 pawns), or King of the Hill.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "rgb(34, 197, 94)" }}>
              Select Custom Variant <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Quick Local Custom Game */}
        <div 
          onClick={() => setShowQuickBoard(true)} 
          className="glass-card play-hub-card" 
          style={{ padding: 24, border: "1px solid var(--border)", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                <Gamepad2 size={24} style={{ color: "var(--text-muted)" }} />
              </div>
              <span className="badge badge-ghost">Standard Board</span>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text)" }}>Quick Play</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
              Launch directly into the standard board interface. Instantly customize player color, board theme, and time controls.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, color: "var(--text2)" }}>
            Open Standard Board <ArrowRight size={14} />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
