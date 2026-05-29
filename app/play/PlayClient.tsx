"use client";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Header from "@/components/Header";

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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}
    >
      <Header />
      <ChessBoardGame
        userName={userName}
        userRating={userRating}
        userAvatar={userAvatar}
      />
    </motion.div>
  );
}
