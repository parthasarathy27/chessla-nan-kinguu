"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { Trophy, Users, ShieldAlert, Award, Calendar, ChevronRight, Zap } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  type: string;
  timeControl: string;
  playersJoined: number;
  maxPlayers: number;
  startsIn: string;
  status: "active" | "upcoming" | "registered";
  prize: string;
}

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: "t1",
    name: "Obsidian Blitz Championship",
    type: "Single Elimination",
    timeControl: "3+2 Blitz",
    playersJoined: 124,
    maxPlayers: 256,
    startsIn: "Starts in 8 mins",
    status: "active",
    prize: "2,500 Gold",
  },
  {
    id: "t2",
    name: "Bullet Frenzy Arena",
    type: "Arena",
    timeControl: "1+0 Bullet",
    playersJoined: 89,
    maxPlayers: 128,
    startsIn: "Starts in 24 mins",
    status: "upcoming",
    prize: "1,200 Gold",
  },
  {
    id: "t3",
    name: "Grandmaster Classical Open",
    type: "Swiss System",
    timeControl: "10+5 Rapid",
    playersJoined: 42,
    maxPlayers: 64,
    startsIn: "Starts in 2h 15m",
    status: "upcoming",
    prize: "5,000 Gold",
  },
];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [activeTab, setActiveTab] = useState<"live" | "upcoming">("live");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(INITIAL_TOURNAMENTS[0]);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleJoin = (id: string) => {
    setJoiningId(id);
    setTimeout(() => {
      setTournaments((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "registered" as const, playersJoined: t.playersJoined + 1 } : t))
      );
      if (selectedTournament?.id === id) {
        setSelectedTournament((prev) =>
          prev ? { ...prev, status: "registered" as const, playersJoined: prev.playersJoined + 1 } : null
        );
      }
      setJoiningId(null);
    }, 1200);
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (activeTab === "live") return t.status === "active" || t.status === "registered";
    return t.status === "upcoming";
  });

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 16px" }}>
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Trophy size={28} style={{ color: "var(--gold)" }} />
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0 }}>Tournaments</h1>
        </div>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Compete in elite chess brackets and build your rating in real-time.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
        {/* Left Side: Tournament Lists */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "var(--bg-glass)", border: "1px solid var(--border)", padding: 4, borderRadius: 10, gap: 4 }}>
            <button
              onClick={() => setActiveTab("live")}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: 8,
                background: activeTab === "live" ? "rgba(212,175,55,0.12)" : "transparent",
                color: activeTab === "live" ? "var(--gold)" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.88rem",
                transition: "all 0.2s",
              }}
            >
              Live & Registered
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: 8,
                background: activeTab === "upcoming" ? "rgba(212,175,55,0.12)" : "transparent",
                color: activeTab === "upcoming" ? "var(--gold)" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.88rem",
                transition: "all 0.2s",
              }}
            >
              Upcoming Arenas
            </button>
          </div>

          {/* Cards list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredTournaments.length === 0 ? (
              <div className="glass-card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                No tournaments found in this section.
              </div>
            ) : (
              filteredTournaments.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTournament(t)}
                  className="glass-card"
                  style={{
                    padding: 16,
                    cursor: "pointer",
                    border: selectedTournament?.id === t.id ? "1px solid var(--border-gold)" : "1px solid var(--border)",
                    background: selectedTournament?.id === t.id ? "rgba(212,175,55,0.04)" : "var(--bg-glass)",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-start" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>{t.name}</h3>
                    {t.status === "registered" && (
                      <span className="badge badge-gold" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                        Registered
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Zap size={13} style={{ color: "var(--gold)" }} /> {t.timeControl}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={13} /> {t.playersJoined} / {t.maxPlayers}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--gold)" }}>
                      <Award size={13} /> {t.prize}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Details & Bracket Visualizer */}
        <AnimatePresence mode="wait">
          {selectedTournament && (
            <motion.div
              key={selectedTournament.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card"
              style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div>
                <span className="badge badge-gold" style={{ fontSize: "0.75rem", marginBottom: 8 }}>
                  {selectedTournament.type}
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 700, margin: "0 0 6px 0" }}>{selectedTournament.name}</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                  {selectedTournament.startsIn} • Prize: {selectedTournament.prize}
                </p>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Format</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{selectedTournament.timeControl}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Registered</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{selectedTournament.playersJoined} Players</div>
                </div>
              </div>

              {/* Action Button */}
              {selectedTournament.status === "registered" ? (
                <button
                  disabled
                  className="btn btn-ghost"
                  style={{ width: "100%", justifyContent: "center", cursor: "not-allowed", border: "1px solid rgba(212,175,55,0.3)", color: "var(--gold)" }}
                >
                  Registered & Ready • Game starts soon
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(selectedTournament.id)}
                  disabled={joiningId !== null}
                  className="btn btn-gold btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {joiningId ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Registering...
                    </span>
                  ) : (
                    "Register for Tournament"
                  )}
                </button>
              )}

              {/* Tournament Bracket Section */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--gold)" }}>
                  Live Bracket Simulation
                </h3>

                {/* Bracket Rendering */}
                <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 8 }}>
                  {/* Quarterfinals */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: 12, minWidth: 120 }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center" }}>Quarterfinals</div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: 6, borderRadius: 6, fontSize: "0.78rem" }}>
                      <div style={{ color: "var(--gold)", fontWeight: 600 }}>1. Grand Master (W)</div>
                      <div style={{ color: "var(--text-muted)" }}>8. tactical_rook</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: 6, borderRadius: 6, fontSize: "0.78rem" }}>
                      <div>4. bishop_slayer</div>
                      <div style={{ color: "var(--gold)", fontWeight: 600 }}>5. knightrider (W)</div>
                    </div>
                  </div>

                  {/* Semifinals */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: 12, minWidth: 120 }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center" }}>Semifinals</div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", padding: 6, borderRadius: 6, fontSize: "0.78rem" }}>
                      <div style={{ color: "var(--text-muted)" }}>1. Grand Master</div>
                      <div style={{ color: "var(--gold)", fontWeight: 600 }}>5. knightrider (W)</div>
                    </div>
                  </div>

                  {/* Finals */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, minWidth: 120 }}>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center" }}>Finals Match</div>
                    <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid var(--border-gold)", padding: 8, borderRadius: 6, fontSize: "0.78rem", textAlign: "center" }}>
                      <div style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>Grand Final</div>
                      <div style={{ fontWeight: 600 }}>5. knightrider</div>
                      <div style={{ color: "var(--text-muted)", margin: "2px 0" }}>vs</div>
                      <div style={{ color: "var(--gold)", fontWeight: 600 }}>
                        {selectedTournament.status === "registered" ? "You (Pending)" : "TBD"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
