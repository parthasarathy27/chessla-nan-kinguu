"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, Sparkles, Database, Trophy, Swords, Smartphone, Gamepad2, Play } from "lucide-react";
import { Chess } from "chess.js";
import dynamic from "next/dynamic";

const HeroBoard = dynamic(
  () => import("@/components/HeroBoard"),
  { ssr: false, loading: () => <div style={{ width: "100%", aspectRatio: 1, backgroundColor: "var(--bg-glass)" }} /> }
);

const BotIcon = () => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", marginBottom: "14px" }}>
    <motion.div
      style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(212,175,55,0.08)", opacity: 0 }}
      variants={{
        hover: { scale: 1.4, opacity: 1 }
      }}
      transition={{ duration: 0.4 }}
    />
    <motion.div
      variants={{
        hover: {
          y: [0, -6, 2, -3, 0],
          transition: { duration: 0.8, ease: "easeInOut" }
        }
      }}
    >
      <Bot size={28} style={{ color: "var(--gold)" }} />
    </motion.div>
  </div>
);

const SparklesIcon = () => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", marginBottom: "14px" }}>
    <motion.div
      style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(212,175,55,0.08)", opacity: 0 }}
      variants={{
        hover: { scale: 1.4, opacity: 1 }
      }}
      transition={{ duration: 0.4 }}
    />
    <motion.div
      variants={{
        hover: {
          rotate: 180,
          scale: 1.25,
          transition: { duration: 0.6, ease: "backOut" }
        }
      }}
    >
      <Sparkles size={28} style={{ color: "var(--gold)" }} />
    </motion.div>
  </div>
);

const DatabaseIcon = () => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", marginBottom: "14px" }}>
    <motion.div
      style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(212,175,55,0.08)", opacity: 0 }}
      variants={{
        hover: { scale: 1.4, opacity: 1 }
      }}
      transition={{ duration: 0.4 }}
    />
    <motion.div
      variants={{
        hover: {
          y: [0, -5, 0],
          scaleY: [1, 0.8, 1.1, 1],
          transition: { duration: 0.6, times: [0, 0.2, 0.5, 1] }
        }
      }}
    >
      <Database size={28} style={{ color: "var(--gold)" }} />
    </motion.div>
  </div>
);

const TrophyIcon = () => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", marginBottom: "14px" }}>
    <motion.div
      style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(212,175,55,0.08)", opacity: 0 }}
      variants={{
        hover: { scale: 1.4, opacity: 1 }
      }}
      transition={{ duration: 0.4 }}
    />
    <motion.div
      variants={{
        hover: {
          scale: 1.25,
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.6 }
        }
      }}
    >
      <Trophy size={28} style={{ color: "var(--gold)" }} />
    </motion.div>
  </div>
);

const SwordsIcon = () => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", marginBottom: "14px" }}>
    <motion.div
      style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(212,175,55,0.08)", opacity: 0 }}
      variants={{
        hover: { scale: 1.4, opacity: 1 }
      }}
      transition={{ duration: 0.4 }}
    />
    <motion.div
      variants={{
        hover: {
          scale: 1.2,
          rotate: [0, -15, 15, 0],
          transition: { duration: 0.6 }
        }
      }}
    >
      <Swords size={28} style={{ color: "var(--gold)" }} />
    </motion.div>
  </div>
);

const SmartphoneIcon = () => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", marginBottom: "14px" }}>
    <motion.div
      style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(212,175,55,0.08)", opacity: 0 }}
      variants={{
        hover: { scale: 1.4, opacity: 1 }
      }}
      transition={{ duration: 0.4 }}
    />
    <motion.div
      variants={{
        hover: {
          rotate: [0, 90, 90, 0],
          transition: { duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }
        }
      }}
    >
      <Smartphone size={28} style={{ color: "var(--gold)" }} />
    </motion.div>
  </div>
);

function renderFeatureIcon(iconName: string) {
  switch (iconName) {
    case "bot":
      return <BotIcon />;
    case "sparkles":
      return <SparklesIcon />;
    case "database":
      return <DatabaseIcon />;
    case "trophy":
      return <TrophyIcon />;
    case "swords":
      return <SwordsIcon />;
    case "smartphone":
      return <SmartphoneIcon />;
    default:
      return null;
  }
}

const INITIAL_POSITION = [
  ["♜","♞","♝","♛","♚","♝","♞","♜"],
  ["♟","♟","♟","♟","♟","♟","♟","♟"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["♙","♙","♙","♙","♙","♙","♙","♙"],
  ["♖","♘","♗","♕","♔","♗","♘","♖"],
];

const FEATURES = [
  { icon: "bot", title: "AI Opponents", desc: "Challenge Stockfish-powered AI at three difficulty levels — Rookie, Strategic, and Grandmaster." },
  { icon: "sparkles", title: "Smooth Animations", desc: "Silky-smooth piece movements and dynamic visual effects powered by Framer Motion." },
  { icon: "database", title: "Auto-Save", desc: "Your game is automatically cached. Resume exactly where you left off after any interruption." },
  { icon: "trophy", title: "Stats & Leaderboard", desc: "Track your ELO rating, win rate, and compete on the global leaderboard." },
  { icon: "swords", title: "2-Player Mode", desc: "Play against a friend on the same device with full chess rules and timers." },
  { icon: "smartphone", title: "Fully Responsive", desc: "Optimized for every screen — mobile, tablet, laptop, and desktop." },
];

function ParticlesBg() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="particles-bg" />;
  }

  const COUNT = 30;
  return (
    <div className="particles-bg">
      {Array.from({ length: COUNT }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [game, setGame] = useState<Chess | null>(null);
  const [gameFen, setGameFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  const [onlinePlayers, setOnlinePlayers] = useState(132845);
  const [gamesToday, setGamesToday] = useState(12845391);

  // Initialize Chess safely client-side
  useEffect(() => {
    setGame(new Chess());
  }, []);

  // Fluctuating stats
  useEffect(() => {
    const t = setInterval(() => {
      setOnlinePlayers(prev => prev + Math.floor(Math.random() * 20) - 10);
      setGamesToday(prev => prev + Math.floor(Math.random() * 4));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Auto-play chess moves
  useEffect(() => {
    if (!game) return;
    const interval = setInterval(() => {
      const nextGame = new Chess(game.fen());
      if (nextGame.isGameOver()) {
        nextGame.reset();
      } else {
        const moves = nextGame.moves();
        if (moves.length > 0) {
          const move = moves[Math.floor(Math.random() * moves.length)];
          nextGame.move(move);
        } else {
          nextGame.reset();
        }
      }
      game.load(nextGame.fen()); // mutate in place
      setGameFen(nextGame.fen());
    }, 1600);
    return () => clearInterval(interval);
  }, [game]);

  return (
    <>
      <ParticlesBg />

      {/* Hero Grid */}
      <section className="hero">
        <div className="hero-grid">
          {/* Left: Auto playing board */}
          <motion.div
            className="hero-left"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-board-wrapper">
              <HeroBoard fen={gameFen} />
            </div>
          </motion.div>

          {/* Right: Call to Actions */}
          <motion.div
            className="hero-right"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="hero-title">
              Play Chess <br /><span className="gold-text">Online</span><br />on the #1 Site!
            </h1>
            
            <p className="hero-subtitle">
              Challenge bots, play with players worldwide, track stats, and master the royal game.
            </p>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-val">{onlinePlayers.toLocaleString("en-US")}</div>
                <div className="hero-stat-lbl">Online Players</div>
              </div>
              <div>
                <div className="hero-stat-val">{gamesToday.toLocaleString("en-US")}</div>
                <div className="hero-stat-lbl">Games Today</div>
              </div>
            </div>

            <div className="hero-cta">
              <Link href="/login" className="btn btn-gold btn-lg">
                <Play size={20} fill="currentColor" /> Play Online
              </Link>
              <Link href="/login?redirect=/play" className="btn btn-ghost btn-lg">
                <Bot size={20} /> Play Computer
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section>
        <motion.div
          className="features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="glass-card feature-card"
              whileHover="hover"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              {renderFeatureIcon(f.icon)}
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
