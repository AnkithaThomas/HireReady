import { useState } from "react";

export default function ResourceSelector({ resources, onGeneratePlan }) {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [customCourses, setCustomCourses] = useState([]);
  const [customCourseName, setCustomCourseName] = useState("");
  const [customCourseUrl, setCustomCourseUrl] = useState("");

  function toggleCourse(index) {
    setSelectedCourses(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  }

  function handleAddCustomCourse() {
    if (!customCourseName || !customCourseUrl) return;
    setCustomCourses(prev => [...prev, { title: customCourseName, link: customCourseUrl, skill: "custom" }]);
    setCustomCourseName("");
    setCustomCourseUrl("");
  }

  const chosenPaid = resources.paidCourses.filter((_, i) => selectedCourses.includes(i));

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
      <h2 className="text-lg font-black text-slate-900">We found premium resources for you</h2>
      <p className="mt-1 text-sm text-slate-600">Select the courses you want included in your plan</p>

      <div className="mt-4 space-y-3">
        {resources.paidCourses.map((course, i) => (
          <div
            key={i}
            onClick={() => toggleCourse(i)}
            className={`rounded-xl border p-3 cursor-pointer transition ${selectedCourses.includes(i) ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}
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
                  onClick={() => setCustomCourses(prev => prev.filter((_, idx) => idx !== i))}
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
          onClick={() => onGeneratePlan({ chosenPaid: [...chosenPaid, ...customCourses], customCourses, usePaidCourses: true })}
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Build My Plan →
        </button>
        <button
          onClick={() => onGeneratePlan({ chosenPaid: customCourses, customCourses, usePaidCourses: false })}
          className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Use free resources only
        </button>
      </div>
    </div>
  );
}
