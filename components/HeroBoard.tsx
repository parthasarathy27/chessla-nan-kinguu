"use client";
import { Chessboard } from "react-chessboard";

interface HeroBoardProps {
  fen: string;
}

export default function HeroBoard({ fen }: HeroBoardProps) {
  return (
    <Chessboard
      options={{
        id: "hero-board",
        position: fen,
        boardStyle: { borderRadius: "12px", boxShadow: "none", userSelect: "none" },
        darkSquareStyle: { backgroundColor: "#769656" },
        lightSquareStyle: { backgroundColor: "#eeeed2" },
        allowDragging: false,
      }}
    />
  );
}
