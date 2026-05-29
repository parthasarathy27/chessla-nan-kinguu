"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Handshake, Skull, RotateCcw } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  winner: string | null;
  reason: string;
  onNewGame: () => void;
  onClose: () => void;
}

export default function GameOverModal({ isOpen, winner, reason, onNewGame, onClose }: GameOverModalProps) {
  const isDraw = winner === "draw";
  const isWin = winner === "white" || winner === "You";
  const icon = isDraw ? (
    <Handshake size={56} style={{ color: "var(--gold)" }} />
  ) : isWin ? (
    <Trophy size={56} style={{ color: "var(--gold)" }} />
  ) : (
    <Skull size={56} style={{ color: "var(--err)" }} />
  );
  const title = isDraw ? "Draw!" : isWin ? "Victory!" : "Defeated!";
  const titleColor = isDraw ? "var(--gold)" : isWin ? "var(--ok)" : "var(--err)";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card modal-card"
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="modal-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            >
              {icon}
            </motion.div>
            <h2 className="modal-title" style={{ color: titleColor }}>{title}</h2>
            <p className="modal-subtitle">{reason}</p>

            <div className="modal-actions">
              <button className="btn btn-gold btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }} onClick={onNewGame}>
                <RotateCcw size={18} /> New Game
              </button>
              <button className="btn btn-ghost" onClick={onClose}>
                Review Board
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
