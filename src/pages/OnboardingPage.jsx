import { useState } from "react";
import axios from "axios";

const API_URL = "https://hsztv5hu12.execute-api.us-east-2.amazonaws.com";

export default function OnboardingPage({ user, onComplete }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!resumeFile) {
      setError("Please upload your resume");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const base64 = await convertToBase64(resumeFile);

      await axios.post(`${API_URL}/upload-resume`, {
        userId: user.userId,
        email: user.signInDetails.loginId,
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
        <h1 className="text-2xl font-black text-slate-900">Upload your resume</h1>
        <p className="mt-1 text-sm text-slate-600">We'll use this to personalize every job pathway you create</p>

        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-700">Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
          {resumeFile && <p className="mt-1 text-xs text-emerald-600">✓ {resumeFile.name} selected</p>}
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(37,99,235,0.3)] transition hover:scale-[1.02]"
        >
          {loading ? "Uploading..." : "Get Started →"}
        </button>
      </div>
    </div>
  );
}