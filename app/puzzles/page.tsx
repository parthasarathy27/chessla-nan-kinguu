"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Trophy, ArrowRight, RotateCcw, Award, Lightbulb, CheckCircle, AlertTriangle, Play } from "lucide-react";
import { playMoveSound, playCaptureSound, playCheckSound, playGameOverSound } from "@/lib/sounds";
import Header from "@/components/Header";

const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false, loading: () => <div style={{ width: "100%", aspectRatio: 1, backgroundColor: "var(--bg-glass)" }} /> }
);

interface ChessPuzzle {
  id: string;
  name: string;
  description: string;
  fen: string;
  solution: { from: string; to: string };
  turn: "white" | "black";
}

const PUZZLES: ChessPuzzle[] = [
  {
    id: "back-rank",
    name: "Back Rank Mate",
    description: "White to move. The opponent's king is trapped on the back rank behind its own pawns. Deliver mate!",
    fen: "6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    solution: { from: "d1", to: "d8" },
    turn: "white"
  },
  {
    id: "smothered-mate",
    name: "Smothered Mate",
    description: "White to move. Deliver checkmate by jumping over blockaded defenders.",
    fen: "k7/P7/1N6/8/8/8/8/6K1 w - - 0 1",
    solution: { from: "b6", to: "c7" },
    turn: "white"
  },
  {
    id: "fork",
    name: "Double Attack Fork",
    description: "White to move. Find a way to attack the King and the Rook simultaneously to win material!",
    fen: "r3k3/8/8/3N4/8/8/8/6K1 w - - 0 1",
    solution: { from: "d5", to: "c7" },
    turn: "white"
  }
];

export default function PuzzlesPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fen, setFen] = useState(PUZZLES[0].fen);
  const [status, setStatus] = useState<"idle" | "solved" | "failed">("idle");
  const [score, setScore] = useState(0);
  const [boardWidth, setBoardWidth] = useState(480);

  const activePuzzle = PUZZLES[activeIndex];

  // Set the FEN correctly whenever index changes
  useEffect(() => {
    setFen(activePuzzle.fen);
    setStatus("idle");
  }, [activeIndex]);

  const handlePieceDrop = ({ sourceSquare, targetSquare }: any) => {
    if (status === "solved") return false;

    if (sourceSquare === activePuzzle.solution.from && targetSquare === activePuzzle.solution.to) {
      setStatus("solved");
      setScore(prev => prev + 1);
      playGameOverSound();
      setFen("8/8/8/8/8/8/8/8"); // blank temporarily or force pos update
      setTimeout(() => {
        // Build the final position by shifting pieces (simplified display)
        if (activePuzzle.id === "back-rank") setFen("3R2k1/5ppp/8/8/8/8/8/6K1 w - - 0 1");
        else if (activePuzzle.id === "smothered-mate") setFen("k1N5/P7/8/8/8/8/8/6K1 w - - 0 1");
        else if (activePuzzle.id === "fork") setFen("r3k3/2N5/8/8/8/8/8/6K1 w - - 0 1");
      }, 50);
      return true;
    } else {
      setStatus("failed");
      playCheckSound();
      return false;
    }
  };

  const resetPuzzle = () => {
    setStatus("idle");
    setFen(activePuzzle.fen);
  };

  const nextPuzzle = () => {
    const nextIdx = (activeIndex + 1) % PUZZLES.length;
    setActiveIndex(nextIdx);
  };

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
      <Header />
      <div className="play-page" style={{ padding: 0, margin: 0, minHeight: "auto", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* Board column */}
        <div className="chess-area">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)" }}>Chess Puzzles</h2>
            <div className="badge badge-gold" style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Orbitron,monospace" }}>
              <Award size={14} /> Solved: {score}/{PUZZLES.length}
            </div>
          </div>

          <motion.div
            className="board-wrapper"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            style={{ border: "6px solid #312e2b", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
          >
            <Chessboard
              options={{
                id: "puzzle-board",
                position: fen,
                boardOrientation: activePuzzle.turn,
                animationDurationInMs: 250,
                boardStyle: { borderRadius: 0, boxShadow: "none", userSelect: "none" },
                darkSquareStyle: { backgroundColor: "#769656" },
                lightSquareStyle: { backgroundColor: "#eeeed2" },
                allowDragging: status !== "solved",
                onPieceDrop: handlePieceDrop
              }}
            />
          </motion.div>
        </div>

        {/* Sidebar Details */}
        <div className="sidebar" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card sidebar-card" style={{ padding: 20 }}>
            <span className="badge badge-purple" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Lightbulb size={12} /> Tactical Puzzle
            </span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>{activePuzzle.name}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text2)", lineHeight: 1.5 }}>{activePuzzle.description}</p>
          </div>

          {/* Status notification banner */}
          <AnimatePresence mode="wait">
            {status === "solved" && (
              <motion.div
                key="solved"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card"
                style={{ padding: 16, backgroundColor: "rgba(129,182,76,0.12)", border: "1px solid var(--primary)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}
              >
                <CheckCircle size={24} style={{ color: "var(--primary)" }} />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.9rem" }}>Correct Move!</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text2)" }}>Excellent tactics, that is correct!</div>
                </div>
              </motion.div>
            )}

            {status === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card"
                style={{ padding: 16, backgroundColor: "rgba(239,68,68,0.12)", border: "1px solid var(--border-red)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}
              >
                <AlertTriangle size={24} style={{ color: "#ef4444" }} />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.9rem" }}>Incorrect Move</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text2)" }}>Try finding another path to victory.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass-card sidebar-card" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
            {status === "solved" ? (
              <button className="btn btn-gold" onClick={nextPuzzle} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", width: "100%" }}>
                Next Puzzle <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={resetPuzzle} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", width: "100%", border: "1px solid var(--border)" }}>
                <RotateCcw size={16} /> Reset Position
              </button>
            )}

            <Link href="/play" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", width: "100%", textDecoration: "none" }}>
              <Play size={16} fill="currentColor" /> Back to Play
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
