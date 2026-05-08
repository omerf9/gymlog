import { useState, useEffect, useRef } from "react";

// ─── PROGRAM DATA ────────────────────────────────────────────────────────────
const PROGRAM = {
  "Day 1": { label: "Push", emoji: "🔴", subtitle: "Chest, Shoulders, Triceps", color: "#ff4444", sections: [
    { title: "🧱 Compound Strength", exercises: [{ name: "Incline Bench Press", target: "4× 6–10" }, { name: "Flat Bench Press", target: "4× 6–10" }] },
    { title: "🧬 Calisthenics", exercises: [{ name: "Incline Push-Ups", target: "3× 12–20" }, { name: "Dips", target: "3× 8–15" }] },
    { title: "💪 Shoulders", exercises: [{ name: "Dumbbell Shoulder Press", target: "3× 8–12" }, { name: "Lateral Raises", target: "3× 12–15" }] },
    { title: "🔥 Triceps", exercises: [{ name: "Cable Pushdowns", target: "3× 10–15" }, { name: "Overhead Triceps Extension", target: "3× 10–12" }] },
  ]},
  "Day 2": { label: "Pull", emoji: "🔵", subtitle: "Back, Biceps", color: "#4488ff", sections: [
    { title: "🧱 Compound Strength", exercises: [{ name: "Pull-Ups", target: "4× 6–10" }, { name: "Barbell Rows", target: "4× 8–12" }] },
    { title: "🧬 Calisthenics", exercises: [{ name: "Chin-Ups", target: "3× 8–12" }, { name: "Inverted Rows", target: "3× 10–15" }] },
    { title: "🧠 Back Detail", exercises: [{ name: "Lat Pulldown", target: "3× 10–12" }, { name: "Single-Arm Dumbbell Row", target: "3× 10–12" }] },
    { title: "💪 Biceps", exercises: [{ name: "Barbell Curl", target: "3× 8–12" }, { name: "Hammer Curl", target: "3× 10–12" }] },
  ]},
  "Day 3": { label: "Legs", emoji: "🟢", subtitle: "Power + Athletic", color: "#44cc66", sections: [
    { title: "🧱 Compound Strength", exercises: [{ name: "Squats", target: "4× 5–8" }, { name: "Romanian Deadlifts", target: "4× 8–10" }] },
    { title: "🧬 Calisthenics", exercises: [{ name: "Jump Squats", target: "3× 10–15" }, { name: "Walking Lunges", target: "3× 12 each leg" }] },
    { title: "🦵 Isolation", exercises: [{ name: "Leg Extensions", target: "3× 12–15" }, { name: "Hamstring Curls", target: "3× 12–15" }, { name: "Calf Raises", target: "4× 15–20" }] },
  ]},
  "Day 4": { label: "Shoulders & Arms", emoji: "🟡", subtitle: "Shoulders, Traps & Arms", color: "#ffcc00", sections: [
    { title: "🧱 Shoulders", exercises: [{ name: "Smith Machine Shoulder Press", target: "4× 8–12" }, { name: "Arnold Press", target: "3× 10–12" }, { name: "Lateral Raises (strict)", target: "3× 12–15" }] },
    { title: "🧬 Calisthenics", exercises: [{ name: "Pike Push-Ups", target: "3× 10–15" }, { name: "Handstand Holds (wall-assisted)", target: "3 rounds" }] },
    { title: "🪨 Traps", exercises: [{ name: "Dumbbell Shrugs", target: "4× 12–15" }, { name: "Upright Rows (EZ bar)", target: "3× 10–12" }] },
    { title: "💪 Arms Finisher", exercises: [{ name: "Cable Curls", target: "3× 12" }, { name: "Triceps Dips", target: "3× 12" }] },
  ]},
  "Day 5": { label: "Accessory", emoji: "⚫", subtitle: "Core, Weak Points, Athleticism", color: "#888888", sections: [
    { title: "🧠 Core Focus", exercises: [{ name: "Hanging Leg Raises", target: "3× 10–15" }, { name: "Ab Rollouts", target: "3× 8–12" }, { name: "Plank", target: "3× 45–60 sec" }] },
    { title: "🧬 Calisthenics Flow", exercises: [{ name: "Push-Ups (varied)", target: "3 sets" }, { name: "Pull-Ups (light)", target: "3 sets" }, { name: "Bodyweight Squats", target: "3 sets" }] },
    { title: "🛠️ Weak Points", exercises: [{ name: "Rear Delt Flys", target: "3× 12–15" }, { name: "Rotator Cuff Work (bands)", target: "3× 15" }, { name: "Forearms / Grip Training", target: "3 sets" }] },
  ]},
  "Day 6": { label: "Active Rest", emoji: "🧘‍♂️", subtitle: "Swim, Sauna, Steam", color: "#aa88ff", sections: [], isRest: true },
  "Day 7": { label: "Full Rest", emoji: "💤", subtitle: "Recovery", color: "#444444", sections: [], isRest: true },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const makeDefaultSets = (target) => {
  const match = target.match(/^(\d+)[x×]/);
  const count = match ? parseInt(match[1]) : 3;
  return Array.from({ length: count }, () => ({ reps: "", weight: "" }));
};

const makeDefaultLog = () =>
  Object.fromEntries(Object.entries(PROGRAM).map(([k, d]) => [k, {
    steps: "",
    exercises: d.sections.flatMap(s => s.exercises.map(ex => ({ name: ex.name, target: ex.target, sets: makeDefaultSets(ex.target) }))),
  }]));

const stored = (key, fallback) => { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── AI CALL ──────────────────────────────────────────────────────────────────
async function callAI(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = ["LOG", "PROGRESS", "AI COACH", "PHYSIQUE"];

// ─── PROGRESS VIEW ────────────────────────────────────────────────────────────
function ProgressView({ log, history }) {
  const allWeeks = [{ savedAt: "This Week", log }, ...history];

  // Plateau detection: find exercises where weight hasn't increased in 2+ weeks
  const plateaus = [];
  if (history.length >= 1) {
    const thisWeekExercises = {};
    Object.values(log).forEach(d => d.exercises.forEach(ex => {
      const maxW = Math.max(...ex.sets.map(s => Number(s.weight || 0)));
      if (maxW > 0) thisWeekExercises[ex.name] = maxW;
    }));
    const lastWeekExercises = {};
    Object.values(history[0].log).forEach(d => d.exercises.forEach(ex => {
      const maxW = Math.max(...ex.sets.map(s => Number(s.weight || 0)));
      if (maxW > 0) lastWeekExercises[ex.name] = maxW;
    }));
    Object.entries(thisWeekExercises).forEach(([name, w]) => {
      if (lastWeekExercises[name] && w <= lastWeekExercises[name]) plateaus.push({ name, weight: w });
    });
  }

  // Per-exercise progression chart data
  const exerciseNames = [...new Set(Object.values(log).flatMap(d => d.exercises.map(e => e.name)))];
  const [selectedEx, setSelectedEx] = useState(exerciseNames[0] || "");

  const chartData = allWeeks.slice().reverse().map((w, i) => {
    let maxW = 0, totalReps = 0;
    Object.values(w.log).forEach(d => d.exercises.forEach(ex => {
      if (ex.name === selectedEx) {
        ex.sets.forEach(s => {
          if (Number(s.weight) > maxW) maxW = Number(s.weight);
          totalReps += Number(s.reps || 0);
        });
      }
    }));
    return { week: i === allWeeks.length - 1 ? "Now" : `W${i + 1}`, weight: maxW, reps: totalReps };
  });

  const maxWeight = Math.max(...chartData.map(d => d.weight), 1);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ color: "#444", fontSize: "9px", letterSpacing: "2px", marginBottom: "16px" }}>EXERCISE PROGRESSION</div>

      {/* Exercise selector */}
      <div style={{ overflowX: "auto", display: "flex", gap: "6px", marginBottom: "20px", paddingBottom: "4px" }}>
        {exerciseNames.map(n => (
          <button key={n} onClick={() => setSelectedEx(n)} style={{
            flexShrink: 0, padding: "5px 10px", borderRadius: "7px", fontSize: "10px",
            background: selectedEx === n ? "#e8ff47" : "#111",
            color: selectedEx === n ? "#000" : "#555",
            border: `1px solid ${selectedEx === n ? "#e8ff47" : "#1e1e1e"}`,
            cursor: "pointer", whiteSpace: "nowrap"
          }}>{n}</button>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: "#0e0e0e", borderRadius: "14px", padding: "16px", border: "1px solid #1a1a1a", marginBottom: "20px" }}>
        <div style={{ color: "#e0e0e0", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>{selectedEx}</div>
        <div style={{ color: "#444", fontSize: "9px", marginBottom: "14px" }}>Max weight per week (kg)</div>
        {chartData.length === 0 || maxWeight === 0 ? (
          <div style={{ color: "#2a2a2a", fontSize: "11px", textAlign: "center", padding: "20px" }}>No weight data yet</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px" }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ color: "#e8ff47", fontSize: "8px" }}>{d.weight > 0 ? d.weight : ""}</div>
                <div style={{
                  width: "100%", background: d.week === "Now" ? "#e8ff47" : "#1e2a00",
                  borderRadius: "4px 4px 0 0",
                  height: `${Math.max((d.weight / maxWeight) * 60, d.weight > 0 ? 4 : 0)}px`,
                  transition: "height 0.3s"
                }} />
                <div style={{ color: "#333", fontSize: "8px" }}>{d.week}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plateau alerts */}
      {plateaus.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ color: "#ff6644", fontSize: "9px", letterSpacing: "2px", marginBottom: "10px" }}>⚠️ PLATEAU DETECTED</div>
          {plateaus.map((p, i) => (
            <div key={i} style={{
              background: "#1a0a00", border: "1px solid #331500", borderRadius: "10px",
              padding: "12px 14px", marginBottom: "6px", display: "flex", justifyContent: "space-between"
            }}>
              <div style={{ color: "#ddd", fontSize: "12px" }}>{p.name}</div>
              <div style={{ color: "#ff6644", fontSize: "10px" }}>No progress — try +2.5kg</div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly totals */}
      <div style={{ color: "#444", fontSize: "9px", letterSpacing: "2px", marginBottom: "10px" }}>WEEKLY TOTALS</div>
      {allWeeks.slice(0, 4).map((w, i) => {
        const totalSets = Object.values(w.log).reduce((a, d) => a + d.exercises.reduce((b, e) => b + e.sets.filter(s => s.reps).length, 0), 0);
        const totalReps = Object.values(w.log).reduce((a, d) => a + d.exercises.reduce((b, e) => b + e.sets.reduce((c, s) => c + Number(s.reps || 0), 0), 0), 0);
        const totalSteps = Object.values(w.log).reduce((a, d) => a + Number(d.steps || 0), 0);
        return (
          <div key={i} style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "12px 14px", marginBottom: "6px" }}>
            <div style={{ color: i === 0 ? "#e8ff47" : "#555", fontSize: "10px", marginBottom: "6px", fontWeight: "600" }}>{w.savedAt}</div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div><div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "700" }}>{totalSets}</div><div style={{ color: "#333", fontSize: "9px" }}>SETS</div></div>
              <div><div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "700" }}>{totalReps}</div><div style={{ color: "#333", fontSize: "9px" }}>REPS</div></div>
              <div><div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "700" }}>{totalSteps.toLocaleString()}</div><div style={{ color: "#333", fontSize: "9px" }}>STEPS</div></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI COACH VIEW ────────────────────────────────────────────────────────────
function AICoachView({ log, history }) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(stored("gymCoachAdvice", null));
  const [macros, setMacros] = useState(stored("gymMacros", null));
  const [goal, setGoal] = useState(stored("gymGoal", "build muscle"));
  const [weight, setWeight] = useState(stored("gymBodyWeight", ""));
  const [macroLoading, setMacroLoading] = useState(false);

  const getWeeklySummary = () => {
    const summary = {};
    Object.entries(log).forEach(([day, d]) => {
      PROGRAM[day] && (summary[PROGRAM[day].label] = d.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.filter(s => s.reps).length,
        topWeight: Math.max(...ex.sets.map(s => Number(s.weight || 0))),
        totalReps: ex.sets.reduce((a, s) => a + Number(s.reps || 0), 0),
      })).filter(e => e.sets > 0));
    });
    return summary;
  };

  const getCoaching = async () => {
    setLoading(true);
    const summary = getWeeklySummary();
    const lastWeek = history[0] ? "Previous week data available." : "First week of tracking.";
    const text = await callAI([{
      role: "user",
      content: `Here is my workout data for this week:\n${JSON.stringify(summary, null, 2)}\n\n${lastWeek}\n\nMy goal: ${goal}\n\nGive me:\n1. What I did well this week\n2. What needs improvement\n3. Specific adjustments to my program for next week (exercises, sets, weights)\n4. One key focus for next week\n\nBe direct, specific, and motivating. Keep it concise.`
    }], "You are an elite strength and conditioning coach. Give practical, specific, data-driven feedback. No fluff.");
    setAdvice(text);
    save("gymCoachAdvice", text);
    setLoading(false);
  };

  const getMacros = async () => {
    if (!weight) return;
    setMacroLoading(true);
    const text = await callAI([{
      role: "user",
      content: `My body weight: ${weight}kg. My goal: ${goal}. I train 5 days a week with a Push/Pull/Legs/Shoulders/Accessory split.\n\nGive me daily macro targets:\n- Calories\n- Protein (g)\n- Carbs (g)\n- Fats (g)\n\nAlso give me 3 simple meal timing tips. Be specific and practical. Return as clean text, no markdown.`
    }], "You are a sports nutritionist. Give precise, practical macro recommendations based on the user's stats and goals.");
    setMacros(text);
    save("gymMacros", text);
    save("gymBodyWeight", weight);
    setMacroLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Goal selector */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ color: "#444", fontSize: "9px", letterSpacing: "2px", marginBottom: "10px" }}>YOUR GOAL</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["build muscle", "lose fat", "recomp"].map(g => (
            <button key={g} onClick={() => { setGoal(g); save("gymGoal", g); }} style={{
              flex: 1, padding: "9px", borderRadius: "9px", fontSize: "11px", fontWeight: "600", cursor: "pointer",
              background: goal === g ? "#e8ff47" : "#111",
              color: goal === g ? "#000" : "#555",
              border: `1px solid ${goal === g ? "#e8ff47" : "#1e1e1e"}`,
              textTransform: "capitalize"
            }}>{g}</button>
          ))}
        </div>
      </div>

      {/* Weekly AI Coach */}
      <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "600" }}>🤖 Weekly Coach</div>
            <div style={{ color: "#333", fontSize: "10px", marginTop: "2px" }}>AI adjusts your program weekly</div>
          </div>
          <button onClick={getCoaching} disabled={loading} style={{
            background: loading ? "#111" : "#e8ff47", color: loading ? "#555" : "#000",
            border: "none", borderRadius: "8px", padding: "8px 12px",
            fontSize: "10px", fontWeight: "700", cursor: loading ? "default" : "pointer"
          }}>{loading ? "Analyzing..." : "Analyze Week"}</button>
        </div>
        {advice ? (
          <div style={{ color: "#bbb", fontSize: "12px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{advice}</div>
        ) : (
          <div style={{ color: "#2a2a2a", fontSize: "11px" }}>Log your workouts then tap Analyze Week to get personalized coaching.</div>
        )}
      </div>

      {/* Macros */}
      <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px" }}>
        <div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>🥗 Calorie & Macro Targets</div>
        <div style={{ color: "#333", fontSize: "10px", marginBottom: "14px" }}>Based on your body weight and goal</div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="number" placeholder="Body weight (kg)" value={weight}
            onChange={e => setWeight(e.target.value)}
            style={{
              flex: 1, background: "#151515", border: "1px solid #222", borderRadius: "8px",
              color: "#ccc", padding: "9px 12px", fontSize: "12px", outline: "none"
            }}
          />
          <button onClick={getMacros} disabled={macroLoading || !weight} style={{
            background: weight && !macroLoading ? "#e8ff47" : "#111",
            color: weight && !macroLoading ? "#000" : "#555",
            border: "none", borderRadius: "8px", padding: "9px 14px",
            fontSize: "10px", fontWeight: "700", cursor: "pointer"
          }}>{macroLoading ? "..." : "Calculate"}</button>
        </div>
        {macros ? (
          <div style={{ color: "#bbb", fontSize: "12px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{macros}</div>
        ) : (
          <div style={{ color: "#2a2a2a", fontSize: "11px" }}>Enter your weight to get daily macro targets.</div>
        )}
      </div>
    </div>
  );
}

// ─── PHYSIQUE VIEW ────────────────────────────────────────────────────────────
const VIEWS = ["Front", "Side", "Back"];
const CURRENT_WEEK = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
};
const CURRENT_MONTH = () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

function PhysiqueView() {
  // Weekly check-ins: { weekKey, bodyWeight, photos: {Front, Side, Back}, analysis, date }
  const [checkins, setCheckins] = useState(stored("gymCheckins", []));
  const [activeCheckin, setActiveCheckin] = useState(null); // index into checkins
  const [draftWeight, setDraftWeight] = useState("");
  const [draftPhotos, setDraftPhotos] = useState({ Front: null, Side: null, Back: null });
  const [loading, setLoading] = useState(false);
  const [monthReport, setMonthReport] = useState(stored("gymMonthReport", null));
  const [monthLoading, setMonthLoading] = useState(false);
  const [view, setView] = useState("checkin"); // checkin | history | report
  const fileRefs = { Front: useRef(), Side: useRef(), Back: useRef() };

  const weekKey = `W${CURRENT_WEEK()}-${new Date().getFullYear()}`;
  const thisWeekCheckin = checkins.find(c => c.weekKey === weekKey);

  const handlePhoto = (angle, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setDraftPhotos(p => ({ ...p, [angle]: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const saveCheckin = async () => {
    if (!draftWeight) return;
    setLoading(true);

    // Build message content with all uploaded photos
    const content = [];
    const uploadedAngles = VIEWS.filter(v => draftPhotos[v]);
    uploadedAngles.forEach(angle => {
      const base64 = draftPhotos[angle].split(",")[1];
      const mediaType = draftPhotos[angle].split(";")[0].split(":")[1];
      content.push({ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } });
      content.push({ type: "text", text: `^ This is the ${angle} view.` });
    });

    const anglesNote = uploadedAngles.length > 0
      ? `I've uploaded ${uploadedAngles.join(", ")} view(s).`
      : "No photos uploaded this week.";

    content.push({
      type: "text",
      text: `My current body weight: ${draftWeight}kg. ${anglesNote}\n\nPlease provide:\n1. Estimated body fat % range (if photos provided)\n2. Muscle development strengths\n3. Muscle imbalances to address\n4. Posture observations\n5. Top 3 priority improvements for this week\n\nBe honest, specific, and constructive.`
    });

    const analysis = await callAI(
      [{ role: "user", content }],
      "You are an elite physique coach. Analyze the provided photos comprehensively using all angles. Give honest, actionable, specific feedback for personal fitness tracking."
    );

    const newCheckin = {
      weekKey,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      month: CURRENT_MONTH(),
      bodyWeight: Number(draftWeight),
      photos: { ...draftPhotos },
      analysis,
    };

    const updated = [newCheckin, ...checkins.filter(c => c.weekKey !== weekKey)].slice(0, 20);
    setCheckins(updated);
    save("gymCheckins", updated);
    setDraftWeight("");
    setDraftPhotos({ Front: null, Side: null, Back: null });
    setLoading(false);
    setView("history");
  };

  const getMonthReport = async () => {
    setMonthLoading(true);
    const thisMonth = CURRENT_MONTH();
    const monthCheckins = checkins.filter(c => c.month === thisMonth);
    if (monthCheckins.length === 0) { setMonthLoading(false); return; }

    const weights = monthCheckins.map(c => c.bodyWeight).filter(Boolean).reverse();
    const weightChange = weights.length >= 2 ? (weights[weights.length - 1] - weights[0]).toFixed(1) : null;
    const analyses = monthCheckins.map((c, i) => `Week ${i + 1} (${c.date}): ${c.analysis}`).join("\n\n---\n\n");

    const text = await callAI([{
      role: "user",
      content: `Here are my weekly physique check-ins for ${thisMonth}:\n\n${analyses}\n\nBody weight trend: ${weights.join("kg → ")}kg${weightChange ? ` (${weightChange > 0 ? "+" : ""}${weightChange}kg total)` : ""}\n\nGive me a comprehensive monthly progression report:\n1. Overall body composition change\n2. Biggest improvements this month\n3. Persistent issues to address\n4. Strength vs aesthetics progress\n5. Goals and focus areas for next month\n\nBe specific and data-driven.`
    }], "You are an elite physique and performance coach. Generate a comprehensive monthly progress report based on weekly check-in data.");

    setMonthReport({ text, month: thisMonth, generatedAt: new Date().toLocaleDateString() });
    save("gymMonthReport", { text, month: thisMonth, generatedAt: new Date().toLocaleDateString() });
    setMonthLoading(false);
  };

  // Group checkins by month for history
  const byMonth = {};
  checkins.forEach(c => { if (!byMonth[c.month]) byMonth[c.month] = []; byMonth[c.month].push(c); });

  return (
    <div style={{ padding: "20px" }}>
      {/* Sub nav */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
        {[["checkin", "📸 Check-In"], ["history", "📅 History"], ["report", "📊 Monthly"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "9px 4px", borderRadius: "9px", fontSize: "10px", fontWeight: "700", cursor: "pointer",
            background: view === v ? "#e8ff47" : "#0e0e0e",
            color: view === v ? "#000" : "#444",
            border: `1px solid ${view === v ? "#e8ff47" : "#1a1a1a"}`
          }}>{label}</button>
        ))}
      </div>

      {/* ── CHECK-IN VIEW ── */}
      {view === "checkin" && (
        <div>
          {thisWeekCheckin ? (
            <div style={{ background: "#0d1a00", border: "1px solid #2a3a00", borderRadius: "12px", padding: "14px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#e8ff47", fontSize: "12px", fontWeight: "600" }}>✅ This week logged</div>
                <div style={{ color: "#555", fontSize: "10px", marginTop: "2px" }}>{thisWeekCheckin.date} · {thisWeekCheckin.bodyWeight}kg</div>
              </div>
              <button onClick={() => { setView("history"); }} style={{ background: "none", border: "1px solid #2a3a00", borderRadius: "7px", color: "#e8ff47", fontSize: "10px", padding: "5px 10px", cursor: "pointer" }}>View</button>
            </div>
          ) : (
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px" }}>
              <div style={{ color: "#e8ff47", fontSize: "10px", fontWeight: "700", letterSpacing: "1px" }}>WEEK {CURRENT_WEEK()} CHECK-IN</div>
              <div style={{ color: "#333", fontSize: "10px", marginTop: "2px" }}>Log weekly to track your monthly progress</div>
            </div>
          )}

          {/* Body weight input */}
          <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px", marginBottom: "14px" }}>
            <div style={{ color: "#555", fontSize: "9px", letterSpacing: "1.5px", marginBottom: "8px" }}>⚖️ BODY WEIGHT THIS WEEK</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="number" placeholder="e.g. 78.5" value={draftWeight}
                onChange={e => setDraftWeight(e.target.value)}
                style={{ flex: 1, background: "#151515", border: "1px solid #222", borderRadius: "8px", color: "#e8ff47", padding: "10px 12px", fontSize: "16px", fontFamily: "'Bebas Neue', sans-serif", outline: "none" }}
              />
              <span style={{ color: "#444", fontSize: "13px" }}>kg</span>
            </div>
          </div>

          {/* 3 photo slots */}
          <div style={{ color: "#444", fontSize: "9px", letterSpacing: "1.5px", marginBottom: "10px" }}>PHOTOS — FRONT · SIDE · BACK</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {VIEWS.map(angle => (
              <div key={angle}>
                <input ref={fileRefs[angle]} type="file" accept="image/*" onChange={e => handlePhoto(angle, e)} style={{ display: "none" }} />
                <div onClick={() => fileRefs[angle].current.click()} style={{
                  height: "110px", borderRadius: "10px", cursor: "pointer", overflow: "hidden",
                  border: draftPhotos[angle] ? "1px solid #2a3a00" : "1px dashed #1e1e1e",
                  background: "#0e0e0e", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", position: "relative"
                }}>
                  {draftPhotos[angle] ? (
                    <img src={draftPhotos[angle]} alt={angle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      <span style={{ fontSize: "20px", marginBottom: "4px" }}>📷</span>
                      <span style={{ color: "#333", fontSize: "9px" }}>{angle}</span>
                    </>
                  )}
                  {draftPhotos[angle] && (
                    <div style={{ position: "absolute", bottom: "4px", left: "4px", background: "rgba(0,0,0,0.8)", color: "#e8ff47", fontSize: "8px", padding: "2px 5px", borderRadius: "4px" }}>{angle}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ color: "#2a2a2a", fontSize: "10px", marginBottom: "14px", textAlign: "center" }}>Photos optional but recommended for better AI analysis</div>

          <button
            onClick={saveCheckin}
            disabled={!draftWeight || loading}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: draftWeight && !loading ? "pointer" : "default",
              background: draftWeight && !loading ? "#e8ff47" : "#111",
              color: draftWeight && !loading ? "#000" : "#333",
              fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px"
            }}
          >{loading ? "🧠 Analyzing..." : "Save Check-In + AI Analysis"}</button>
        </div>
      )}

      {/* ── HISTORY VIEW ── */}
      {view === "history" && (
        <div>
          {checkins.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#222", fontSize: "12px" }}>
              No check-ins yet. Do your first weekly check-in to start tracking.
            </div>
          ) : (
            Object.entries(byMonth).map(([month, mCheckins]) => (
              <div key={month} style={{ marginBottom: "24px" }}>
                <div style={{ color: "#444", fontSize: "9px", letterSpacing: "2px", marginBottom: "10px" }}>{month.toUpperCase()}</div>
                {mCheckins.map((c, i) => (
                  <div key={i} style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div>
                        <div style={{ color: "#e0e0e0", fontSize: "12px", fontWeight: "600" }}>{c.date}</div>
                        <div style={{ color: "#555", fontSize: "10px", marginTop: "2px" }}>{c.weekKey} · {c.bodyWeight}kg</div>
                      </div>
                      {/* Weight delta */}
                      {i < mCheckins.length - 1 && (
                        <div style={{
                          background: c.bodyWeight < mCheckins[i + 1].bodyWeight ? "#1a0a00" : "#0d1a00",
                          color: c.bodyWeight < mCheckins[i + 1].bodyWeight ? "#ff6644" : "#e8ff47",
                          fontSize: "10px", padding: "3px 8px", borderRadius: "6px"
                        }}>
                          {c.bodyWeight < mCheckins[i + 1].bodyWeight ? "▼" : "▲"} {Math.abs(c.bodyWeight - mCheckins[i + 1].bodyWeight).toFixed(1)}kg
                        </div>
                      )}
                    </div>

                    {/* Photos */}
                    {VIEWS.some(v => c.photos[v]) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "10px" }}>
                        {VIEWS.map(angle => c.photos[angle] ? (
                          <div key={angle} style={{ position: "relative" }}>
                            <img src={c.photos[angle]} alt={angle} style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "7px", border: "1px solid #1e1e1e" }} />
                            <div style={{ position: "absolute", bottom: "3px", left: "3px", background: "rgba(0,0,0,0.8)", color: "#888", fontSize: "8px", padding: "1px 4px", borderRadius: "3px" }}>{angle}</div>
                          </div>
                        ) : (
                          <div key={angle} style={{ height: "80px", borderRadius: "7px", background: "#111", border: "1px solid #141414", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#222", fontSize: "9px" }}>{angle}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Analysis toggle */}
                    {c.analysis && (
                      <details>
                        <summary style={{ color: "#555", fontSize: "10px", cursor: "pointer", userSelect: "none", letterSpacing: "1px" }}>🧠 AI ANALYSIS</summary>
                        <div style={{ color: "#888", fontSize: "11px", lineHeight: "1.7", marginTop: "8px", whiteSpace: "pre-wrap" }}>{c.analysis}</div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MONTHLY REPORT VIEW ── */}
      {view === "report" && (
        <div>
          <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px", marginBottom: "14px" }}>
            <div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>📊 Monthly Progression Report</div>
            <div style={{ color: "#333", fontSize: "10px", marginBottom: "14px" }}>AI summarizes your entire month — weight, physique, strength, and what to focus on next.</div>

            {/* Weight trend for this month */}
            {(() => {
              const thisMonth = CURRENT_MONTH();
              const mCheckins = checkins.filter(c => c.month === thisMonth && c.bodyWeight).reverse();
              if (mCheckins.length === 0) return null;
              const maxW = Math.max(...mCheckins.map(c => c.bodyWeight));
              const minW = Math.min(...mCheckins.map(c => c.bodyWeight));
              const range = maxW - minW || 1;
              return (
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ color: "#444", fontSize: "9px", letterSpacing: "1px", marginBottom: "8px" }}>BODYWEIGHT THIS MONTH</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "50px" }}>
                    {mCheckins.map((c, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                        <div style={{ color: "#888", fontSize: "8px" }}>{c.bodyWeight}</div>
                        <div style={{ width: "100%", background: "#e8ff47", borderRadius: "3px 3px 0 0", height: `${20 + ((c.bodyWeight - minW) / range) * 25}px` }} />
                        <div style={{ color: "#333", fontSize: "8px" }}>W{i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <button onClick={getMonthReport} disabled={monthLoading} style={{
              width: "100%", padding: "12px", background: monthLoading ? "#111" : "#e8ff47",
              color: monthLoading ? "#555" : "#000", border: "none", borderRadius: "9px",
              fontSize: "12px", fontWeight: "700", cursor: "pointer"
            }}>{monthLoading ? "🧠 Generating report..." : `Generate ${CURRENT_MONTH()} Report`}</button>
          </div>

          {monthReport && (
            <div style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "600" }}>{monthReport.month}</div>
                <div style={{ color: "#333", fontSize: "9px" }}>Generated {monthReport.generatedAt}</div>
              </div>
              <div style={{ color: "#bbb", fontSize: "12px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{monthReport.text}</div>
            </div>
          )}

          {checkins.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: "#222", fontSize: "12px" }}>
              Complete at least 2 weekly check-ins to generate your monthly report.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── WEEK SUMMARY MODAL ───────────────────────────────────────────────────────
function WeekSummary({ log, onClose, onReset }) {
  const totalSteps = Object.values(log).reduce((a, d) => a + Number(d.steps || 0), 0);
  let totalSets = 0, totalReps = 0;
  const exerciseSummary = [];
  Object.values(log).forEach(d => d.exercises.forEach(ex => {
    let s = 0, r = 0, w = 0;
    ex.sets.forEach(set => { if (set.reps) { s++; r += Number(set.reps); } if (Number(set.weight) > w) w = Number(set.weight); });
    totalSets += s; totalReps += r;
    if (s > 0) exerciseSummary.push({ name: ex.name, sets: s, reps: r, weight: w });
  }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}>
      <div style={{ background: "#0a0a0a", border: "1px solid #222", borderRadius: "20px", maxWidth: "460px", width: "100%", maxHeight: "88vh", overflowY: "auto", padding: "28px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <div style={{ color: "#444", fontSize: "9px", letterSpacing: "3px" }}>YOUR</div>
            <h2 style={{ color: "#e8ff47", fontFamily: "'Bebas Neue', sans-serif", fontSize: "30px", letterSpacing: "2px", margin: 0 }}>WEEKLY RECAP</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: "20px", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          {[{ label: "TOTAL SETS", value: totalSets }, { label: "TOTAL REPS", value: totalReps.toLocaleString() }, { label: "TOTAL STEPS", value: totalSteps.toLocaleString() }].map(s => (
            <div key={s.label} style={{ background: "#111", borderRadius: "12px", padding: "14px 8px", textAlign: "center", border: "1px solid #1e1e1e" }}>
              <div style={{ color: "#e8ff47", fontSize: "24px", fontFamily: "'Bebas Neue', sans-serif" }}>{s.value}</div>
              <div style={{ color: "#444", fontSize: "8px", letterSpacing: "1px", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
        {exerciseSummary.length > 0 && (
          <>
            <div style={{ color: "#444", fontSize: "9px", letterSpacing: "2px", marginBottom: "10px" }}>💪 PUSH THESE NEXT WEEK</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
              {exerciseSummary.map((ex, i) => (
                <div key={i} style={{ background: "#111", borderRadius: "10px", padding: "11px 14px", border: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#ddd", fontSize: "12px", fontWeight: "600" }}>{ex.name}</div>
                    <div style={{ color: "#444", fontSize: "10px", marginTop: "2px" }}>{ex.sets} sets · {ex.reps} reps{ex.weight > 0 ? ` · top ${ex.weight}kg` : ""}</div>
                  </div>
                  <div style={{ background: "#1a2200", color: "#e8ff47", fontSize: "9px", padding: "4px 8px", borderRadius: "6px" }}>+{ex.weight > 0 ? "2.5kg" : "1–2 reps"}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", background: "#111", border: "1px solid #1e1e1e", borderRadius: "10px", color: "#666", cursor: "pointer", fontSize: "13px" }}>Close</button>
          <button onClick={onReset} style={{ flex: 1, padding: "13px", background: "#e8ff47", border: "none", borderRadius: "10px", color: "#000", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>Start New Week →</button>
        </div>
      </div>
    </div>
  );
}

// ─── EXERCISE CARD ────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, onChange }) {
  const updateSet = (i, s) => onChange({ ...exercise, sets: exercise.sets.map((ss, idx) => idx === i ? s : ss) });
  const addSet = () => onChange({ ...exercise, sets: [...exercise.sets, { reps: "", weight: "" }] });
  const removeSet = (i) => onChange({ ...exercise, sets: exercise.sets.filter((_, idx) => idx !== i) });
  const completedSets = exercise.sets.filter(s => s.reps).length;

  return (
    <div style={{ background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: "12px", padding: "14px", marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div style={{ color: "#e0e0e0", fontSize: "13px", fontWeight: "600" }}>{exercise.name}</div>
          <div style={{ color: "#383838", fontSize: "10px", marginTop: "2px" }}>Target: {exercise.target}</div>
        </div>
        <div style={{ background: completedSets > 0 && completedSets === exercise.sets.length ? "#1a2200" : "#111", color: completedSets > 0 && completedSets === exercise.sets.length ? "#e8ff47" : "#333", fontSize: "9px", padding: "3px 8px", borderRadius: "6px", border: "1px solid #1e1e1e" }}>
          {completedSets}/{exercise.sets.length} done
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
        <span style={{ width: "38px" }} />
        <span style={{ color: "#2a2a2a", fontSize: "9px", width: "65px", textAlign: "center" }}>REPS</span>
        <span style={{ color: "#2a2a2a", fontSize: "9px", width: "55px", textAlign: "center" }}>KG</span>
      </div>
      {exercise.sets.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "5px" }}>
          <span style={{ color: "#2e2e2e", fontSize: "9px", width: "38px", flexShrink: 0 }}>SET {i + 1}</span>
          <input type="number" placeholder="–" value={s.reps} onChange={e => updateSet(i, { ...s, reps: e.target.value })}
            style={{ background: s.reps ? "#141f00" : "#151515", border: `1px solid ${s.reps ? "#2a3a00" : "#222"}`, borderRadius: "7px", color: s.reps ? "#e8ff47" : "#555", padding: "6px 8px", fontSize: "13px", width: "65px", outline: "none", textAlign: "center" }} />
          <input type="number" placeholder="–" value={s.weight} onChange={e => updateSet(i, { ...s, weight: e.target.value })}
            style={{ background: "#151515", border: "1px solid #222", borderRadius: "7px", color: "#aaa", padding: "6px 8px", fontSize: "13px", width: "55px", outline: "none", textAlign: "center" }} />
          <button onClick={() => removeSet(i)} style={{ background: "none", border: "none", color: "#252525", cursor: "pointer", fontSize: "13px" }}>✕</button>
        </div>
      ))}
      <button onClick={addSet} style={{ marginTop: "8px", background: "none", border: "1px dashed #1e1e1e", borderRadius: "7px", color: "#333", cursor: "pointer", padding: "5px", fontSize: "10px", width: "100%", letterSpacing: "1px" }}>+ ADD SET</button>
    </div>
  );
}

// ─── LOG VIEW ─────────────────────────────────────────────────────────────────
function LogView({ log, updateDayLog, updateExercise }) {
  const [activeDay, setActiveDay] = useState("Day 1");
  const [showSummary, setShowSummary] = useState(false);

  const handleReset = () => {
    const history = stored("gymHistory_v2", []);
    history.unshift({ savedAt: new Date().toLocaleDateString(), log });
    if (history.length > 8) history.pop();
    save("gymHistory_v2", history);
    // Reset via parent would be cleaner but for now trigger page reload
    save("gymLog_v2", makeDefaultLog());
    window.location.reload();
  };

  const day = PROGRAM[activeDay];
  const dayLog = log[activeDay];
  let globalIdx = 0;
  const sectionedView = day.sections.map(sec => ({
    ...sec,
    exercises: sec.exercises.map(() => { const idx = globalIdx++; return { loggedEx: dayLog.exercises[idx], globalIdx: idx }; })
  }));

  return (
    <>
      {/* Day tabs */}
      <div style={{ overflowX: "auto", padding: "14px 20px 0", display: "flex", gap: "7px" }}>
        {Object.entries(PROGRAM).map(([key, d]) => {
          const isActive = activeDay === key;
          const hasData = log[key].exercises.some(e => e.sets.some(s => s.reps)) || log[key].steps;
          return (
            <button key={key} onClick={() => setActiveDay(key)} style={{ flexShrink: 0, background: isActive ? d.color : "#0e0e0e", color: isActive ? "#000" : hasData ? "#bbb" : "#383838", border: `1px solid ${isActive ? d.color : hasData ? "#252525" : "#141414"}`, borderRadius: "9px", padding: "7px 11px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}>
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
            <div style={{ color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "1px" }}>{day.label.toUpperCase()}</div>
            <div style={{ color: "#383838", fontSize: "10px" }}>{day.subtitle}</div>
          </div>
        </div>
        <button onClick={() => setShowSummary(true)} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "8px", color: "#555", cursor: "pointer", padding: "7px 10px", fontSize: "10px" }}>Recap</button>
      </div>

      {/* Steps */}
      <div style={{ padding: "0 20px 14px" }}>
        <div style={{ background: "#0d0d0d", border: "1px solid #181818", borderRadius: "11px", padding: "11px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#444", fontSize: "9px", letterSpacing: "1.5px" }}>👟 DAILY STEPS</div>
            <div style={{ color: "#252525", fontSize: "9px", marginTop: "2px" }}>Type at end of day</div>
          </div>
          <input type="number" placeholder="0" value={dayLog.steps} onChange={e => updateDayLog(activeDay, { steps: e.target.value })}
            style={{ background: dayLog.steps ? "#141f00" : "#151515", border: `1px solid ${dayLog.steps ? "#2a3a00" : "#1e1e1e"}`, borderRadius: "8px", color: "#e8ff47", padding: "7px 10px", fontSize: "15px", fontFamily: "'Bebas Neue', sans-serif", width: "85px", textAlign: "center", outline: "none" }} />
        </div>
      </div>

      {/* Exercises */}
      <div style={{ padding: "0 20px" }}>
        {day.isRest ? (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>{day.emoji}</div>
            <div style={{ color: "#2a2a2a", fontSize: "14px" }}>{day.subtitle}</div>
          </div>
        ) : (
          sectionedView.map((sec, si) => (
            <div key={si} style={{ marginBottom: "22px" }}>
              <div style={{ color: "#383838", fontSize: "9px", letterSpacing: "1.5px", marginBottom: "10px" }}>{sec.title}</div>
              {sec.exercises.map(({ loggedEx, globalIdx: gi }) => loggedEx ? (
                <ExerciseCard key={gi} exercise={loggedEx} onChange={updated => updateExercise(activeDay, gi, updated)} />
              ) : null)}
            </div>
          ))
        )}
      </div>

      {showSummary && <WeekSummary log={log} onClose={() => setShowSummary(false)} onReset={handleReset} />}
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function GymTracker() {
  const [log, setLog] = useState(() => stored("gymLog_v2", makeDefaultLog()));
  const [activeTab, setActiveTab] = useState("LOG");
  const history = stored("gymHistory_v2", []);

  useEffect(() => { save("gymLog_v2", log); }, [log]);

  const updateDayLog = (dayKey, updates) => setLog(prev => ({ ...prev, [dayKey]: { ...prev[dayKey], ...updates } }));
  const updateExercise = (dayKey, exIndex, updated) => {
    const exercises = log[dayKey].exercises.map((e, i) => i === exIndex ? updated : e);
    updateDayLog(dayKey, { exercises });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#ccc", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth: "480px", margin: "0 auto", paddingBottom: "80px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "26px 20px 14px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ color: "#333", fontSize: "9px", letterSpacing: "3px", marginBottom: "2px" }}>WEEKLY</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "34px", color: "#e8ff47", margin: 0, letterSpacing: "3px" }}>GYM LOG</h1>
        </div>
        <div style={{ color: "#333", fontSize: "10px" }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #111", padding: "0 20px" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "12px 4px", background: "none", border: "none",
            borderBottom: `2px solid ${activeTab === tab ? "#e8ff47" : "transparent"}`,
            color: activeTab === tab ? "#e8ff47" : "#333",
            cursor: "pointer", fontSize: "9px", fontWeight: "700", letterSpacing: "1px"
          }}>{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "LOG" && <LogView log={log} updateDayLog={updateDayLog} updateExercise={updateExercise} />}
      {activeTab === "PROGRESS" && <ProgressView log={log} history={history} />}
      {activeTab === "AI COACH" && <AICoachView log={log} history={history} />}
      {activeTab === "PHYSIQUE" && <PhysiqueView />}
    </div>
  );
}
