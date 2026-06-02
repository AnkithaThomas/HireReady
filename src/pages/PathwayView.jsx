import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

export default function PathwayView({ user, onLogout }) {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const [pathway, setPathway] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`pathways_${user.userId}`) || "[]");
      return saved.find(p => p.roadmapId === roadmapId) || null;
    } catch {
      return null;
    }
  });

  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`completedTasks_${user.userId}`) || "{}");
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(`completedTasks_${user.userId}`, JSON.stringify(completedTasks));
  }, [completedTasks, user.userId]);

  function persistNewWeek(weekNum, weekPlan) {
    setPathway(prev => {
      const updated = { ...prev, weeks: { ...prev.weeks, [weekNum]: weekPlan } };
      try {
        const all = JSON.parse(localStorage.getItem(`pathways_${user.userId}`) || "[]");
        localStorage.setItem(
          `pathways_${user.userId}`,
          JSON.stringify(all.map(p => p.roadmapId === roadmapId ? updated : p))
        );
      } catch {}
      return updated;
    });
  }

  async function handleWeekClick(weekNum) {
    setCurrentWeek(weekNum);
    if (pathway.weeks[weekNum]) return;

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/generate-roadmap`, {
        userId: user.userId,
        jobDescription: pathway.jobDescription,
        skillGaps: pathway.skillGaps,
        paidCourses: pathway.paidCourses || [],
        freeVideos: pathway.freeVideos || [],
        usePaidCourses: pathway.usePaidCourses || false,
        weekNumber: weekNum,
        roadmapId: pathway.roadmapId,
      });
      persistNewWeek(weekNum, response.data.weekPlan);
    } catch (err) {
      console.error(err);
      setError(`Failed to generate Week ${weekNum}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(dayKey, taskIndex) {
    const key = `${dayKey}-${taskIndex}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function isDayComplete(dayKey, tasks) {
    return tasks.every((_, i) => completedTasks[`${dayKey}-${i}`]);
  }

  if (!pathway) return <Navigate to="/dashboard" />;

  const totalWeeks = pathway.totalWeeks;
  const currentWeekData = pathway.weeks[currentWeek];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Pathways
          </button>
          <h1 className="text-xl font-black text-slate-900">Your {totalWeeks} Week Plan</h1>
          <button
            onClick={onLogout}
            className="text-sm font-semibold text-slate-400 hover:text-slate-700"
          >
            Sign out
          </button>
        </div>

        {totalWeeks <= 8 ? (
          <div className="mb-6 flex items-center justify-center gap-3 flex-wrap">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((weekNum) => (
              <button
                key={weekNum}
                onClick={() => handleWeekClick(weekNum)}
                className={`rounded-xl px-6 py-2 text-sm font-bold transition ${
                  currentWeek === weekNum
                    ? "bg-indigo-600 text-white"
                    : pathway.weeks[weekNum]
                    ? "border border-slate-300 text-slate-600 hover:border-indigo-400"
                    : "border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400"
                }`}
              >
                Week {weekNum} {!pathway.weeks[weekNum] && "→"}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-center gap-3">
            <button
              onClick={() => handleWeekClick(Math.max(1, currentWeek - 1))}
              disabled={currentWeek === 1}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:border-indigo-400 disabled:opacity-30"
            >
              ←
            </button>
            <select
              value={currentWeek}
              onChange={(e) => handleWeekClick(Number(e.target.value))}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((weekNum) => (
                <option key={weekNum} value={weekNum}>
                  Week {weekNum}{!pathway.weeks[weekNum] ? " (not generated)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleWeekClick(Math.min(totalWeeks, currentWeek + 1))}
              disabled={currentWeek === totalWeeks}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:border-indigo-400 disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-7 gap-3">
          {loading ? (
            <div className="col-span-7 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="font-semibold text-slate-700">Generating Week {currentWeek}...</p>
            </div>
          ) : !currentWeekData ? (
            <div className="col-span-7 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-slate-600">Click a week above to generate that week's plan.</p>
            </div>
          ) : (
            currentWeekData.days.map((day) => {
              const dayKey = `w${currentWeek}d${day.day}`;
              const dayDone = isDayComplete(dayKey, day.tasks);
              return (
                <div
                  key={day.day}
                  className={`rounded-2xl border p-4 ${dayDone ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"} shadow-sm`}
                >
                  <p className="text-xs font-bold text-indigo-600">Day {day.day}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700 leading-tight">{day.title}</p>
                  <div className="mt-3 space-y-2">
                    {day.tasks.map((task, taskIndex) => {
                      const taskKey = `${dayKey}-${taskIndex}`;
                      const done = completedTasks[taskKey];
                      return (
                        <div key={taskIndex} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={done || false}
                            onChange={() => toggleTask(dayKey, taskIndex)}
                            className="mt-0.5 accent-indigo-600"
                          />
                          <div>
                            {task.link ? (
                              <a
                                href={task.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-xs leading-tight ${done ? "line-through text-slate-400" : "text-indigo-600 hover:underline"}`}
                              >
                                {task.title}
                              </a>
                            ) : (
                              <p className={`text-xs leading-tight ${done ? "line-through text-slate-400" : "text-slate-600"}`}>
                                {task.title}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 capitalize">{task.type}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
