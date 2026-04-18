import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const holes = Array.from({ length: 18 }, (_, i) => i + 1);

const STATUS_CONFIG = {
  Ready: { color: "#1D9E75", bg: "#E1F5EE", label: "Ready" },
  "Addressing Ball": { color: "#BA7517", bg: "#FAEEDA", label: "Addressing" },
  Hit: { color: "#185FA5", bg: "#E6F1FB", label: "Hit" },
  Searching: { color: "#A32D2D", bg: "#FCEBEB", label: "Searching" },
};

const PLAYER_COLORS = ["#1D9E75", "#185FA5", "#993556", "#BA7517"];
const PLAYER_BG = ["#E1F5EE", "#E6F1FB", "#FBEAF0", "#FAEEDA"];

function Avatar({ name, color, bg, size = 40 }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        border: `2px solid ${color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontWeight: 700,
        fontSize: size * 0.35,
        color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Pill({ children, color, bg }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

export default function GolfSpotterApp() {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState([
    { id: 1, name: "Golfer 1", order: 1 },
    { id: 2, name: "Golfer 2", order: 2 },
    { id: 3, name: "Golfer 3", order: 3 },
    { id: 4, name: "Golfer 4", order: 4 },
  ]);
  const [hole, setHole] = useState(1);
  const [currentPlayerId, setCurrentPlayerId] = useState(1);
  const [shotNumber, setShotNumber] = useState(1);
  const [status, setStatus] = useState("Ready");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("round"); // "round" | "log" | "settings"
  const [saved, setSaved] = useState(false);

  const activePlayers = useMemo(
    () => players.slice(0, playerCount).sort((a, b) => a.order - b.order),
    [players, playerCount]
  );

  const currentPlayer = useMemo(
    () => activePlayers.find((p) => p.id === currentPlayerId) ?? activePlayers[0],
    [activePlayers, currentPlayerId]
  );

  const playerColor = (id) => PLAYER_COLORS[(id - 1) % PLAYER_COLORS.length];
  const playerBg = (id) => PLAYER_BG[(id - 1) % PLAYER_BG.length];

  const saveShot = () => {
    if (!currentPlayer) return;
    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        hole,
        player: currentPlayer,
        shotNumber,
        status,
        note,
      },
      ...prev,
    ]);
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const nextHitter = () => {
    const idx = activePlayers.findIndex((p) => p.id === currentPlayer.id);
    setCurrentPlayerId(activePlayers[(idx + 1) % activePlayers.length].id);
  };

  const updatePlayerName = (id, value) =>
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: value } : p)));

  const movePlayer = (id, dir) => {
    const visible = [...activePlayers];
    const idx = visible.findIndex((p) => p.id === id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= visible.length) return;
    const a = visible[idx], b = visible[swapIdx];
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === a.id) return { ...p, order: b.order };
        if (p.id === b.id) return { ...p, order: a.order };
        return p;
      })
    );
  };

  const holeEntries = entries.filter((e) => e.hole === hole);
  const sc = STATUS_CONFIG[status];

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { outline: none; background: var(--color-background-primary); color: var(--color-text-primary); border: 0.5px solid var(--color-border-secondary); border-radius: 8px; font-family: inherit; font-size: 14px; }
        input:focus, textarea:focus { border-color: #1D9E75; box-shadow: 0 0 0 3px #E1F5EE; }
        button { cursor: pointer; font-family: inherit; border: none; background: none; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0F6E56", padding: "20px 16px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>On the Course</p>
            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: "#fff", lineHeight: 1.1, marginTop: 2 }}>Golf Spotter</h1>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setHole(Math.max(1, hole - 1))} style={{ color: "#fff", fontSize: 18, lineHeight: 1 }}>‹</button>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Hole</p>
                <p style={{ fontSize: 22, fontWeight: 600, color: "#fff", lineHeight: 1 }}>{hole}</p>
              </div>
              <button onClick={() => setHole(Math.min(18, hole + 1))} style={{ color: "#fff", fontSize: 18, lineHeight: 1 }}>›</button>
            </div>
          </div>
        </div>

        {/* Now Hitting Banner */}
        {currentPlayer && (
          <div style={{ marginTop: 14, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={currentPlayer.name} color="#fff" bg="rgba(255,255,255,0.25)" size={36} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Now Hitting</p>
              <p style={{ fontWeight: 600, color: "#fff", fontSize: 16 }}>{currentPlayer.name}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Shot</p>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: 22, lineHeight: 1 }}>#{shotNumber}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        {[["round", "Round"], ["log", `Log (${entries.length})`], ["settings", "Setup"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 500,
              color: tab === key ? "#0F6E56" : "var(--color-text-secondary)",
              borderBottom: tab === key ? "2px solid #0F6E56" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        {/* ROUND TAB */}
        {tab === "round" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Hitting Order */}
            <div style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Hitting Order</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {activePlayers.map((player, idx) => {
                  const isCurrent = player.id === currentPlayerId;
                  return (
                    <motion.div
                      key={player.id}
                      layout
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        background: isCurrent ? "#F0FBF7" : "transparent",
                        borderLeft: isCurrent ? "3px solid #1D9E75" : "3px solid transparent",
                        borderBottom: idx < activePlayers.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onClick={() => setCurrentPlayerId(player.id)}
                    >
                      <Avatar name={player.name} color={playerColor(player.id)} bg={playerBg(player.id)} size={36} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? "#0F6E56" : "var(--color-text-primary)" }}>{player.name}</p>
                        <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{idx === 0 ? "Hits first" : idx === 1 ? "Hits second" : idx === 2 ? "Hits third" : "Hits fourth"}</p>
                      </div>
                      {isCurrent && (
                        <Pill color="#0F6E56" bg="#E1F5EE">Hitting</Pill>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button onClick={(e) => { e.stopPropagation(); movePlayer(player.id, "up"); }} style={{ fontSize: 14, color: "var(--color-text-secondary)", padding: "2px 4px" }}>↑</button>
                        <button onClick={(e) => { e.stopPropagation(); movePlayer(player.id, "down"); }} style={{ fontSize: 14, color: "var(--color-text-secondary)", padding: "2px 4px" }}>↓</button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Shot Controls */}
            <div style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Shot Details</p>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Shot #</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-background-secondary)", borderRadius: 10, padding: "6px 10px" }}>
                    <button onClick={() => setShotNumber(Math.max(1, shotNumber - 1))} style={{ fontSize: 20, color: "#1D9E75", fontWeight: 600, width: 28 }}>−</button>
                    <span style={{ flex: 1, textAlign: "center", fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)" }}>{shotNumber}</span>
                    <button onClick={() => setShotNumber(shotNumber + 1)} style={{ fontSize: 20, color: "#1D9E75", fontWeight: 600, width: 28 }}>+</button>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>Status</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setStatus(key)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 10,
                        border: status === key ? `2px solid ${cfg.color}` : "1px solid var(--color-border-tertiary)",
                        background: status === key ? cfg.bg : "var(--color-background-primary)",
                        color: status === key ? cfg.color : "var(--color-text-secondary)",
                        fontWeight: status === key ? 600 : 400,
                        fontSize: 13,
                        transition: "all 0.15s",
                      }}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Note</p>
                <textarea
                  rows={2}
                  placeholder="e.g. pushed right into rough..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", resize: "none", lineHeight: 1.5 }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={saveShot}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: 12,
                    background: saved ? "#1D9E75" : "#0F6E56",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    transition: "background 0.2s",
                  }}
                >
                  {saved ? "✓ Saved!" : "Save Shot"}
                </button>
                <button
                  onClick={nextHitter}
                  style={{
                    padding: "13px 18px",
                    borderRadius: 12,
                    border: "1px solid var(--color-border-secondary)",
                    background: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Next →
                </button>
              </div>
            </div>

            {/* This hole quick log */}
            {holeEntries.length > 0 && (
              <div style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Hole {hole} Log</p>
                  <Pill color="#0F6E56" bg="#E1F5EE">{holeEntries.length} shots</Pill>
                </div>
                {holeEntries.slice(0, 3).map((entry, idx) => {
                  const sc = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Ready;
                  return (
                    <div key={entry.id} style={{ padding: "10px 16px", borderBottom: idx < Math.min(holeEntries.length, 3) - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar name={entry.player.name} color={playerColor(entry.player.id)} bg={playerBg(entry.player.id)} size={30} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{entry.player.name}</p>
                          <Pill color={sc.color} bg={sc.bg}>#{entry.shotNumber}</Pill>
                        </div>
                        {entry.note && <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{entry.note}</p>}
                      </div>
                      <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{entry.timestamp}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LOG TAB */}
        {tab === "log" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-secondary)" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>⛳</p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>No shots logged yet</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Go to Round and save a shot to start tracking.</p>
              </div>
            ) : (
              entries.map((entry) => {
                const sc = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Ready;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: "var(--color-background-primary)", borderRadius: 14, border: "0.5px solid var(--color-border-tertiary)", padding: "12px 16px" }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar name={entry.player.name} color={playerColor(entry.player.id)} bg={playerBg(entry.player.id)} size={34} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          <p style={{ fontSize: 14, fontWeight: 600 }}>{entry.player.name}</p>
                          <Pill color={sc.color} bg={sc.bg}>{entry.status}</Pill>
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                          <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Hole {entry.hole}</p>
                          <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Shot #{entry.shotNumber}</p>
                          <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{entry.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    {entry.note && (
                      <p style={{ marginTop: 8, paddingTop: 8, borderTop: "0.5px solid var(--color-border-tertiary)", fontSize: 13, color: "var(--color-text-primary)" }}>{entry.note}</p>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Number of Golfers</p>
              </div>
              <div style={{ display: "flex", padding: 16, gap: 10 }}>
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setPlayerCount(n); if (currentPlayerId > n) setCurrentPlayerId(1); }}
                    style={{
                      flex: 1,
                      padding: "12px 0",
                      borderRadius: 10,
                      border: playerCount === n ? "2px solid #1D9E75" : "1px solid var(--color-border-tertiary)",
                      background: playerCount === n ? "#E1F5EE" : "var(--color-background-primary)",
                      color: playerCount === n ? "#0F6E56" : "var(--color-text-primary)",
                      fontWeight: playerCount === n ? 600 : 400,
                      fontSize: 18,
                      transition: "all 0.15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Player Names</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {players.slice(0, playerCount).map((p, idx) => (
                  <div key={p.id} style={{ padding: "10px 16px", borderBottom: idx < playerCount - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", display: "flex", gap: 10, alignItems: "center" }}>
                    <Avatar name={p.name} color={playerColor(p.id)} bg={playerBg(p.id)} size={32} />
                    <input
                      value={p.name}
                      onChange={(e) => updatePlayerName(p.id, e.target.value)}
                      style={{ flex: 1, padding: "8px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8 }}
                      placeholder={`Golfer ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setHole(1);
                setCurrentPlayerId(1);
                setShotNumber(1);
                setStatus("Ready");
                setNote("");
                setEntries([]);
                setTab("round");
              }}
              style={{
                padding: "14px",
                borderRadius: 12,
                border: "1px solid #E24B4A",
                background: "transparent",
                color: "#A32D2D",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Reset Round
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
