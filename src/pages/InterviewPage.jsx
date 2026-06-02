import { useEffect, useRef, useState } from "react";

export default function InterviewPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    }

    startCamera();

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startRecording = () => {
    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(streamRef.current);

    mediaRecorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    setAnswered(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-black text-slate-900 mb-6 text-center">Mock Interview</h1>

        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-500 mb-2">Question</p>
          <p className="text-base font-semibold text-slate-800">
            Tell me about a time you had to learn something quickly to complete a project.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-[0_22px_65px_rgba(15,23,42,0.12)] bg-black">
          <video ref={videoRef} autoPlay muted className="w-full aspect-video object-cover" />
        </div>

        <div className="mt-4 flex justify-center">
          {!recording ? (
            <button
              onClick={startRecording}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="rounded-xl bg-red-500 px-8 py-3 text-sm font-bold text-white transition hover:bg-red-600"
            >
              Stop Recording
            </button>
          )}
        </div>

        {recordedUrl && (
          <div className="mt-8">
            <p className="text-sm font-bold text-slate-700 mb-3 text-center">Your answer — watch it back</p>
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-black">
              <video src={recordedUrl} controls className="w-full aspect-video object-cover" />
            </div>
          </div>
        )}

        {answered && recordedUrl && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => console.log("Submit answer — transcription coming in Phase 4")}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              Submit Answer →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
