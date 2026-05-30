"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { Bot, Play } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const ChessBoardGame = dynamic(() => import("@/components/ChessBoard"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: "var(--text-muted)" }}>Loading chess engine...</p>
    </div>
  ),
});

const BOT_LIST = [
  { id: "martin", name: "Martin", rating: 250, difficulty: "easy" as const, avatar: "👨‍🏫", description: "Friendly tutor. Easy to beat and helpful for practicing basic rules." },
  { id: "jimmy", name: "Jimmy", rating: 600, difficulty: "easy" as const, avatar: "👦", description: "Enthusiastic beginner chess kid. Watch out for simple tactical jokes!" },
  { id: "nelson", name: "Nelson", rating: 1300, difficulty: "medium" as const, avatar: "⚔️", description: "Aggressive tactical attacker. Loves early Queen attacks. Punish his openings." },
  { id: "stockfish", name: "Stockfish", rating: 2800, difficulty: "hard" as const, avatar: "🤖", description: "Grandmaster AI. The ultimate challenge. Plays near-perfect tactical lines." }
];

export default function PlayBotsPage() {
  const { data: session, status } = useSession();
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  if (status === "loading") return null;
  if (!session) redirect("/login");

  const user = session.user as any;

  if (selectedBotId) {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ marginBottom: 12 }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setSelectedBotId(null)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            ← Choose Another Bot
          </button>
        </div>
        <Header />
        <ChessBoardGame
          userName={user.name || "Player"}
          userRating={user.rating || 1200}
          userAvatar={user.avatar || "P"}
          initialGameMode="ai"
          initialBotId={selectedBotId}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
      <Header />
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Bot size={28} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0 }}>Play Against Bots</h1>
        </div>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Challenge one of our chess personas. Pick an opponent that matches your current skill level.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {BOT_LIST.map((bot) => (
          <div 
            key={bot.id} 
            className="glass-card" 
            style={{ 
              padding: 20, 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              gap: 16,
              border: "1px solid var(--border)"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: "2.8rem" }}>{bot.avatar}</span>
                <span className="badge badge-gold" style={{ fontFamily: "Orbitron, monospace", fontSize: "0.72rem" }}>
                  {bot.rating} ELO
                </span>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 4px 0" }}>{bot.name}</h3>
              <span className={`badge ${bot.difficulty === "easy" ? "badge-success" : bot.difficulty === "medium" ? "badge-purple" : "badge-red"}`} style={{ textTransform: "capitalize", fontSize: "0.68rem", marginBottom: 12, display: "inline-block" }}>
                {bot.difficulty}
              </span>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                {bot.description}
              </p>
            </div>

            <button 
              className="btn btn-gold" 
              style={{ width: "100%", justifyContent: "center", gap: 8 }}
              onClick={() => setSelectedBotId(bot.id)}
            >
              <Play size={14} fill="currentColor" /> Play Bot
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
