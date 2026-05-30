"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { Shuffle, Shield, ShieldAlert, Award, Play } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const ChessBoardGame = dynamic(() => import("@/components/ChessBoard"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: "var(--text-muted)" }}>Loading variant setup...</p>
    </div>
  ),
});

const VARIANT_LIST = [
  {
    id: "chess960",
    name: "Chess960 (Fischer Random)",
    desc: "The starting position of the pieces is randomized on the first rank, eliminating memorized opening theory.",
    fen: "rnqbbknr/pppppppp/8/8/8/8/PPPPPPPP/RNQBBKNR w KQkq - 0 1",
    icon: "🔀",
    objective: "Checkmate the enemy king. All standard rules apply, but the opening rank is randomized.",
  },
  {
    id: "horde",
    name: "Horde Chess",
    desc: "An asymmetric battle where White starts with an army of 36 pawns instead of normal pieces!",
    fen: "rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w kq - 0 1",
    icon: "🛡️",
    objective: "White wins by checkmating Black. Black wins by capturing all of White's pawns and pieces.",
  },
  {
    id: "kingofhill",
    name: "King of the Hill",
    desc: "A standard chess setup, but with an alternative way to win: bring your King to one of the center squares.",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    icon: "🏔️",
    objective: "Standard checkmate OR move your King to one of the central squares (d4, d5, e4, e5) to win instantly.",
  },
];

export default function VariantsPage() {
  const { data: session, status } = useSession();
  const [selectedVariant, setSelectedVariant] = useState<typeof VARIANT_LIST[0] | null>(null);

  if (status === "loading") return null;
  if (!session) redirect("/login");

  const user = session.user as any;

  if (selectedVariant) {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setSelectedVariant(null)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            ← Choose Another Variant
          </button>
          <span className="badge badge-gold" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Active: {selectedVariant.name}
          </span>
        </div>
        <Header />
        
        {/* Objective banner */}
        <div className="glass-card" style={{ padding: 14, marginBottom: 20, border: "1px solid var(--border-gold)", background: "rgba(212, 175, 55, 0.03)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--gold)", marginBottom: 4 }}>Variant Objective:</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text2)", lineHeight: 1.4 }}>{selectedVariant.objective}</div>
        </div>

        <ChessBoardGame
          userName={user.name || "Player"}
          userRating={user.rating || 1200}
          userAvatar={user.avatar || "P"}
          initialGameMode="ai"
          initialFen={selectedVariant.fen}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
      <Header />
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Shuffle size={28} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0 }}>Chess Variants</h1>
        </div>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Break away from tradition and test your tactics in custom setups and asymmetric game modes.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {VARIANT_LIST.map((v) => (
          <div 
            key={v.id} 
            className="glass-card" 
            style={{ 
              padding: 24, 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              gap: 16,
              border: "1px solid var(--border)"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: "3rem" }}>{v.icon}</span>
                <span className="badge badge-gold" style={{ fontSize: "0.7rem" }}>Variant</span>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--text)" }}>{v.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45 }}>
                {v.desc}
              </p>
            </div>

            <button 
              className="btn btn-gold" 
              style={{ width: "100%", justifyContent: "center", gap: 8 }}
              onClick={() => setSelectedVariant(v)}
            >
              <Play size={14} fill="currentColor" /> Launch Match
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
