"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Trophy, 
  LogOut, 
  TrendingUp, 
  Zap,
  Bell,
  Calendar,
  ChevronRight
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { cn } from "@/src/lib/utils";

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "pending" | "completed" | "missed";
  createdAt: string;
}

interface Stats {
  completedCount: number;
  missedCount: number;
  extraCount: number;
  chartData: { date: string; score: number }[];
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [score, setScore] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notifActive, setNotifActive] = useState(false);
  const { width, height } = useWindowSize();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [extraWork, setExtraWork] = useState("");

  const fetchData = async () => {
    try {
      const [tasksRes, scoreRes, statsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/score"),
        fetch("/api/stats")
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (scoreRes.ok) {
        const data = await scoreRes.json();
        setScore(data.auraScore);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Check for tasks due within 30 mins
    const checkDueSoon = () => {
      const now = new Date();
      const soon = new Date(now.getTime() + 30 * 60000);
      const hasSoon = tasks.some(t => {
        if (!t.dueDate || t.status !== "pending") return false;
        const d = new Date(t.dueDate);
        return d > now && d < soon;
      });
      setNotifActive(hasSoon);
    };
    if (tasks.length > 0) checkDueSoon();
  }, [tasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = date && time ? `${date}T${time}` : date ? date : null;
    
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, dueDate }),
    });

    if (res.ok) {
      setTitle("");
      setDesc("");
      setDate("");
      setTime("");
      fetchData();
    }
  };

  const handleCompleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });

    if (res.ok) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      fetchData();
    }
  };

  const handleCheckOverdue = async () => {
    const res = await fetch("/api/tasks/check-overdue", { method: "POST" });
    if (res.ok) fetchData();
  };

  const handleLogExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraWork) return;
    const res = await fetch("/api/extra-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: extraWork }),
    });
    if (res.ok) {
      setExtraWork("");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      fetchData();
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-indigo-400 font-bold text-2xl"
        >
          Loading Aura...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} gravity={0.2} />}
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 aura-gradient rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold aura-text-gradient glow-text hidden sm:block">Naura</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className={cn("w-6 h-6 text-slate-400 cursor-pointer hover:text-white transition-colors", notifActive && "text-indigo-400")} />
            {notifActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse" />
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-rose-400 transition-all"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-10">
        
        {/* Aura Score Section */}
        <section className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 aura-gradient blur-3xl rounded-full"
              />
              <div className="relative glass-card px-12 py-8 flex flex-col items-center">
                <span className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">Current Aura</span>
                <motion.span 
                  key={score}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-7xl font-black aura-text-gradient glow-text"
                >
                  {score}
                </motion.span>
                <div className="mt-4 flex items-center gap-2 text-indigo-400 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% from yesterday</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Tasks */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Add Task Form */}
            <section className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> New Task
              </h2>
              <form onSubmit={handleAddTask} className="space-y-4">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-300"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-300"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full aura-gradient py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all"
                >
                  Add Task
                </button>
              </form>
            </section>

            {/* Task List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Your Tasks</h2>
                <button 
                  onClick={handleCheckOverdue}
                  className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" /> Check Overdue
                </button>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-card p-4 flex items-center justify-between group hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => task.status === 'pending' && handleCompleteTask(task._id)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            task.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : 
                            task.status === 'missed' ? "bg-rose-500 border-rose-500 text-white" :
                            "border-slate-600 hover:border-indigo-500 text-transparent hover:text-indigo-500"
                          )}
                        >
                          {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : 
                           task.status === 'missed' ? <AlertCircle className="w-4 h-4" /> : 
                           <Circle className="w-4 h-4" />}
                        </button>
                        <div>
                          <h3 className={cn("font-medium", task.status !== 'pending' && "text-slate-500 line-through")}>
                            {task.title}
                          </h3>
                          {task.dueDate && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> 
                              {new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        task.status === 'pending' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                        task.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      )}>
                        {task.status}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                  <div className="text-center py-12 glass-card border-dashed">
                    <p className="text-slate-500">No tasks yet. Start building your aura!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Analytics & Wins */}
          <div className="space-y-8">
            
            {/* Unexpected Wins */}
            <section className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Unexpected Wins
              </h2>
              <p className="text-xs text-slate-400">Did something extra productive? Log it for +1 Aura.</p>
              <form onSubmit={handleLogExtra} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Read 10 pages"
                  value={extraWork}
                  onChange={(e) => setExtraWork(e.target.value)}
                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
                <button 
                  type="submit"
                  className="p-2 bg-amber-500 rounded-xl text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">{stats?.completedCount || 0}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Missed</p>
                <p className="text-2xl font-bold text-rose-400">{stats?.missedCount || 0}</p>
              </div>
            </section>

            {/* Analytics Chart */}
            <section className="glass-card p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> Aura Growth
              </h2>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.chartData || []}>
                    <XAxis 
                      dataKey="date" 
                      hide 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#818cf8' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {(stats?.chartData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#818cf8' : '#334155'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span>7 Days Ago</span>
                <span>Today</span>
              </div>
            </section>

            {/* Extra Logs List */}
            <section className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-400" /> Recent Wins
              </h2>
              <div className="space-y-3">
                {stats?.extraCount === 0 ? (
                  <p className="text-xs text-slate-500 italic">No extra logs yet.</p>
                ) : (
                  <div className="text-xs text-slate-400 space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span>Total Extra Logs</span>
                      <span className="font-bold text-indigo-400">{stats?.extraCount}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
