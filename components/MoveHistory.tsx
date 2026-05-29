"use client";

interface MoveHistoryProps {
  moves: string[];
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const pairs: [string, string?][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <div className="move-history">
      {pairs.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", textAlign: "center", padding: "12px 0" }}>
          No moves yet. Make your first move!
        </p>
      ) : (
        pairs.map(([white, black], i) => (
          <div className="move-row" key={i}>
            <span className="move-num">{i + 1}.</span>
            <span className="move-san white">{white}</span>
            <span className="move-san black">{black ?? ""}</span>
          </div>
        ))
      )}
    </div>
  );
}
