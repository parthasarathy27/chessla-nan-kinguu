"use client";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";

const ChessBoardGame = dynamic(() => import("@/components/ChessBoard"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
      <p style={{ color: "var(--text-muted)" }}>Hiring your Grandmaster coach...</p>
    </div>
  ),
});

export default function PlayCoachPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session) redirect("/login");

  const user = session.user as any;

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 20 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Sparkles size={28} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0 }}>Play vs Coach</h1>
        </div>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Play a practice game with real-time feedback, hints, and board evaluations from a Grandmaster tutor.
        </p>
      </motion.div>

      <ChessBoardGame
        userName={user.name || "Player"}
        userRating={user.rating || 1200}
        userAvatar={user.avatar || "P"}
        initialGameMode="ai"
        isCoachMode={true}
      />
    </div>
  );
}
