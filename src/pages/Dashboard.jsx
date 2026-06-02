import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import GapAnalysisPanel from "../components/GapAnalysisPanel";
import ResourceSelector from "../components/ResourceSelector";
import PathwayCard from "../components/PathwayCard";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [pathways, setPathways] = useState(() => {
    try {
      const saved = localStorage.getItem(`pathways_${user.userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`completedTasks_${user.userId}`) || "{}");
    } catch {
      return {};
    }
  });

  const [showNewPathway, setShowNewPathway] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [resources, setResources] = useState(null);
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);
  const [timeline, setTimeline] = useState(4);
  const [pathwayTitle, setPathwayTitle] = useState("");

  useEffect(() => {
    localStorage.setItem(`pathways_${user.userId}`, JSON.stringify(pathways));
  }, [pathways, user.userId]);

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
    setError("");
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
      setError("Failed to analyze your resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan({ chosenPaid, usePaidCourses }) {
    setLoading(true);
    setError("");
    setLoadingMessage(`Building your personalized ${getTimelineLabel(timeline)} plan...`);
    try {
      const response = await axios.post(`${API_URL}/generate-roadmap`, {
        userId: user.userId,
        jobDescription,
        skillGaps: resources.skillGaps,
        paidCourses: chosenPaid,
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
        paidCourses: chosenPaid.filter(c => c.skill !== "custom"),
        freeVideos: resources.freeVideos,
        usePaidCourses,
        weeks: { 1: response.data.weekPlan },
        createdAt: new Date().toISOString(),
      };

      const newPathways = [newPathway, ...pathways];
      setPathways(newPathways);
      localStorage.setItem(`pathways_${user.userId}`, JSON.stringify(newPathways));
      navigate(`/dashboard/${newPathway.roadmapId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to generate your plan. Please try again.");
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {resources && showGapAnalysis && !loading && (
          <GapAnalysisPanel
            resources={resources}
            onContinue={() => setShowGapAnalysis(false)}
          />
        )}

        {resources && !showGapAnalysis && !loading && (
          <ResourceSelector
            resources={resources}
            onGeneratePlan={handleGeneratePlan}
          />
        )}

        {pathways.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {pathways.map((pathway) => (
              <PathwayCard
                key={pathway.roadmapId}
                pathway={pathway}
                completedTasks={completedTasks}
                onClick={() => navigate(`/dashboard/${pathway.roadmapId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
