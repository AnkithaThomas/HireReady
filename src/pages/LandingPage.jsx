const features = [
  {
    title: "AI Skill Gap Analysis",
    description: "See exactly which skills are missing for your target role, ranked by impact.",
    icon: SkillGapIcon,
  },
  {
    title: "Week by Week Study Plan",
    description: "Follow a realistic plan with weekly goals, milestones, and interview checkpoints.",
    icon: CalendarIcon,
  },
  {
    title: "Curated Resources",
    description: "Get direct links to YouTube, Coursera, and freeCodeCamp content for every topic.",
    icon: ResourcesIcon,
  },
];

const steps = ["Upload Resume", "Paste Job Description", "Get Your Roadmap"];

const roadmapPreview = [
  {
    week: "Week 1",
    focus: "Foundations",
    tasks: ["Resume keyword alignment", "Core concept refresh", "Gap baseline quiz"],
  },
  {
    week: "Week 2",
    focus: "Build & Practice",
    tasks: ["Portfolio project sprint", "Targeted skill drills", "Mock interview set 1"],
  },
  {
    week: "Week 3",
    focus: "Interview Ready",
    tasks: ["Behavioral story prep", "System design review", "Offer-readiness checklist"],
  },
];

export default function LandingPage({ onShowAuth }) {
  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-indigo-200/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-200/50 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-sky-200 bg-sky-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-sky-700">
              AI Job Prep Platform
            </p>
            <h1 className="text-5xl font-black leading-[0.98] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              HireReady
            </h1>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Land Your Dream Job, Faster
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Paste any job description and get a personalized AI study roadmap based on your resume.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button onClick={onShowAuth} className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(37,99,235,0.3)] transition hover:scale-[1.02]">
                  Get Started Free
              </button>
              <button className="rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                See How It Works
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_22px_65px_rgba(15,23,42,0.12)] sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">Sample AI Roadmap</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Tailored</span>
            </div>

            <div className="space-y-3">
              {roadmapPreview.map((item) => (
                <article
                  key={item.week}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-indigo-700">{item.week}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.focus}</p>
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {item.tasks.map((task) => (
                      <li key={task} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Features</p>
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Built for focused, high-confidence preparation
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-cyan-100 to-indigo-100 p-3 text-indigo-700">
                  <feature.icon />
                </div>
                <h4 className="text-lg font-bold text-slate-900">{feature.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:px-10">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">How it works</h3>
            <p className="mt-2 text-slate-600">From resume upload to ready-to-execute roadmap in minutes.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-700">{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 pb-10">
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-cyan-100 via-white to-indigo-100 px-6 py-12 text-center sm:px-10">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Ready to get the job?</h3>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Start with your resume and let HireReady build your personalized plan in under a minute.
            </p>
            <button onClick={onShowAuth} className="mt-7 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(79,70,229,0.28)] transition hover:bg-indigo-700">
              Get Started
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function SkillGapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5" aria-hidden="true">
      <path d="M4 19h16" />
      <path d="M6 16l4-5 3 3 5-7" />
      <path d="M6 6h.01M10 6h.01M14 6h.01M18 6h.01" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" />
      <path d="M8 13h3M13 13h3M8 17h3" />
    </svg>
  );
}

function ResourcesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5" aria-hidden="true">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" />
      <path d="M9 9.5h6M9 13h6M9 16.5h3.5" />
    </svg>
  );
}
