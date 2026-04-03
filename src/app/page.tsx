"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import Cookies from "js-cookie";

export default function LandingPage() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordTaken, setIsPasswordTaken] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const router = useRouter();

  // Live password check for new users
  useEffect(() => {
    if (!isNewUser || !password) {
      setIsPasswordTaken(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingPassword(true);
      try {
        const res = await fetch("/api/auth/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        setIsPasswordTaken(data.exists);
      } catch (err) {
        console.error("Check error:", err);
      } finally {
        setCheckingPassword(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [password, isNewUser]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isNewUser && (password !== confirmPassword || isPasswordTaken)) {
      if (isPasswordTaken) {
        setError("Password already taken. Please choose another.");
      } else {
        setError("Passwords do not match");
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isNewUser ? "register" : "login",
          password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8"
      >
        <div className="space-y-2">
          <motion.h1
            className="text-5xl md:text-7xl font-bold glow-text aura-text-gradient"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            Naura
          </motion.h1>
          <p className="text-slate-400 text-lg tracking-widest uppercase">Build Your Aura</p>
        </div>

        <motion.div
          className="glass-card p-8 w-full max-w-md mx-auto space-y-6"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="flex bg-slate-900/50 rounded-lg p-1">
              <button
                type="button"
                onClick={() => { setIsNewUser(false); setError(""); }}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${!isNewUser ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-300'}`}
              >
                Returning User
              </button>
              <button
                type="button"
                onClick={() => { setIsNewUser(true); setError(""); }}
                className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${isNewUser ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-300'}`}
              >
                New User
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required
                />
                {isNewUser && password && (
                  <div className="mt-1 flex items-center gap-2 px-1">
                    {checkingPassword ? (
                      <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    ) : isPasswordTaken ? (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-500" />
                        <span className="text-[10px] text-rose-500 font-medium">Password taken</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] text-emerald-500 font-medium">Password available</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {isNewUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-slate-400 ml-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    required={isNewUser}
                  />
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full aura-gradient py-3 rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (isNewUser ? "Creating Account..." : "Unlocking...") : (
                <>
                  {isNewUser ? "Create Account" : "Unlock"} <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>

            {error && <p className="text-rose-400 text-sm">{error}</p>}
          </form>
        </motion.div>
      </motion.div>
    </main>
  );
}
