export default function PathwayCard({ pathway, completedTasks, onClick }) {
  const totalTasks = Object.values(pathway.weeks).reduce(
    (acc, week) => acc + week.days.reduce((a, day) => a + day.tasks.length, 0), 0
  );
  const completedCount = Object.values(pathway.weeks).reduce(
    (acc, week) => acc + week.days.reduce(
      (a, day) => a + day.tasks.filter((_, ti) => completedTasks[`w${week.week}d${day.day}-${ti}`]).length, 0
    ), 0
  );
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-indigo-300 transition"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Career Pathway</p>
      <p className="mt-2 text-lg font-black text-slate-900">{pathway.title || pathway.targetRole}</p>
      <p className="mt-1 text-xs text-slate-500">{pathway.timeline} prep · {pathway.experienceLevel}</p>
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
}
