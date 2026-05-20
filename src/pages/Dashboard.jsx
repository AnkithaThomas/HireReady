import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://hsztv5hu12.execute-api.us-east-2.amazonaws.com";

export default function Dashboard({ user }) {
  const [pathways, setPathways] = useState([]);
  const [showNewPathway, setShowNewPathway] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [resources, setResources] = useState(null);
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedTasks, setCompletedTasks] = useState({});

  async function handleFindResources() {
    if (!jobDescription) return;
    setLoading(true);
    setLoadingMessage("Analyzing your resume and finding resources...");

    try {
      const response = await axios.post(`${API_URL}/find-resources`, {
        userId: user.userId,
        jobDescription,
      });
      setResources(response.data);
      setShowGapAnalysis(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan(usePaidCourses) {
    setLoading(true);
    setLoadingMessage("Building your personalized 2 week plan...");

    try {
      const response = await axios.post(`${API_URL}/generate-roadmap`, {
        userId: user.userId,
        jobDescription,
        skillGaps: resources.skillGaps,
        paidCourses: resources.paidCourses,
        freeVideos: resources.freeVideos,
        usePaidCourses,
      });

      const newPathway = {
        roadmapId: response.data.roadmapId,
        jobDescription,
        plan: response.data.plan,
        createdAt: new Date().toISOString(),
      };

      setPathways([newPathway, ...pathways]);
      setSelectedPathway(newPathway);
      setResources(null);
      setJobDescription("");
      setShowNewPathway(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(dayKey, taskIndex) {
    const key = `${dayKey}-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function isDayComplete(dayKey, tasks) {
    return tasks.every((_, i) => completedTasks[`${dayKey}-${i}`]);
  }

  function isWeekComplete(week) {
    return week.days.every(day => isDayComplete(`w${week.week}d${day.day}`, day.tasks));
  }

  if (selectedPathway) {
    const weeks = selectedPathway.plan.weeks;
    const currentWeekData = weeks[currentWeek - 1];
    const isCurrentWeekDone = isWeekComplete(currentWeekData);

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setSelectedPathway(null)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Pathways
            </button>
            <h1 className="text-xl font-black text-slate-900">Your 2 Week Plan</h1>
            <div />
          </div>

          {/* Week Navigation */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentWeek(1)}
              className={`rounded-xl px-6 py-2 text-sm font-bold transition ${currentWeek === 1 ? "bg-indigo-600 text-white" : "border border-slate-300 text-slate-600"}`}
            >
              Week 1
            </button>
            <button
              onClick={() => {
                if (isCurrentWeekDone || currentWeek === 2) setCurrentWeek(2);
              }}
              className={`rounded-xl px-6 py-2 text-sm font-bold transition ${currentWeek === 2 ? "bg-indigo-600 text-white" : isWeekComplete(weeks[0]) ? "border border-slate-300 text-slate-600" : "border border-slate-200 text-slate-300 cursor-not-allowed"}`}
            >
              Week 2 {!isWeekComplete(weeks[0]) && "🔒"}
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-3">
            {currentWeekData.days.map((day) => {
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
            })}
          </div>

          {/* Week completion message */}
          {isCurrentWeekDone && currentWeek === 1 && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="font-bold text-emerald-700">Week 1 Complete! 🎉</p>
              <p className="text-sm text-emerald-600">You can now unlock Week 2</p>
              <button
                onClick={() => setCurrentWeek(2)}
                className="mt-3 rounded-xl bg-emerald-600 px-6 py-2 text-sm font-bold text-white"
              >
                Start Week 2 →
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">My Career Pathways</h1>
          <p className="mt-1 text-slate-600">Track your progress toward your dream role</p>
        </div>

        {/* Create New Pathway Button */}
        {!showNewPathway && (
          <button
            onClick={() => setShowNewPathway(true)}
            className="mb-8 w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-white py-6 text-sm font-bold text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-50"
          >
            + Create New Career Pathway
          </button>
        )}

        {/* New Pathway Form */}
        {showNewPathway && !resources && !loading && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
            <h2 className="text-lg font-black text-slate-900">Create New Career Pathway</h2>
            <p className="mt-1 text-sm text-slate-600">Paste the job description you want to prepare for</p>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={8}
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 resize-none"
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleFindResources}
                disabled={!jobDescription}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
              >
                Find My Pathway →
              </button>
              <button
                onClick={() => setShowNewPathway(false)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="font-semibold text-slate-700">{loadingMessage}</p>
          </div>
        )}

        {/* Gap Analysis Screen */}
        {resources && showGapAnalysis && !loading && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
            <h2 className="text-lg font-black text-slate-900">Here's where you stand</h2>
            <p className="mt-1 text-sm text-slate-600">Based on your resume vs this job description</p>

            <div className="mt-6 space-y-6">

              {/* What job requires */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">What this job requires</p>
                <div className="flex flex-wrap gap-2">
                  {resources.gapAnalysis.jobRequires.map((skill, i) => (
                    <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* What user has */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-3">What you already have ✓</p>
                <div className="flex flex-wrap gap-2">
                  {resources.gapAnalysis.userHas.map((skill, i) => (
                    <span key={i} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skill gaps */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-red-500 mb-3">What you need to work on</p>
                <div className="flex flex-wrap gap-2">
                  {resources.gapAnalysis.skillGaps.map((skill, i) => (
                    <span key={i} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                      ✗ {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            <button
              onClick={() => setShowGapAnalysis(false)}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              Find Resources for These Gaps →
            </button>
          </div>
        )}

        {/* Resources Found */}
        {resources && !showGapAnalysis && !loading && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
            <h2 className="text-lg font-black text-slate-900">We found premium resources for you</h2>
            <p className="mt-1 text-sm text-slate-600">Based on your skill gaps: {resources.skillGaps.join(", ")}</p>

            <div className="mt-4 space-y-3">
              {resources.paidCourses.map((course, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-800">{course.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{course.skill}</p>
                  <a href={course.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                    View Course →
                  </a>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm font-semibold text-slate-700">Include these premium courses in your plan?</p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => handleGeneratePlan(true)}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Yes, include them
              </button>
              <button
                onClick={() => handleGeneratePlan(false)}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                No, use free resources
              </button>
            </div>
          </div>
        )}

        {/* Existing Pathways */}
        {pathways.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {pathways.map((pathway) => (
              <div
                key={pathway.roadmapId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-indigo-300 transition"
                onClick={() => {
                  setSelectedPathway(pathway);
                  setCurrentWeek(1);
                }}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Career Pathway</p>
                <p className="mt-2 text-sm font-semibold text-slate-800 line-clamp-2">{pathway.jobDescription}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(pathway.createdAt).toLocaleDateString()}</p>
                <p className="mt-3 text-xs font-bold text-indigo-600">View Pathway →</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}