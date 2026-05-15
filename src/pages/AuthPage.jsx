import { useState } from "react";
import { signIn, signUp, confirmSignUp } from "aws-amplify/auth";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await signIn({ username: email, password });
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    setLoading(true);
    setError("");
    try {
      await signUp({
        username: email,
        password,
        options: { userAttributes: { email } }
      });
      setNeedsConfirmation(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmation() {
    setLoading(true);
    setError("");
    try {
      await confirmSignUp({ username: email, confirmationCode });
      await signIn({ username: email, password });
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      mode === "login" ? handleLogin() : handleSignUp();
    }
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-indigo-50">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
          <h1 className="text-2xl font-black text-slate-900">Check your email</h1>
          <p className="mt-2 text-sm text-slate-600">We sent a confirmation code to {email}</p>
          <input
            className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            placeholder="Enter confirmation code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
          />
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <button
            onClick={handleConfirmation}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            {loading ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-indigo-50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_22px_65px_rgba(15,23,42,0.12)]">
        <h1 className="text-2xl font-black text-slate-900">HireReady</h1>
        <p className="mt-1 text-sm text-slate-600">Your AI job prep platform</p>

        <div className="mt-6 flex rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === "login" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Sign Up
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <button
          onClick={mode === "login" ? handleLogin : handleSignUp}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(37,99,235,0.3)] transition hover:scale-[1.02]"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}