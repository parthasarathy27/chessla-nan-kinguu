"use client";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

interface PlayerTimerProps {
  initialSeconds: number;
  isActive: boolean;
  onTimeout?: () => void;
  color: "white" | "black";
  label: string;
  avatar: React.ReactNode;
  rating: number;
}

export default function PlayerTimer({
  initialSeconds, isActive, onTimeout, color, label, avatar, rating,
}: PlayerTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { onTimeout?.(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, onTimeout]);

  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const isLow = seconds < 30 && seconds > 0;

  return (
    <div className={`player-info${isActive ? " active" : ""}`}>
      <div className="player-avatar">
        {avatar}
      </div>
      <div>
        <div className="player-name">{label}</div>
        <div className="player-rating" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Star size={12} style={{ color: "var(--gold)" }} /> {rating} ELO
        </div>
      </div>
      <div className={`player-timer${isLow ? " low" : ""}`}>
        {mins}:{secs}
      </div>
    </div>
  );
}
