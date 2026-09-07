"use client";

import { useRouter } from "next/navigation";
import { Radio, ArrowRight, ShieldCheck, Zap, Terminal } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const createNewBox = () => {
    // Generate a clean, random 8-character bucket identifier
    const randomId = Math.random().toString(36).substring(2, 10);
    router.push(`/inspect/${randomId}`);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Navbar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-neutral-900">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-semibold tracking-wide text-sm uppercase text-neutral-300">
            Webhook Inspector
          </span>
        </div>
        <a
          href="https://github.com/ShashankJha2003/webhook-inspector"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-neutral-400 hover:text-white transition-colors"
        >
          GitHub Repository ↗
        </a>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Live Real-Time SSE Pipeline
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Inspect, debug, and replay webhooks instantly.
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mb-10 leading-relaxed">
          Generate an instant HTTP endpoint to catch webhooks from Stripe, GitHub, or any external service. Inspect JSON bodies, inspect headers, and replay requests directly from your terminal.
        </p>

        <button
          onClick={createNewBox}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-medium text-sm transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Create New Webhook URL</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Feature Badges */}
      <footer className="grid grid-cols-1 md:grid-cols-3 border-t border-neutral-900 bg-neutral-900/30">
        <div className="p-6 border-b md:border-b-0 md:border-r border-neutral-900 flex items-start gap-4">
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-neutral-200 mb-1">Zero Latency Streaming</h2>
            <p className="text-xs text-neutral-500 leading-normal">
              Built on Server-Sent Events (SSE) to display incoming payloads immediately without polling.
            </p>
          </div>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r border-neutral-900 flex items-start gap-4">
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-neutral-200 mb-1">Persistent PostgreSQL Storage</h2>
            <p className="text-xs text-neutral-500 leading-normal">
              Payloads, query parameters, and raw headers are stored safely in a relational Neon database.
            </p>
          </div>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-neutral-200 mb-1">One-Click cURL Generator</h2>
            <p className="text-xs text-neutral-500 leading-normal">
              Replay any captured HTTP request against your local dev server with auto-generated cURL syntax.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}