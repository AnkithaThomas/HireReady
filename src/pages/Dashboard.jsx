import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://hsztv5hu12.execute-api.us-east-2.amazonaws.com";

export default function Dashboard({ user, onLogout }) {
  const [pathways, setPathways] = useState(() => {
    try {
      const saved = localStorage.getItem(`pathways_${user.userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNewPathway, setShowNewPathway] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [resources, setResources] = useState(null);
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`completedTasks_${user.userId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [customCourses, setCustomCourses] = useState([]);
  const [customCourseName, setCustomCourseName] = useState("");
  const [customCourseUrl, setCustomCourseUrl] = useState("");
  const [timeline, setTimeline] = useState(4);
  const [pathwayTitle, setPathwayTitle] = useState("");

  useEffect(() => {
    localStorage.setItem(`pathways_${user.userId}`, JSON.stringify(pathways));
  }, [pathways, user.userId]);

  useEffect(() => {
    localStorage.setItem(`completedTasks_${user.userId}`, JSON.stringify(completedTasks));
  }, [completedTasks, user.userId]);

  function getTimelineLabel(weeks) {
    if (weeks === 1) return "1 week";
    if (weeks < 4) return `${weeks} weeks`;
    if (weeks === 4) return "1 month";
    if (weeks === 12) return "3 months";
    if (weeks === 24) return "6 months";
    if (weeks === 52) return "1 year";
    return `${weeks} weeks`;
  }

  async function handleFindResources() {
    if (!jobDescription) return;
    setLoading(true);
    setLoadingMessage("Analyzing your resume and finding resources...");
    try {
      const response = await axios.post(`${API_URL}/find-resources`, {
        userId: user.userId,
        jobDescription,
        timeline: getTimelineLabel(timeline),
      });
      setResources(response.data);
      setPathwayTitle(response.data.title || "Career Pathway");
      setShowGapAnalysis(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan(usePaidCourses) {
    setLoading(true);
    setLoadingMessage(`Building your personalized ${getTimelineLabel(timeline)} plan...`);
    try {
      const response = await axios.post(`${API_URL}/generate-roadmap`, {
        userId: user.userId,
        jobDescription,
        skillGaps: resources.skillGaps,
        paidCourses: usePaidCourses
          ? [
              ...resources.paidCourses.filter((_, i) => selectedCourses.includes(i)),
              ...customCourses,
            ]
          : customCourses,
        freeVideos: resources.freeVideos,
        usePaidCourses,
        weekNumber: 1,
        roadmapId: null,
        targetRole: resources.gapAnalysis.targetRole,
        experienceLevel: resources.gapAnalysis.experienceLevel,
        timeline: getTimelineLabel(timeline),
      });

      const newPathway = {
        roadmapId: response.data.roadmapId,
        jobDescription,
        title: pathwayTitle,
        targetRole: resources.gapAnalysis.targetRole,
        experienceLevel: resources.gapAnalysis.experienceLevel,
        timeline: getTimelineLabel(timeline),
        totalWeeks: response.data.totalWeeks,
        skillGaps: resources.skillGaps,
        paidCourses: resources.paidCourses.filter((_, i) => selectedCourses.includes(i)),
        freeVideos: resources.freeVideos,
        usePaidCourses,
        weeks: { 1: response.data.weekPlan },
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

  async function handleWeekClick(weekNum) {
  setCurrentWeek(weekNum);
  
  if (selectedPathway.weeks[weekNum]) return; // already generated
  
  setLoading(true);
  setLoadingMessage(`Generating Week ${weekNum}...`);
  
  try {
    const response = await axios.post(`${API_URL}/generate-roadmap`, {
      userId: user.userId,
      jobDescription: selectedPathway.jobDescription,
      skillGaps: selectedPathway.skillGaps,
      paidCourses: selectedPathway.paidCourses || [],
      freeVideos: selectedPathway.freeVideos || [],
      usePaidCourses: selectedPathway.usePaidCourses || false,
      weekNumber: weekNum,
      roadmapId: selectedPathway.roadmapId,
    });

    setSelectedPathway(prev => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [weekNum]: response.data.weekPlan,
      }
    }));
  } catch (err) {
    console.error(err);
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

  function isWeekComplete(week) {
    return week.days.every(day => isDayComplete(`w${week.week}d${day.day}`, day.tasks));
  }

  function toggleCourse(index) {
    setSelectedCourses(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  }

  function handleAddCustomCourse() {
    if (!customCourseName || !customCourseUrl) return;
    setCustomCourses([...customCourses, {
      title: customCourseName,
      link: customCourseUrl,
      skill: "custom",
    }]);
    setCustomCourseName("");
    setCustomCourseUrl("");
  }

  if (selectedPathway) {
  const totalWeeks = selectedPathway.totalWeeks;
  const currentWeekData = selectedPathway.weeks[currentWeek];
  const isCurrentWeekDone = currentWeekData ? isWeekComplete(currentWeekData) : false;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setSelectedPathway(null)}
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

          {/* Week Navigation */}
          <div className="mb-6 flex items-center justify-center gap-3 flex-wrap">
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((weekNum) => (
              <button
                key={weekNum}
                onClick={() => handleWeekClick(weekNum)}
                className={`rounded-xl px-6 py-2 text-sm font-bold transition ${currentWeek === weekNum ? "bg-indigo-600 text-white" : selectedPathway.weeks[weekNum] ? "border border-slate-300 text-slate-600 hover:border-indigo-400" : "border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400"}`}
              >
                Week {weekNum} {!selectedPathway.weeks[weekNum] && "→"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {!currentWeekData ? (
              <div className="col-span-7 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="font-semibold text-slate-700">Generating Week {currentWeek}...</p>
                <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">My Career Pathways</h1>
            <p className="mt-1 text-slate-600">Track your progress toward your dream role</p>
          </div>
          <button
            onClick={onLogout}
            className="text-sm font-semibold text-slate-400 hover:text-slate-700"
          >
            Sign out
          </button>
        </div>

        {!showNewPathway && (
          <button
            onClick={() => setShowNewPathway(true)}
            className="mb-8 w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-white py-6 text-sm font-bold text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-50"
          >
            + Create New Career Pathway
          </button>
        )}

        {showNewPathway && !resources && !loading && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
            <h2 className="text-lg font-black text-slate-900">Create New Career Pathway</h2>
            <p className="mt-1 text-sm text-slate-600">Tell us about this specific role you're targeting</p>

            <div className="mt-4 space-y-4">

              {/* Timeline */}
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Prep timeline — <span className="text-indigo-600">{getTimelineLabel(timeline)}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={52}
                  step={1}
                  value={timeline}
                  onChange={(e) => setTimeline(Number(e.target.value))}
                  className="mt-2 w-full accent-indigo-600"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>1 week</span>
                  <span>6 months</span>
                  <span>1 year</span>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="text-sm font-semibold text-slate-700">Paste the job description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={6}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

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

        {loading && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="font-semibold text-slate-700">{loadingMessage}</p>
          </div>
        )}

        {resources && showGapAnalysis && !loading && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
            <h2 className="text-lg font-black text-slate-900">Here's where you stand</h2>
            <p className="mt-1 text-sm text-slate-600">We analyzed your resume against this job description</p>
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">What this job is looking for</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  This role requires knowledge of <strong>{resources.gapAnalysis.jobRequires.join(", ")}</strong>.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-2">Skills you bring to this role</p>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  <strong>{resources.gapAnalysis.userHas.join(", ")}</strong>
                </p>
              </div>
              <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-2">Focus on these to close the gap</p>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  <strong>{resources.gapAnalysis.skillGaps.join(", ")}</strong>
                </p>
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

        {resources && !showGapAnalysis && !loading && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
            <h2 className="text-lg font-black text-slate-900">We found premium resources for you</h2>
            <p className="mt-1 text-sm text-slate-600">Select the courses you want included in your plan</p>
            <div className="mt-4 space-y-3">
              {resources.paidCourses.map((course, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 cursor-pointer transition ${selectedCourses.includes(i) ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}
                  onClick={() => toggleCourse(i)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(i)}
                      onChange={() => toggleCourse(i)}
                      className="mt-0.5 accent-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{course.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{course.skill}</p>
                      <a
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Course →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Add your own course</p>
              <div className="flex gap-2">
                <input
                  placeholder="Course name"
                  value={customCourseName}
                  onChange={(e) => setCustomCourseName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
                <input
                  placeholder="URL"
                  value={customCourseUrl}
                  onChange={(e) => setCustomCourseUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddCustomCourse}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Add
                </button>
              </div>
              {customCourses.length > 0 && (
                <div className="mt-3 space-y-2">
                  {customCourses.map((course, i) => (
                    <div key={i} className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{course.title}</p>
                        <a href={course.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                          {course.link}
                        </a>
                      </div>
                      <button
                        onClick={() => setCustomCourses(customCourses.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleGeneratePlan(true)}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Build My Plan →
              </button>
              <button
                onClick={() => handleGeneratePlan(false)}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Use free resources only
              </button>
            </div>
          </div>
        )}

        {pathways.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {pathways.map((pathway) => {
              // Calculate progress
              const totalTasks = Object.values(pathway.weeks).reduce((acc, week) => 
                acc + week.days.reduce((a, day) => a + day.tasks.length, 0), 0
              );
              const completedCount = Object.values(pathway.weeks).reduce((acc, week) =>
                acc + week.days.reduce((a, day) =>
                  a + day.tasks.filter((_, ti) => 
                    completedTasks[`w${week.week}d${day.day}-${ti}`]
                  ).length, 0
                ), 0
              );
              const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

              return (
                <div
                  key={pathway.roadmapId}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-indigo-300 transition"
                  onClick={() => {
                    setSelectedPathway(pathway);
                    setCurrentWeek(1);
                  }}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Career Pathway</p>
                  <p className="mt-2 text-lg font-black text-slate-900">{pathway.title || pathway.targetRole}</p>
                  <p className="mt-1 text-xs text-slate-500">{pathway.timeline} prep · {pathway.experienceLevel}</p>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{completedCount} of {totalTasks} tasks complete</p>
                  </div>

                  <p className="mt-3 text-xs font-bold text-indigo-600">View Pathway →</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}