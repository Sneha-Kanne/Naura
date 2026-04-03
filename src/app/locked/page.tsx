import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function LockedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="p-6 rounded-full bg-rose-500/10 border border-rose-500/20">
        <ShieldAlert className="w-12 h-12 text-rose-400" />
      </div>
      <h1 className="text-4xl font-bold text-rose-400">Access Denied</h1>
      <p className="text-slate-400 max-w-md">
        The password you entered is incorrect. Your aura remains locked.
      </p>
      <Link 
        href="/"
        className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
      >
        Try Again
      </Link>
    </main>
  );
}
