export default function GapAnalysisPanel({ resources, onContinue }) {
  return (
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
        onClick={onContinue}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
      >
        Find Resources for These Gaps →
      </button>
    </div>
  );
}
