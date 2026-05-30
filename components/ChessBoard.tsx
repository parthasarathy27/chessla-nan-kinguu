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
  classic: { dark: "#769656", light: "#eeeed2" },
  wood: { dark: "#b58863", light: "#f0d9b5" },
  ocean: { dark: "#3b82f6", light: "#eff6ff" },
  cyber: { dark: "#3f3f46", light: "#e4e4e7" }
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
    const colors = THEME_COLORS[boardTheme];
    setCustomLightSquare(colors.light);
    setCustomDarkSquare(colors.dark);
  }, [boardTheme]);

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
              darkSquareStyle: { backgroundColor: customDarkSquare },
              lightSquareStyle: { backgroundColor: customLightSquare },
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
                      <div style={{ display: "flex", width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ flex: 1, backgroundColor: colors.light }} />
                        <div style={{ flex: 1, backgroundColor: colors.dark }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", textTransform: "capitalize", color: "var(--text)" }}>{themeKey}</span>
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
