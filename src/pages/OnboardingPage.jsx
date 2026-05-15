import { useState } from "react";
import axios from "axios";

const API_URL = "https://hsztv5hu12.execute-api.us-east-2.amazonaws.com";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Engineer",
  "Machine Learning Engineer",
  "Mobile Developer (iOS)",
  "Mobile Developer (Android)",
  "React Native Developer",
  "Cloud Engineer",
  "Security Engineer",
  "QA Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Embedded Systems Engineer",
  "Game Developer",
  "Blockchain Developer",
  "Other",
];

function getTimelineLabel(weeks) {
  if (weeks === 1) return "1 week";
  if (weeks < 4) return `${weeks} weeks`;
  if (weeks === 4) return "1 month";
  if (weeks < 8) return `${Math.round(weeks / 4)} months`;
  if (weeks === 8) return "2 months";
  if (weeks === 12) return "3 months";
  if (weeks === 16) return "4 months";
  if (weeks === 20) return "5 months";
  if (weeks === 24) return "6 months";
  if (weeks === 36) return "9 months";
  if (weeks === 52) return "1 year";
  return `${weeks} weeks`;
}

export default function OnboardingPage({ user, onComplete }) {
  const [targetRole, setTargetRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [timeline, setTimeline] = useState(4);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const finalRole = targetRole === "Other" ? customRole : targetRole;

    if (!finalRole || !experienceLevel || !resumeFile) {
      setError("Please fill in all fields and upload your resume");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const base64 = await convertToBase64(resumeFile);

      await axios.post(`${API_URL}/upload-resume`, {
        userId: user.userId,
        email: user.signInDetails.loginId,
        targetRole: finalRole,
        timeline: getTimelineLabel(timeline),
        experienceLevel,
        fileContent: base64,
        fileName: resumeFile.name,
      });

      onComplete();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
        <h1 className="text-2xl font-black text-slate-900">Let's set up your profile</h1>
        <p className="mt-1 text-sm text-slate-600">This helps us personalize your roadmaps</p>

        <div className="mt-6 space-y-6">

          {/* Target Role */}
          <div>
            <label className="text-sm font-semibold text-slate-700">What role are you targeting?</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {targetRole === "Other" && (
              <input
                placeholder="Type your role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Timeline Slider */}
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

          {/* Experience Level */}
          <div>
            <label className="text-sm font-semibold text-slate-700">What level are you targeting?</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Select a level</option>
              <option value="internship">Internship</option>
              <option value="new grad">New Grad</option>
              <option value="junior">Junior (1-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
            </select>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="text-sm font-semibold text-slate-700">Upload your resume (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
            {resumeFile && <p className="mt-1 text-xs text-emerald-600">✓ {resumeFile.name} selected</p>}
          </div>

        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(37,99,235,0.3)] transition hover:scale-[1.02]"
        >
          {loading ? "Setting up your profile..." : "Get Started"}
        </button>
      </div>
    </div>
  );
}