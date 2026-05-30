"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { motion } from "framer-motion";
import { saveGameState, loadGameState, CACHE_KEYS, cacheGet, cacheSet, addRecentGame } from "@/lib/cache";
import PlayerTimer from "./PlayerTimer";
import MoveHistory from "./MoveHistory";
import GameOverModal from "./GameOverModal";
import { Bot, User, Gamepad2, Users, Play, RotateCcw, Undo, Flag, AlertTriangle, Settings } from "lucide-react";
import { playMoveSound, playCaptureSound, playCheckSound, playGameOverSound } from "@/lib/sounds";

type Difficulty = "easy" | "medium" | "hard";
type GameMode = "ai" | "human";
interface Props {
  userName: string;
  userRating: number;
  userAvatar: string;
  initialGameMode?: GameMode;
  initialBotId?: string;
  isCoachMode?: boolean;
  opponentName?: string;
  opponentRating?: number;
  opponentAvatar?: string;
  initialFen?: string;
}

interface ChessBot {
  id: string;
  name: string;
  rating: number;
  difficulty: Difficulty;
  avatar: string;
  description: string;
}

const BOTS: ChessBot[] = [
  { id: "martin", name: "Martin", rating: 250, difficulty: "easy", avatar: "👨‍🏫", description: "Friendly tutor. Easy to beat." },
  { id: "jimmy", name: "Jimmy", rating: 600, difficulty: "easy", avatar: "👦", description: "Enthusiastic beginner chess kid." },
  { id: "nelson", name: "Nelson", rating: 1300, difficulty: "medium", avatar: "⚔️", description: "Aggressive attacker. Loves early Queen moves." },
  { id: "stockfish", name: "Stockfish", rating: 2800, difficulty: "hard", avatar: "🤖", description: "Grandmaster AI. The ultimate challenge." }
];

const THEME_COLORS = {
  classic: { 
    name: "Classic", 
    type: "solid", 
    dark: "#769656", 
    light: "#eeeed2",
    darkStyle: { backgroundColor: "#769656" },
    lightStyle: { backgroundColor: "#eeeed2" },
    darkNotation: { color: "#769656", fontWeight: "700", fontSize: "13px" },
    lightNotation: { color: "#eeeed2", fontWeight: "700", fontSize: "13px" }
  },
  wood: { 
    name: "Wood", 
    type: "solid", 
    dark: "#b58863", 
    light: "#f0d9b5",
    darkStyle: { backgroundColor: "#b58863" },
    lightStyle: { backgroundColor: "#f0d9b5" },
    darkNotation: { color: "#b58863", fontWeight: "700", fontSize: "13px" },
    lightNotation: { color: "#f0d9b5", fontWeight: "700", fontSize: "13px" }
  },
  ocean: { 
    name: "Ocean", 
    type: "solid", 
    dark: "#3b82f6", 
    light: "#eff6ff",
    darkStyle: { backgroundColor: "#3b82f6" },
    lightStyle: { backgroundColor: "#eff6ff" },
    darkNotation: { color: "#3b82f6", fontWeight: "700", fontSize: "13px" },
    lightNotation: { color: "#eff6ff", fontWeight: "700", fontSize: "13px" }
  },
  cyber: { 
    name: "Cyber", 
    type: "solid", 
    dark: "#3f3f46", 
    light: "#e4e4e7",
    darkStyle: { backgroundColor: "#3f3f46" },
    lightStyle: { backgroundColor: "#e4e4e7" },
    darkNotation: { color: "#3f3f46", fontWeight: "700", fontSize: "13px" },
    lightNotation: { color: "#e4e4e7", fontWeight: "700", fontSize: "13px" }
  },
  marble: {
    name: "Gold Marble",
    type: "texture",
    dark: "#1b1a1f",
    light: "#fcf9f2",
    lightStyle: {
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#fcf9f2"/>
          <path d="M-10,40 C50,60 80,20 120,70 S170,120 210,130" fill="none" stroke="#dfb15b" stroke-width="1.5" opacity="0.35"/>
          <path d="M50,-10 C80,30 110,80 90,120 S140,180 160,210" fill="none" stroke="#eed295" stroke-width="1" opacity="0.3"/>
          <path d="M-10,150 C40,160 90,130 130,170 S180,160 210,195" fill="none" stroke="#dfb15b" stroke-width="0.8" opacity="0.2"/>
        </svg>
      `)}")`,
      backgroundSize: "cover"
    },
    darkStyle: {
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#1b1a1f"/>
          <path d="M-10,30 C60,50 90,10 130,80 S160,110 210,140" fill="none" stroke="#dfb15b" stroke-width="1.8" opacity="0.55"/>
          <path d="M30,-10 C70,40 100,70 80,130 S130,170 170,210" fill="none" stroke="#b58838" stroke-width="1.2" opacity="0.45"/>
          <path d="M-10,160 C50,140 80,170 140,150 S170,180 210,180" fill="none" stroke="#eed295" stroke-width="0.8" opacity="0.35"/>
        </svg>
      `)}")`,
      backgroundSize: "cover"
    },
    lightNotation: { color: "#b58838", fontWeight: "800", fontSize: "14px", textShadow: "0px 0px 2px rgba(255,255,255,0.8)" },
    darkNotation: { color: "#dfb15b", fontWeight: "800", fontSize: "14px", textShadow: "0px 0px 2px rgba(0,0,0,0.8)" }
  },
  neonCyber: {
    name: "Cyber Neon",
    type: "texture",
    dark: "#07080c",
    light: "#15171e",
    lightStyle: {
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#15171e"/>
          <rect x="3" y="3" width="94" height="94" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.25"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.15"/>
          <path d="M 0 6 L 0 0 L 6 0 M 94 0 L 100 0 L 100 6 M 0 94 L 0 100 L 6 100 M 94 100 L 100 100 L 100 94" fill="none" stroke="#3b82f6" stroke-width="1" opacity="0.5"/>
        </svg>
      `)}")`,
      backgroundSize: "cover"
    },
    darkStyle: {
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#07080c"/>
          <rect x="3" y="3" width="94" height="94" fill="none" stroke="#ec4899" stroke-width="1" opacity="0.3"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#a855f7" stroke-width="0.5" opacity="0.2"/>
          <path d="M 0 6 L 0 0 L 6 0 M 94 0 L 100 0 L 100 6 M 0 94 L 0 100 L 6 100 M 94 100 L 100 100 L 100 94" fill="none" stroke="#ec4899" stroke-width="1.5" opacity="0.7"/>
        </svg>
      `)}")`,
      backgroundSize: "cover"
    },
    lightNotation: { color: "#3b82f6", fontWeight: "800", fontSize: "14px", textShadow: "0px 0px 4px rgba(59,130,246,0.5)" },
    darkNotation: { color: "#ec4899", fontWeight: "800", fontSize: "14px", textShadow: "0px 0px 4px rgba(236,72,153,0.5)" }
  },
  carbon: {
    name: "Carbon Fiber",
    type: "texture",
    dark: "#22252a",
    light: "#f3f4f6",
    lightStyle: {
      backgroundImage: `
        linear-gradient(45deg, rgba(230,230,230,0.8) 25%, transparent 25%), 
        linear-gradient(-45deg, rgba(230,230,230,0.8) 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, rgba(230,230,230,0.8) 75%), 
        linear-gradient(-45deg, transparent 75%, rgba(230,230,230,0.8) 75%)
      `,
      backgroundColor: "#f3f4f6",
      backgroundSize: "12px 12px"
    },
    darkStyle: {
      backgroundImage: `
        linear-gradient(45deg, #151515 25%, transparent 25%), 
        linear-gradient(-45deg, #151515 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #151515 75%), 
        linear-gradient(-45deg, transparent 75%, #151515 75%)
      `,
      backgroundColor: "#22252a",
      backgroundSize: "12px 12px"
    },
    lightNotation: { color: "#6b7280", fontWeight: "800", fontSize: "13px" },
    darkNotation: { color: "#9ca3af", fontWeight: "800", fontSize: "13px" }
  },
  luxuryWood: {
    name: "Premium Wood",
    type: "texture",
    dark: "#a66a38",
    light: "#ebd2b5",
    lightStyle: {
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#ebd2b5"/>
          <path d="M0 50 Q 50 60 100 45 T 200 55 M0 100 Q 70 80 130 110 T 200 95 M0 150 Q 40 165 90 145 T 200 160" fill="none" stroke="#d2b48c" stroke-width="2.5" opacity="0.6"/>
          <path d="M0 25 Q 60 15 110 35 T 200 20 M0 75 Q 30 90 80 70 T 200 80 M0 125 Q 80 135 140 120 T 200 130 M0 175 Q 50 185 110 170 T 200 180" fill="none" stroke="#dfc5a4" stroke-width="1.5" opacity="0.5"/>
        </svg>
      `)}")`,
      backgroundSize: "cover"
    },
    darkStyle: {
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="#a66a38"/>
          <path d="M0 50 Q 50 60 100 45 T 200 55 M0 100 Q 70 80 130 110 T 200 95 M0 150 Q 40 165 90 145 T 200 160" fill="none" stroke="#7a4821" stroke-width="3" opacity="0.75"/>
          <path d="M0 25 Q 60 15 110 35 T 200 20 M0 75 Q 30 90 80 70 T 200 80 M0 125 Q 80 135 140 120 T 200 130 M0 175 Q 50 185 110 170 T 200 180" fill="none" stroke="#865026" stroke-width="2" opacity="0.6"/>
        </svg>
      `)}")`,
      backgroundSize: "cover"
    },
    lightNotation: { color: "#78411b", fontWeight: "800", fontSize: "14px" },
    darkNotation: { color: "#ebd2b5", fontWeight: "800", fontSize: "14px" }
  }
};

export default function ChessBoardGame({
  userName,
  userRating,
  userAvatar,
  initialGameMode,
  initialBotId,
  isCoachMode = false,
  opponentName,
  opponentRating,
  opponentAvatar,
  initialFen,
}: Props) {
  const START_FEN = initialFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const [fen, setFen] = useState(START_FEN);
  const [moves, setMoves] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>(initialGameMode || "ai");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    (BOTS.find(b => b.id === initialBotId)?.difficulty || "medium") as Difficulty
  );
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverInfo, setGameOverInfo] = useState({ winner: "", reason: "" });
  const [showModal, setShowModal] = useState(false);
  
  // Custom states matching Chess.com options
  const [selectedTimeControl, setSelectedTimeControl] = useState(600); // 10 min default
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [boardTheme, setBoardTheme] = useState<keyof typeof THEME_COLORS>("wood");
  const [selectedBot, setSelectedBot] = useState<ChessBot>(
    BOTS.find(b => b.id === initialBotId) || BOTS[2]
  );
  const [activeTab, setActiveTab] = useState<"play" | "settings">("play");

  const [coachAdvice, setCoachAdvice] = useState<string>("");
  const [bestMoveStr, setBestMoveStr] = useState<string>("");
  const [bestMoveObj, setBestMoveObj] = useState<any>(null);

  useEffect(() => {
    if (!isCoachMode) return;
    const g = chessRef.current;
    
    if (g.isGameOver()) {
      if (g.isCheckmate()) {
        setCoachAdvice("Checkmate! A decisive finish.");
      } else {
        setCoachAdvice("The game ends in a draw.");
      }
      setBestMoveStr("");
      setBestMoveObj(null);
      return;
    }
    
    if (g.inCheck()) {
      setCoachAdvice("You are in check! Look for ways to block, capture, or move your king.");
    } else {
      const score = evaluateBoard(g);
      const evalText = score === 0 ? "The material is completely balanced." : score > 0 ? `White is up +${score} in material.` : `Black is up +${Math.abs(score)} in material.`;
      
      const best = getBestMoveObj(g);
      if (best) {
        setBestMoveStr(best.san);
        setBestMoveObj(best);
        setCoachAdvice(`${evalText} Focus on controlling the center. Best move option is suggested below.`);
      } else {
        setBestMoveStr("");
        setBestMoveObj(null);
        setCoachAdvice(`${evalText} Think carefully about your positional strategy.`);
      }
    }
  }, [fen, isCoachMode]);

  const highlightCoachHint = () => {
    if (!bestMoveObj) return;
    setOptionSq({
      [bestMoveObj.from]: { backgroundColor: "rgba(212, 175, 55, 0.4)" },
      [bestMoveObj.to]: { backgroundColor: "rgba(212, 175, 55, 0.6)" },
    });
    setTimeout(() => {
      setOptionSq({});
    }, 2000);
  };

  const [customLightSquare, setCustomLightSquare] = useState("#f0d9b5");
  const [customDarkSquare, setCustomDarkSquare] = useState("#b58863");
  const [customSelectedSquare, setCustomSelectedSquare] = useState("rgba(229, 193, 88, 0.6)");
  const [customHighlightSquare, setCustomHighlightSquare] = useState("rgba(168, 85, 247, 0.35)");

  useEffect(() => {
    const theme = THEME_COLORS[boardTheme as keyof typeof THEME_COLORS];
    if (theme) {
      setCustomLightSquare(theme.light);
      setCustomDarkSquare(theme.dark);
    }
  }, [boardTheme]);

  // Determine square styles dynamically with consistent keys to avoid React style property conflict warnings
  const activeTheme = THEME_COLORS[boardTheme as keyof typeof THEME_COLORS] || THEME_COLORS.wood;
  
  const currentLightStyle = {
    backgroundColor: activeTheme.type === "texture" ? activeTheme.light : customLightSquare,
    backgroundImage: activeTheme.type === "texture" ? ((activeTheme.lightStyle as any)?.backgroundImage || "none") : "none",
    backgroundSize: activeTheme.type === "texture" ? ((activeTheme.lightStyle as any)?.backgroundSize || "auto") : "auto"
  };
    
  const currentDarkStyle = {
    backgroundColor: activeTheme.type === "texture" ? activeTheme.dark : customDarkSquare,
    backgroundImage: activeTheme.type === "texture" ? ((activeTheme.darkStyle as any)?.backgroundImage || "none") : "none",
    backgroundSize: activeTheme.type === "texture" ? ((activeTheme.darkStyle as any)?.backgroundSize || "auto") : "auto"
  };

  // Helper to calculate contrast for manual selection notation text
  function getContrastColor(hex: string, defaultColor: string) {
    if (!hex || hex.startsWith("rgba") || hex.startsWith("linear") || hex.startsWith("radial")) {
      return defaultColor;
    }
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length !== 6) return defaultColor;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#1f1f24" : "#f7f7f9";
  }

  const currentLightNotationStyle = activeTheme.type === "texture"
    ? activeTheme.lightNotation
    : { color: getContrastColor(customLightSquare, (activeTheme.lightNotation as any)?.color || "#b58838"), fontWeight: "800", fontSize: "13px" };

  const currentDarkNotationStyle = activeTheme.type === "texture"
    ? activeTheme.darkNotation
    : { color: getContrastColor(customDarkSquare, (activeTheme.darkNotation as any)?.color || "#f0d9b5"), fontWeight: "800", fontSize: "13px" };

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [highlightSq, setHighlightSq] = useState<Record<string, any>>({});
  const [optionSq, setOptionSq] = useState<Record<string, any>>({});
  const [selectedSq, setSelectedSq] = useState<string | null>(null);
  const [boardWidth, setBoardWidth] = useState(480);
  const boardRef = useRef<HTMLDivElement>(null);

  // Single source of truth — live Chess instance in a ref to avoid stale closures
  const chessRef = useRef(new Chess());
  const modeRef = useRef<GameMode>("ai");
  const diffRef = useRef<Difficulty>("medium");
  const movesRef = useRef<string[]>([]);
  const gameOverRef = useRef(false);
  const aiThinkingRef = useRef(false);
  const selRef = useRef<string | null>(null);

  // Keep refs in sync with state for read-only consumption in render
  modeRef.current = gameMode;
  diffRef.current = difficulty;
  movesRef.current = moves;
  gameOverRef.current = isGameOver;
  aiThinkingRef.current = isAiThinking;
  selRef.current = selectedSq;

  // Measure board container width using getBoundingClientRect for sub-pixel accuracy
  useEffect(() => {
    function measure() {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const w = Math.floor(rect.width);
        if (w > 10) setBoardWidth(w);
      }
    }
    // Slight delay so layout is settled
    const t = setTimeout(measure, 50);
    const ro = new ResizeObserver(() => setTimeout(measure, 50));
    if (boardRef.current) ro.observe(boardRef.current);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);

  // Load cached game
  useEffect(() => {
    try {
      const m = initialGameMode || (cacheGet(CACHE_KEYS.GAME_MODE, "ai") as GameMode);
      const d = initialBotId 
        ? (BOTS.find(b => b.id === initialBotId)?.difficulty || "medium") as Difficulty
        : (cacheGet(CACHE_KEYS.AI_DIFFICULTY, "medium") as Difficulty);
      setGameMode(m); modeRef.current = m;
      setDifficulty(d); diffRef.current = d;
      const cached = loadGameState();
      if (cached && !cached.isGameOver && cached.fen && cached.fen !== START_FEN) {
        chessRef.current = new Chess(cached.fen);
        setFen(cached.fen);
        setMoves(cached.moveHistory);
        movesRef.current = cached.moveHistory;
      }
    } catch {}
  }, []);

  function computeGameOver(g: Chess, currentMoves: string[], mode: GameMode) {
    if (!g.isGameOver()) return;
    let winner = "draw", reason = "Draw!";
    if (g.isCheckmate()) {
      const loser = g.turn(); // side to move is in checkmate
      if (mode === "ai") {
        winner = loser === "w" ? "AI" : "You";
        reason = loser === "w" ? "AI wins by checkmate!" : "You win by checkmate! Brilliant!";
      } else {
        winner = loser === "w" ? "black" : "white";
        reason = `Checkmate! ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`;
      }
    } else if (g.isStalemate()) { reason = "Stalemate — no legal moves!"; }
    else if (g.isDraw()) { reason = "Draw by insufficient material or 50-move rule."; }
    gameOverRef.current = true;
    setIsGameOver(true);
    setGameOverInfo({ winner, reason });
    setShowModal(true);
    saveGameState({ isGameOver: true, winner, fen: g.fen(), moveHistory: currentMoves });
    addRecentGame({
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      opponent: opponentName || (mode === "ai" ? selectedBot.name : "Local Friend"),
      result: winner === "You" || winner === "white" ? "win" : winner === "draw" ? "draw" : "loss",
      moves: Math.ceil(currentMoves.length / 2),
      duration: "5m",
      opening: "Standard Opening",
    });
  }

  async function makeAiMove(g: Chess, currentMoves: string[], diff: Difficulty, mode: GameMode) {
    const aiSide = playerColor === "white" ? "b" : "w";
    if (g.isGameOver() || g.turn() !== aiSide) return;
    aiThinkingRef.current = true;
    setIsAiThinking(true);
    await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

    const possible = g.moves({ verbose: true });
    if (!possible.length) { setIsAiThinking(false); aiThinkingRef.current = false; return; }

    let pick = possible[Math.floor(Math.random() * possible.length)];
    if (diff !== "easy") {
      const captures = possible.filter(m => m.captured);
      const checks = possible.filter(m => { const t = new Chess(g.fen()); t.move(m); return t.inCheck(); });
      if (checks.length && diff === "hard") pick = checks[Math.floor(Math.random() * checks.length)];
      else if (captures.length) pick = captures[Math.floor(Math.random() * captures.length)];
    }
    const result = g.move(pick);
    if (!result) { setIsAiThinking(false); aiThinkingRef.current = false; return; }

    if (g.isGameOver()) {
      playGameOverSound();
    } else if (g.inCheck()) {
      playCheckSound();
    } else if (result.captured) {
      playCaptureSound();
    } else {
      playMoveSound();
    }

    const nextMoves = [...currentMoves, result.san];
    setFen(g.fen()); setMoves(nextMoves); movesRef.current = nextMoves;
    setHighlightSq({ [result.from]: { backgroundColor: customHighlightSquare }, [result.to]: { backgroundColor: customSelectedSquare } });
    saveGameState({ fen: g.fen(), moveHistory: nextMoves });
    computeGameOver(g, nextMoves, mode);
    aiThinkingRef.current = false;
    setIsAiThinking(false);
  }

  function showOptions(sq: string) {
    const g = chessRef.current;
    const legal = g.moves({ square: sq as any, verbose: true });
    const opts: Record<string, any> = { [sq]: { backgroundColor: customSelectedSquare } };
    legal.forEach(m => {
      opts[m.to] = {
        background: g.get(m.to as any)
          ? "radial-gradient(circle, rgba(239,68,68,0.45) 82%, transparent 82%)"
          : `radial-gradient(circle, ${customHighlightSquare} 28%, transparent 28%)`,
        borderRadius: "50%",
      };
    });
    setOptionSq(opts);
  }

  // The key fix: reads from refs (always fresh), never stale closure state
  function doMove(from: string, to: string): boolean {
    if (gameOverRef.current || aiThinkingRef.current) return false;
    const mode = modeRef.current;
    const g = chessRef.current;
    const playerSide = playerColor;
    const expectedTurn = playerSide === "white" ? "w" : "b";
    if (mode === "ai" && g.turn() !== expectedTurn) return false;
    try {
      const result = g.move({ from, to, promotion: "q" });
      if (!result) return false;

      if (g.isGameOver()) {
        playGameOverSound();
      } else if (g.inCheck()) {
        playCheckSound();
      } else if (result.captured) {
        playCaptureSound();
      } else {
        playMoveSound();
      }
      const nextMoves = [...movesRef.current, result.san];
      movesRef.current = nextMoves;
      setFen(g.fen()); setMoves(nextMoves);
      setHighlightSq({ [from]: { backgroundColor: customHighlightSquare }, [to]: { backgroundColor: customSelectedSquare } });
      setSelectedSq(null); selRef.current = null; setOptionSq({});
      saveGameState({ fen: g.fen(), moveHistory: nextMoves, gameMode: mode, aiDifficulty: diffRef.current });
      computeGameOver(g, nextMoves, mode);
      if (mode === "ai" && !g.isGameOver()) {
        setTimeout(() => makeAiMove(chessRef.current, movesRef.current, diffRef.current, modeRef.current), 150);
      }
      return true;
    } catch { return false; }
  }



  function newGame() {
    chessRef.current = new Chess();
    setFen(START_FEN); setMoves([]); movesRef.current = [];
    setIsGameOver(false); gameOverRef.current = false;
    setShowModal(false); setHighlightSq({}); setOptionSq({});
    setSelectedSq(null); selRef.current = null;
    setIsAiThinking(false); aiThinkingRef.current = false;

    setWhiteTime(selectedTimeControl);
    setBlackTime(selectedTimeControl);

    saveGameState({
      fen: START_FEN,
      moveHistory: [],
      isGameOver: false,
      winner: null,
      whiteTime: selectedTimeControl,
      blackTime: selectedTimeControl
    });

    if (gameMode === "ai" && playerColor === "black") {
      setTimeout(() => {
        makeAiMove(chessRef.current, [], selectedBot.difficulty, "ai");
      }, 400);
    }
  }

  function undoMove() {
    if (!movesRef.current.length) return;
    const g = chessRef.current;
    g.undo();
    if (modeRef.current === "ai") g.undo();
    const hist = g.history();
    setFen(g.fen()); setMoves(hist); movesRef.current = hist;
    setHighlightSq({}); setOptionSq({});
    saveGameState({ fen: g.fen(), moveHistory: hist });
  }

  function handleModeChange(m: GameMode) { setGameMode(m); modeRef.current = m; cacheSet(CACHE_KEYS.GAME_MODE, m); newGame(); }
  function handleDiffChange(d: Difficulty) { setDifficulty(d); diffRef.current = d; cacheSet(CACHE_KEYS.AI_DIFFICULTY, d); }

  const turnSide = chessRef.current.turn();
  const isWhiteTurn = turnSide === "w";

  // Top player timer: opponent
  const topTimerActive = !isGameOver && (
    gameMode === "ai"
      ? (turnSide !== (playerColor === "white" ? "w" : "b"))
      : (turnSide === "b")
  );
  // Bottom player timer: human
  const bottomTimerActive = !isGameOver && (
    gameMode === "ai"
      ? (turnSide === (playerColor === "white" ? "w" : "b"))
      : (turnSide === "w")
  );

  return (
    <div className="play-page">
      {/* Board column */}
      <div className="chess-area">
        {/* Top Player (Opponent) */}
        <PlayerTimer
          color={playerColor === "white" ? "black" : "white"}
          label={opponentName || (gameMode === "ai" ? selectedBot.name : "Opponent")}
          avatar={opponentAvatar ? <span style={{ fontSize: "1.3rem" }}>{opponentAvatar}</span> : (gameMode === "ai" ? <span style={{ fontSize: "1.3rem" }}>{selectedBot.avatar}</span> : <User size={20} />)}
          rating={opponentRating || (gameMode === "ai" ? selectedBot.rating : 1200)}
          initialSeconds={playerColor === "white" ? blackTime : whiteTime}
          isActive={topTimerActive}
          onTimeout={() => {
            setIsGameOver(true);
            setGameOverInfo({ winner: "You", reason: "Opponent ran out of time!" });
            setShowModal(true);
          }}
        />

        <motion.div className="board-wrapper" ref={boardRef}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
          <Chessboard
            key={boardWidth}
            options={{
              id: "main-board",
              position: fen,
              boardOrientation: playerColor,
              squareStyles: { ...highlightSq, ...optionSq },
              animationDurationInMs: 200,
              boardStyle: { borderRadius: "12px", boxShadow: "none", userSelect: "none" },
              darkSquareStyle: currentDarkStyle,
              lightSquareStyle: currentLightStyle,
              darkSquareNotationStyle: currentDarkNotationStyle,
              lightSquareNotationStyle: currentLightNotationStyle,
              allowDragging: !isGameOver && !isAiThinking && !(gameMode === "ai" && chessRef.current.turn() !== (playerColor === "white" ? "w" : "b")),
              onPieceDrop: ({ piece, sourceSquare, targetSquare }) => {
                if (gameOverRef.current || aiThinkingRef.current) return false;
                const expectedTurn = playerColor === "white" ? "w" : "b";
                if (modeRef.current === "ai" && chessRef.current.turn() !== expectedTurn) return false;
                if (!targetSquare) return false;
                const ok = doMove(sourceSquare, targetSquare);
                setSelectedSq(null); selRef.current = null; setOptionSq({});
                return ok;
              },
              onSquareClick: ({ piece, square }) => {
                if (gameOverRef.current || aiThinkingRef.current) return;
                const g = chessRef.current;
                const expectedTurn = playerColor === "white" ? "w" : "b";
                if (modeRef.current === "ai" && g.turn() !== expectedTurn) return;
                const pieceType = g.get(square as any);
                const prev = selRef.current;
                if (prev) {
                  if (prev === square) { setSelectedSq(null); selRef.current = null; setOptionSq({}); return; }
                  const moved = doMove(prev, square);
                  if (!moved) {
                    const aiSide = playerColor === "white" ? "b" : "w";
                    if (pieceType && pieceType.color === g.turn() && !(modeRef.current === "ai" && pieceType.color === aiSide)) {
                      setSelectedSq(square); selRef.current = square; showOptions(square);
                    } else { setSelectedSq(null); selRef.current = null; setOptionSq({}); }
                  }
                } else {
                  const aiSide = playerColor === "white" ? "b" : "w";
                  if (pieceType && pieceType.color === g.turn() && !(modeRef.current === "ai" && pieceType.color === aiSide)) {
                    setSelectedSq(square); selRef.current = square; showOptions(square);
                  }
                }
              }
            }}
          />
        </motion.div>

        {/* Bottom Player (You) */}
        <PlayerTimer
          color={playerColor}
          label={`${userName} (You)`}
          avatar={userAvatar}
          rating={userRating}
          initialSeconds={playerColor === "white" ? whiteTime : blackTime}
          isActive={bottomTimerActive}
          onTimeout={() => {
            setIsGameOver(true);
            setGameOverInfo({ winner: "Opponent", reason: "You ran out of time!" });
            setShowModal(true);
          }}
        />
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Tab Headers */}
        <div style={{ display: "flex", gap: "4px", background: "var(--bg-glass)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border)", marginBottom: 16 }}>
          <button
            onClick={() => setActiveTab("play")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              background: activeTab === "play" ? "var(--primary)" : "transparent",
              color: activeTab === "play" ? "#0a0a0f" : "var(--text2)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: "all 0.2s"
            }}
          >
            <Gamepad2 size={16} /> Play Game
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              background: activeTab === "settings" ? "var(--primary)" : "transparent",
              color: activeTab === "settings" ? "#0a0a0f" : "var(--text2)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
              transition: "all 0.2s"
            }}
          >
            <Settings size={16} /> Settings
          </button>
        </div>

        {activeTab === "play" ? (
          <>
            {isCoachMode && (
              <div className="glass-card sidebar-card" style={{ border: "1px solid var(--border-gold)" }}>
                <p className="sidebar-title" style={{ color: "var(--gold)", display: "flex", alignItems: "center", gap: 6 }}>
                  🧠 Coach Advice
                </p>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: "2rem" }}>👴</span>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, fontSize: "0.82rem", lineHeight: 1.4 }}>
                    {coachAdvice || "Hi! Make a move and I'll analyze it for you in real-time."}
                  </div>
                </div>
                {bestMoveStr && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", background: "rgba(212, 175, 55, 0.05)", padding: "8px 12px", borderRadius: 6 }}>
                    <span style={{ color: "var(--text-muted)" }}>Recommended:</span>
                    <span style={{ fontWeight: 700, color: "var(--gold)", marginRight: 8 }}>{bestMoveStr}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={highlightCoachHint}
                      style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                    >
                      Show Hint
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Play Mode Selection */}
            <div className="glass-card sidebar-card">
              <p className="sidebar-title">Game Mode</p>
              <div className="mode-btns">
                <button className={`mode-btn${gameMode === "ai" ? " active" : ""}`} onClick={() => handleModeChange("ai")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Bot size={16} /> vs AI
                </button>
                <button className={`mode-btn${gameMode === "human" ? " active" : ""}`} onClick={() => handleModeChange("human")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Users size={16} /> 2 Player
                </button>
              </div>
            </div>

            {/* Time Controls */}
            <div className="glass-card sidebar-card">
              <p className="sidebar-title">Time Control</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {[
                  { label: "1 min", val: 60 },
                  { label: "3 min", val: 180 },
                  { label: "5 min", val: 300 },
                  { label: "10 min", val: 600 },
                  { label: "30 min", val: 1800 }
                ].map(t => (
                  <button
                    key={t.val}
                    className={`diff-btn ${selectedTimeControl === t.val ? "active" : ""}`}
                    onClick={() => { setSelectedTimeControl(t.val); setWhiteTime(t.val); setBlackTime(t.val); }}
                    style={{ fontSize: "0.8rem", padding: "8px" }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Bot Selection */}
            {gameMode === "ai" && (
              <div className="glass-card sidebar-card">
                <p className="sidebar-title">Select Bot</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {BOTS.map(b => (
                    <button
                      key={b.id}
                      onClick={() => { setSelectedBot(b); handleDiffChange(b.difficulty); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: selectedBot.id === b.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: selectedBot.id === b.id ? "var(--ok-bg)" : "var(--bg-glass)",
                        textAlign: "left",
                        cursor: "pointer",
                        color: "var(--text)",
                        width: "100%"
                      }}
                    >
                      <span style={{ fontSize: "1.4rem" }}>{b.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", display: "flex", justifyContent: "space-between" }}>
                          <span>{b.name}</span>
                          <span style={{ color: "var(--text2)" }}>{b.rating} ELO</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text2)" }}>{b.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Choose Side */}
            <div className="glass-card sidebar-card">
              <p className="sidebar-title">Play As</p>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { color: "white", label: "White", symbol: "♔" },
                  { color: "black", label: "Black", symbol: "♚" }
                ].map(c => (
                  <button
                    key={c.color}
                    className={`mode-btn ${playerColor === c.color ? "active" : ""}`}
                    onClick={() => setPlayerColor(c.color as any)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{c.symbol}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="glass-card sidebar-card">
              <p className="sidebar-title">Controls</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button className="btn btn-gold" onClick={newGame} style={{ padding: "10px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <RotateCcw size={14} /> New Game
                </button>
                <button className="btn btn-ghost" onClick={undoMove} disabled={!moves.length || isGameOver} style={{ padding: "10px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <Undo size={14} /> Undo
                </button>
              </div>
              <button className="btn btn-danger btn-sm" disabled={isGameOver} style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}
                onClick={() => { setIsGameOver(true); gameOverRef.current = true; setGameOverInfo({ winner: "draw", reason: "Resigned." }); setShowModal(true); }}>
                <Flag size={14} /> Resign Game
              </button>
            </div>

            <div className="glass-card sidebar-card">
              <p className="sidebar-title">Move History</p>
              <MoveHistory moves={moves} />
            </div>
          </>
        ) : (
          <>
            {/* Settings Tab */}
            <div className="glass-card sidebar-card">
              <p className="sidebar-title">Board Theme</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {Object.keys(THEME_COLORS).map((themeKey) => {
                  const colors = THEME_COLORS[themeKey as keyof typeof THEME_COLORS];
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setBoardTheme(themeKey as any)}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: boardTheme === themeKey ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: "var(--bg-glass)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <div style={{ 
                        display: "flex", 
                        width: "40px", 
                        height: "40px", 
                        borderRadius: "4px", 
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.08)"
                      }}>
                        <div style={{ 
                          flex: 1, 
                          ...(colors.type === "texture" ? colors.lightStyle : { backgroundColor: colors.light })
                        }} />
                        <div style={{ 
                          flex: 1, 
                          ...(colors.type === "texture" ? colors.darkStyle : { backgroundColor: colors.dark })
                        }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", textTransform: "capitalize", color: "var(--text)" }}>{colors.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Tile Colors */}
            <div className="glass-card sidebar-card">
              <p className="sidebar-title">Custom Tile Colors</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text2)", marginBottom: 4 }}>Light Square</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="color"
                      value={customLightSquare}
                      onChange={(e) => setCustomLightSquare(e.target.value)}
                      className="color-picker-input"
                    />
                    <span style={{ fontSize: "0.72rem", fontFamily: "monospace" }}>{customLightSquare.toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text2)", marginBottom: 4 }}>Dark Square</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="color"
                      value={customDarkSquare}
                      onChange={(e) => setCustomDarkSquare(e.target.value)}
                      className="color-picker-input"
                    />
                    <span style={{ fontSize: "0.72rem", fontFamily: "monospace" }}>{customDarkSquare.toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text2)", marginBottom: 4 }}>Highlight Path</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="color"
                      value={customHighlightSquare}
                      onChange={(e) => setCustomHighlightSquare(e.target.value)}
                      className="color-picker-input"
                    />
                    <span style={{ fontSize: "0.72rem", fontFamily: "monospace" }}>{customHighlightSquare.slice(0, 7).toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text2)", marginBottom: 4 }}>Selected Square</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="color"
                      value={customSelectedSquare}
                      onChange={(e) => setCustomSelectedSquare(e.target.value)}
                      className="color-picker-input"
                    />
                    <span style={{ fontSize: "0.72rem", fontFamily: "monospace" }}>{customSelectedSquare.slice(0, 7).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card sidebar-card">
              <p className="sidebar-title">Status Information</p>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                {isGameOver ? <span className="badge badge-red">Game Over</span>
                  : chessRef.current.inCheck() ? <span className="badge badge-red" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><AlertTriangle size={12} /> Check!</span>
                  : <span className={`badge ${chessRef.current.turn() === "w" ? "badge-gold" : "badge-purple"}`}>{chessRef.current.turn() === "w" ? "White" : "Black"}'s Turn</span>}
                <span className="badge badge-gold" style={{ fontFamily: "Orbitron,monospace", fontSize: ".68rem" }}>
                  Move {Math.ceil(moves.length / 2)}
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text2)" }}>
                Time limit is set to {selectedTimeControl / 60} minutes. Playing as {playerColor}.
              </p>
            </div>
          </>
        )}
      </div>

      <GameOverModal isOpen={showModal} winner={gameOverInfo.winner} reason={gameOverInfo.reason}
        onNewGame={() => { setShowModal(false); newGame(); }} onClose={() => setShowModal(false)} />
    </div>
  );
}

function evaluateBoard(g: Chess): number {
  let score = 0;
  const board = g.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        let val = 0;
        if (piece.type === "p") val = 1;
        else if (piece.type === "n") val = 3;
        else if (piece.type === "b") val = 3;
        else if (piece.type === "r") val = 5;
        else if (piece.type === "q") val = 9;
        else if (piece.type === "k") val = 100;
        
        if (piece.color === "w") {
          score += val;
        } else {
          score -= val;
        }
      }
    }
  }
  return score;
}

function getBestMoveObj(g: Chess) {
  const moves = g.moves({ verbose: true });
  if (moves.length === 0) return null;
  
  let bestMove = moves[0];
  let bestVal = g.turn() === "w" ? -1000 : 1000;
  
  for (const m of moves) {
    const temp = new Chess(g.fen());
    temp.move(m);
    const val = evaluateBoard(temp);
    if (g.turn() === "w") {
      if (val > bestVal) {
        bestVal = val;
        bestMove = m;
      }
    } else {
      if (val < bestVal) {
        bestVal = val;
        bestMove = m;
      }
    }
  }
  return bestMove;
}
