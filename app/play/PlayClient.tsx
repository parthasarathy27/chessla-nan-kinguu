"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
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

interface PlayHubCardProps {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  badgeText: string;
  accentColor: string; // Hex color for the theme accents
  title: string;
  description: string;
  actionText: string;
}

function HubCard({
  href,
  onClick,
  icon,
  badgeText,
  accentColor,
  title,
  description,
  actionText
}: PlayHubCardProps) {
  const cardContent = (
    <motion.div
      whileHover={{ 
        y: -6, 
        borderColor: accentColor, 
        boxShadow: `0 16px 36px -12px ${accentColor}40`,
        backgroundColor: "rgba(255, 255, 255, 0.03)"
      }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      style={{
        padding: 24,
        background: "rgba(255, 255, 255, 0.015)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 20,
        cursor: "pointer",
        transition: "border-color 0.25s, background-color 0.25s"
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 12, 
            background: `${accentColor}15`, 
            border: `1px solid ${accentColor}35`, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: `inset 0 0 12px ${accentColor}10`
          }}>
            {icon}
          </div>
          <span style={{ 
            fontSize: "0.72rem", 
            fontWeight: 800, 
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "4px 10px", 
            borderRadius: "9999px", 
            background: `${accentColor}18`, 
            color: accentColor,
            border: `1px solid ${accentColor}25`
          }}>
            {badgeText}
          </span>
        </div>
        <h3 style={{ 
          fontSize: "1.3rem", 
          fontWeight: 800, 
          margin: "0 0 8px 0", 
          color: "#ffffff",
          letterSpacing: "-0.01em"
        }}>
          {title}
        </h3>
        <p style={{ 
          fontSize: "0.88rem", 
          color: "rgba(255, 255, 255, 0.6)", 
          margin: 0, 
          lineHeight: 1.5 
        }}>
          {description}
        </p>
      </div>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 6, 
        fontSize: "0.88rem", 
        fontWeight: 700, 
        color: accentColor
      }}>
        <span>{actionText}</span>
        <ArrowRight size={15} />
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", height: "100%", display: "block" }}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div onClick={onClick} style={{ height: "100%" }}>
      {cardContent}
    </div>
  );
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
        <HubCard
          href="/play/online"
          icon={<Globe size={22} style={{ color: "#dfb15b" }} />}
          badgeText="Live Arena"
          accentColor="#dfb15b"
          title="Play Online"
          description="Challenge active chess players worldwide. Auto-matchmaking pairs you with opponents of similar ELO."
          actionText="Match Me Now"
        />

        {/* Play Bots Card */}
        <HubCard
          href="/play/bots"
          icon={<Bot size={22} style={{ color: "#c084fc" }} />}
          badgeText="VS Computer"
          accentColor="#c084fc"
          title="Play Bots"
          description="Challenge customizable computer engines. Play against personalities from friendly tutors to Grandmaster AI."
          actionText="Choose Bot Opponent"
        />

        {/* Play Coach Card */}
        <HubCard
          href="/play/coach"
          icon={<Sparkles size={22} style={{ color: "#2dd4bf" }} />}
          badgeText="Tutor Mode"
          accentColor="#2dd4bf"
          title="Play Coach"
          description="Play a training match with real-time feedback. The coach provides line evaluations and suggests the best moves."
          actionText="Start Tutored Match"
        />

        {/* Tournaments Card */}
        <HubCard
          href="/tournaments"
          icon={<Trophy size={22} style={{ color: "#fb923c" }} />}
          badgeText="Championship"
          accentColor="#fb923c"
          title="Tournaments"
          description="Enter live brackets, track tournament status, register for upcoming events, and check the bracket leaderboard."
          actionText="View Active Tournaments"
        />

        {/* Variants Card */}
        <HubCard
          href="/variants"
          icon={<Shuffle size={22} style={{ color: "#38bdf8" }} />}
          badgeText="Fun Modes"
          accentColor="#38bdf8"
          title="Chess Variants"
          description="Play asymmetric configurations. Try Fischer Random (Chess960), Horde Chess (36 pawns), or King of the Hill."
          actionText="Select Custom Variant"
        />

        {/* Quick Local Custom Game */}
        <HubCard
          onClick={() => setShowQuickBoard(true)}
          icon={<Gamepad2 size={22} style={{ color: "#e2e8f0" }} />}
          badgeText="Local Play"
          accentColor="#e2e8f0"
          title="Quick Play"
          description="Launch directly into the standard board interface. Instantly customize player color, board theme, and time controls."
          actionText="Open Standard Board"
        />

      </div>
    </motion.div>
  );
}
