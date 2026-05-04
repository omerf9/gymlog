import { useState, useEffect } from "react";

const PROGRAM = {
  "Day 1": {
    label: "Push",
    emoji: "🔴",
    subtitle: "Chest, Shoulders, Triceps",
    color: "#ff4444",
    sections: [
      {
        title: "🧱 Compound Strength",
        exercises: [
          { name: "Incline Bench Press", target: "4× 6–10" },
          { name: "Flat Bench Press", target: "4× 6–10" },
        ],
      },
      {
        title: "🧬 Calisthenics",
        exercises: [
          { name: "Incline Push-Ups", target: "3× 12–20" },
          { name: "Dips", target: "3× 8–15" },
        ],
      },
      {
        title: "💪 Shoulders",
        exercises: [
          { name: "Dumbbell Shoulder Press", target: "3× 8–12" },
          { name: "Lateral Raises", target: "3× 12–15" },
        ],
      },
      {
        title: "🔥 Triceps",
        exercises: [
          { name: "Cable Pushdowns", target: "3× 10–15" },
          { name: "Overhead Triceps Extension", target: "3× 10–12" },
        ],
      },
    ],
  },
  "Day 2": {
    label: "Pull",
    emoji: "🔵",
    subtitle: "Back, Biceps",
    color: "#4488ff",
    sections: [
      {
        title: "🧱 Compound Strength",
        exercises: [
          { name: "Pull-Ups", target: "4× 6–10" },
          { name: "Barbell Rows", target: "4× 8–12" },
        ],
      },
      {
        title: "🧬 Calisthenics",
        exercises: [
          { name: "Chin-Ups", target: "3× 8–12" },
          { name: "Inverted Rows", target: "3× 10–15" },
        ],
      },
      {
        title: "🧠 Back Detail",
        exercises: [
          { name: "Lat Pulldown", target: "3× 10–12" },
          { name: "Single-Arm Dumbbell Row", target: "3× 10–12" },
        ],
      },
      {
        title: "💪 Biceps",
        exercises: [
          { name: "Barbell Curl", target: "3× 8–12" },
          { name: "Hammer Curl", target: "3× 10–12" },
        ],
      },
    ],
  },
  "Day 3": {
    label: "Legs",
    emoji: "🟢",
    subtitle: "Power + Athletic",
    color: "#44cc66",
    sections: [
      {
        title: "🧱 Compound Strength",
        exercises: [
          { name: "Squats", target: "4× 5–8" },
          { name: "Romanian Deadlifts", target: "4× 8–10" },
        ],
      },
      {
        title: "🧬 Calisthenics",
        exercises: [
          { name: "Jump Squats", target: "3× 10–15" },
          { name: "Walking Lunges", target: "3× 12 each leg" },
        ],
      },
      {
        title: "🦵 Isolation",
        exercises: [
          { name: "Leg Extensions", target: "3× 12–15" },
          { name: "Hamstring Curls", target: "3× 12–15" },
          { name: "Calf Raises", target: "4× 15–20" },
        ],
      },
    ],
  },
  "Day 4": {
    label: "Shoulders & Arms",
    emoji: "🟡",
    subtitle: "Shoulders, Traps & Arms",
    color: "#ffcc00",
    sections: [
      {
        title: "🧱 Shoulders",
        exercises: [
          { name: "Smith Machine Shoulder Press", target: "4× 8–12" },
          { name: "Arnold Press", target: "3× 10–12" },
          { name: "Lateral Raises (strict)", target: "3× 12–15" },
        ],
      },
      {
        title: "🧬 Calisthenics",
        exercises: [
          { name: "Pike Push-Ups", target: "3× 10–15" },
          { name: "Handstand Holds (wall-assisted)", target: "3 rounds" },
        ],
      },
      {
        title: "🪨 Traps",
        exercises: [
          { name: "Dumbbell Shrugs", target: "4× 12–15" },
          { name: "Upright Rows (EZ bar)", target: "3× 10–12" },
        ],
      },
      {
        title: "💪 Arms Finisher",
        exercises: [
          { name: "Cable Curls", target: "3× 12" },
          { name: "Triceps Dips", target: "3× 12" },
        ],
      },
    ],
  },
  "Day 5": {
    label: "Accessory",
    emoji: "⚫",
    subtitle: "Core, Weak Points, Athleticism",
    color: "#888888",
    sections: [
      {
        title: "🧠 Core Focus",
        exercises: [
          { name: "Hanging Leg Raises", target: "3× 10–15" },
          { name: "Ab Rollouts", target: "3× 8–12" },
          { name: "Plank", target: "3× 45–60 sec" },
        ],
      },
      {
        title: "🧬 Calisthenics Flow",
        exercises: [
          { name: "Push-Ups (varied)", target: "3 sets" },
          { name: "Pull-Ups (light)", target: "3 sets" },
          { name: "Bodyweight Squats", target: "3 sets" },
        ],
      },
      {
        title: "🛠️ Weak Points",
        exercises: [
          { name: "Rear Delt Flys", target: "3× 12–15" },
          { name: "Rotator Cuff Work (bands)", target: "3× 15" },
          { name: "Forearms / Grip Training", target: "3 sets" },
        ],
      },
    ],
  },
  "Day 6": {
    label: "Active Rest",
    emoji: "🧘‍♂️",
    subtitle: "Swim, Sauna, Steam",
    color: "#aa88ff",
    sections: [],
    isRest: true,
  },
  "Day 7": {
    label: "Full Rest",
    emoji: "💤",
    subtitle: "Recovery",
    color: "#444444",
    sections: [],
    isRest: true,
  },
};

const makeDefaultSets = (target) => {
  const match = target.match(/^(\d+)[x×]/);
  const count = match ? parseInt(match[1]) : 3;
  return Array.from({ length: count }, () => ({ reps: "", weight: "" }));
};

const makeDefaultLog = () =>
  Object.fromEntries(
    Object.entries(PROGRAM).map(([dayKey, day]) => [
      dayKey,
      {
        steps: "",
        exercises: day.sections.flatMap((sec) =>
          sec.exercises.map((ex) => ({
            name: ex.name,
            target: ex.target,
            sets: makeDefaultSets(ex.target),
          }))
        ),
      },
    ])
  );

function getStored() {
  try {
    const d = localStorage.getItem("gymLog_v2");
    return d ? JSON.parse(d) : makeDefaultLog();
  } catch {
    return makeDefaultLog();
  }
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("gymHistory_v2") || "[]");
  } catch {
    return [];
  }
}

function WeekSummary({ log, onClose, onReset }) {
  const totalSteps = Object.values(log).reduce((a, d) => a + Number(d.steps || 0), 0);
  let totalSets = 0, totalReps = 0;
  const exerciseSummary = [];

  Object.values(log).forEach((d) => {
    d.exercises.forEach((ex) => {
      let exSets = 0, exReps = 0, maxWeight = 0;
      ex.sets.forEach((s) => {
        if (s.reps) { exSets++; exReps += Number(s.reps); }
        if (Number(s.weight) > maxWeight) maxWeight = Number(s.weight);
      });
      totalSets += exSets;
      totalReps += exReps;
      if (exSets > 0) exerciseSummary.push({ name: ex.name, sets: exSets, reps: exReps, weight: maxWeight });
    });
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: "16px"
    }}>
      <div style={{
        background: "#0a0a0a", border: "1px solid #222", borderRadius: "20px",
        maxWidth: "460px", width: "100%", maxHeight: "88vh", overflowY: "auto",
        padding: "28px 22px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <div style={{ color: "#444", fontSize: "9px", letterSpacing: "3px" }}>YOUR</div>
            <h2 style={{ color: "#e8ff47", fontFamily: "'Bebas Neue', sans-serif", fontSize: "30px", letterSpacing: "2px", margin: 0 }}>
              WEEKLY RECAP
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: "20px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "TOTAL SETS", value: totalSets },
            { label: "TOTAL REPS", value: totalReps.toLocaleString() },
            { label: "TOTAL STEPS", value: totalSteps.toLocaleString() },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#111", borderRadius: "12px", padding: "14px 8px",
              textAlign: "center", border: "1px solid #1e1e1e"
            }}>
              <div style={{ color: "#e8ff47", fontSize: "24px", fontFamily: "'Bebas Neue', sans-serif" }}>{s.value}</div>
              <div style={{ color: "#444", fontSize: "8px", letterSpacing: "1px", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {exerciseSummary.length > 0 && (
          <>
            <div style={{ color: "#444", fontSize: "9px", letterSpacing: "2px", marginBottom: "10px" }}>
              💪 PUSH THESE NEXT WEEK
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
              {exerciseSummary.map((ex, i) => (
                <div key={i} style={{
                  background: "#111", borderRadius: "10px", padding: "11px 14px",
                  border: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <div style={{ color: "#ddd", fontSize: "12px", fontWeight: "600" }}>{ex.name}</div>
                    <div style={{ color: "#444", fontSize: "10px", marginTop: "2px" }}>
                      {ex.sets} sets · {ex.reps} reps{ex.weight > 0 ? ` · top ${ex.weight}kg` : ""}
                    </div>
                  </div>
                  <div style={{
                    background: "#1a2200", color: "#e8ff47", fontSize: "9px",
                    padding: "4px 8px", borderRadius: "6px", whiteSpace: "nowrap"
                  }}>
                    +{ex.weight > 0 ? "2.5kg" : "1–2 reps"}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px", background: "#111", border: "1px solid #1e1e1e",
            borderRadius: "10px", color: "#666", cursor: "pointer", fontSize: "13px"
          }}>Close</button>
          <button onClick={onReset} style={{
            flex: 1, padding: "13px", background: "#e8ff47", border: "none",
            borderRadius: "10px", color: "#000", cursor: "pointer", fontSize: "13px", fontWeight: "700"
          }}>Start New Week →</button>
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, onChange }) {
  const updateSet = (i, s) => onChange({ ...exercise, sets: exercise.sets.map((ss, idx) => idx === i ? s : ss) });
  const addSet = () => onChange({ ...exercise, sets: [...exercise.sets, { reps: "", weight: "" }] });
  const removeSet = (i) => onChange({ ...exercise, sets: exercise.sets.filter((_, idx) => idx !== i) });
  const completedSets = exercise.sets.filter(s => s.reps).length;

  return (
    <div style={{
      background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: "12px",
      padding: "14px", marginBottom: "8px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "600" }}>{exercise.name}</div>
          <div style={{ color: "#383838", fontSize: "10px", marginTop: "2px" }}>Target: {exercise.target}</div>
        </div>
        <div style={{
          background: completedSets > 0 && completedSets === exercise.sets.length ? "#1a2200" : "#111",
          color: completedSets > 0 && completedSets === exercise.sets.length ? "#e8ff47" : "#333",
          fontSize: "9px", padding: "3px 8px", borderRadius: "6px", whiteSpace: "nowrap",
          border: "1px solid #1e1e1e"
        }}>
          {completedSets}/{exercise.sets.length} done
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
        <span style={{ color: "#2a2a2a", fontSize: "9px", width: "38px" }}></span>
        <span style={{ color: "#2a2a2a", fontSize: "9px", width: "65px", textAlign: "center" }}>REPS</span>
        <span style={{ color: "#2a2a2a", fontSize: "9px", width: "55px", textAlign: "center" }}>KG</span>
      </div>

      {exercise.sets.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "5px" }}>
          <span style={{ color: "#2e2e2e", fontSize: "9px", width: "38px", flexShrink: 0, letterSpacing: "0.5px" }}>SET {i + 1}</span>
          <input
            type="number" placeholder="–" value={s.reps}
            onChange={e => updateSet(i, { ...s, reps: e.target.value })}
            style={{
              background: s.reps ? "#141f00" : "#151515", border: `1px solid ${s.reps ? "#2a3a00" : "#222"}`,
              borderRadius: "7px", color: s.reps ? "#e8ff47" : "#555",
              padding: "6px 8px", fontSize: "13px", width: "65px", outline: "none", textAlign: "center"
            }}
          />
          <input
            type="number" placeholder="–" value={s.weight}
            onChange={e => updateSet(i, { ...s, weight: e.target.value })}
            style={{
              background: "#151515", border: "1px solid #222", borderRadius: "7px",
              color: "#aaa", padding: "6px 8px", fontSize: "13px", width: "55px",
              outline: "none", textAlign: "center"
            }}
          />
          <button onClick={() => removeSet(i)} style={{ background: "none", border: "none", color: "#252525", cursor: "pointer", fontSize: "13px", padding: "0 4px" }}>✕</button>
        </div>
      ))}

      <button onClick={addSet} style={{
        marginTop: "8px", background: "none", border: "1px dashed #1e1e1e",
        borderRadius: "7px", color: "#333", cursor: "pointer", padding: "5px",
        fontSize: "10px", width: "100%", letterSpacing: "1px"
      }}>+ ADD SET</button>
    </div>
  );
}

export default function GymTracker() {
  const [log, setLog] = useState(getStored);
  const [activeDay, setActiveDay] = useState("Day 1");
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("gymLog_v2", JSON.stringify(log)); } catch {}
  }, [log]);

  const updateDayLog = (dayKey, updates) => {
    setLog(prev => ({ ...prev, [dayKey]: { ...prev[dayKey], ...updates } }));
  };

  const updateExercise = (dayKey, exIndex, updated) => {
    const exercises = log[dayKey].exercises.map((e, i) => i === exIndex ? updated : e);
    updateDayLog(dayKey, { exercises });
  };

  const handleReset = () => {
    const history = getHistory();
    history.unshift({ savedAt: new Date().toLocaleDateString(), log });
    if (history.length > 8) history.pop();
    try { localStorage.setItem("gymHistory_v2", JSON.stringify(history)); } catch {}
    setLog(makeDefaultLog());
    setShowSummary(false);
  };

  const day = PROGRAM[activeDay];
  const dayLog = log[activeDay];

  // Build sectioned view with global exercise indices
  let globalIdx = 0;
  const sectionedView = day.sections.map(sec => ({
    ...sec,
    exercises: sec.exercises.map((ex) => {
      const idx = globalIdx++;
      return { loggedEx: dayLog.exercises[idx], globalIdx: idx };
    })
  }));

  return (
    <div style={{
      minHeight: "100vh", background: "#080808", color: "#ccc",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      maxWidth: "480px", margin: "0 auto", paddingBottom: "60px"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "26px 20px 14px", borderBottom: "1px solid #111",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end"
      }}>
        <div>
          <div style={{ color: "#333", fontSize: "9px", letterSpacing: "3px", marginBottom: "2px" }}>WEEKLY</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "34px", color: "#e8ff47", margin: 0, letterSpacing: "3px" }}>
            GYM LOG
          </h1>
        </div>
        <button onClick={() => setShowSummary(true)} style={{
          background: "#e8ff47", color: "#000", border: "none", borderRadius: "10px",
          padding: "10px 14px", fontWeight: "700", fontSize: "11px", cursor: "pointer", letterSpacing: "0.5px"
        }}>WEEK RECAP</button>
      </div>

      {/* Day tabs */}
      <div style={{ overflowX: "auto", padding: "14px 20px 0", display: "flex", gap: "7px" }}>
        {Object.entries(PROGRAM).map(([key, d]) => {
          const isActive = activeDay === key;
          const hasData = log[key].exercises.some(e => e.sets.some(s => s.reps)) || log[key].steps;
          return (
            <button key={key} onClick={() => setActiveDay(key)} style={{
              flexShrink: 0,
              background: isActive ? d.color : "#0e0e0e",
              color: isActive ? (d.color === "#ffcc00" ? "#000" : "#000") : hasData ? "#bbb" : "#383838",
              border: `1px solid ${isActive ? d.color : hasData ? "#252525" : "#141414"}`,
              borderRadius: "9px", padding: "7px 11px", cursor: "pointer",
              fontSize: "11px", fontWeight: "700"
            }}>
              {d.emoji} D{key.replace("Day ", "")}
              {hasData && !isActive && <span style={{ color: "#e8ff47", marginLeft: "3px", fontSize: "6px" }}>●</span>}
            </button>
          );
        })}
      </div>

      {/* Day title */}
      <div style={{ padding: "16px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>{day.emoji}</span>
          <div>
            <div style={{ color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "1px" }}>
              {day.label.toUpperCase()}
            </div>
            <div style={{ color: "#383838", fontSize: "10px" }}>{day.subtitle}</div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{
          background: "#0d0d0d", border: "1px solid #181818", borderRadius: "11px",
          padding: "11px 15px", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <div style={{ color: "#444", fontSize: "9px", letterSpacing: "1.5px" }}>👟 DAILY STEPS</div>
            <div style={{ color: "#252525", fontSize: "9px", marginTop: "2px" }}>Type at end of day</div>
          </div>
          <input
            type="number" placeholder="0"
            value={dayLog.steps}
            onChange={e => updateDayLog(activeDay, { steps: e.target.value })}
            style={{
              background: dayLog.steps ? "#141f00" : "#151515",
              border: `1px solid ${dayLog.steps ? "#2a3a00" : "#1e1e1e"}`,
              borderRadius: "8px", color: "#e8ff47",
              padding: "7px 10px", fontSize: "15px",
              fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "1px",
              width: "85px", textAlign: "center", outline: "none"
            }}
          />
        </div>
      </div>

      {/* Exercise sections */}
      <div style={{ padding: "0 20px" }}>
        {day.isRest ? (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>{day.emoji}</div>
            <div style={{ color: "#2a2a2a", fontSize: "14px" }}>{day.subtitle}</div>
            <div style={{ color: "#1e1e1e", fontSize: "11px", marginTop: "8px" }}>Log your steps above.</div>
          </div>
        ) : (
          sectionedView.map((sec, si) => (
            <div key={si} style={{ marginBottom: "22px" }}>
              <div style={{ color: "#383838", fontSize: "9px", letterSpacing: "1.5px", marginBottom: "10px", paddingLeft: "2px" }}>
                {sec.title}
              </div>
              {sec.exercises.map(({ loggedEx, globalIdx: gi }) => (
                loggedEx ? (
                  <ExerciseCard
                    key={gi}
                    exercise={loggedEx}
                    onChange={(updated) => updateExercise(activeDay, gi, updated)}
                  />
                ) : null
              ))}
            </div>
          ))
        )}
      </div>

      {showSummary && (
        <WeekSummary log={log} onClose={() => setShowSummary(false)} onReset={handleReset} />
      )}
    </div>
  );
}
