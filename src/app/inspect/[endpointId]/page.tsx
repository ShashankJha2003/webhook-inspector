"use client";

import { useEffect, useState, use } from "react";
import { Copy, Check, RefreshCw, Radio, Terminal } from "lucide-react";

interface WebhookEvent {
  id: string;
  method: string;
  headers: Record<string, string>;
  queryParams: Record<string, string> | null;
  body: any;
  rawBody: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function InspectorPage({
  params,
}: {
  params: Promise<{ endpointId: string }>;
}) {
  const { endpointId } = use(params);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  // Set the webhook URL on the client to avoid hydration mismatch
  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/hook/${endpointId}`);
  }, [endpointId]);

  // Fetch historic events for this endpoint
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${endpointId}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        if (data.length > 0 && !selectedEvent) {
          setSelectedEvent(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCurl = (event: WebhookEvent) => {
    let curl = `curl -X ${event.method} "${webhookUrl}"`;

    Object.entries(event.headers).forEach(([key, val]) => {
      if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
        curl += ` \\\n  -H "${key}: ${val}"`;
      }
    });

    if (event.body) {
      curl += ` \\\n  -d '${JSON.stringify(event.body)}'`;
    } else if (event.rawBody) {
      curl += ` \\\n  -d '${event.rawBody}'`;
    }

    return curl;
  };

  const copyCurlToClipboard = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(generateCurl(selectedEvent));
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  useEffect(() => {
    fetchEvents();

    const eventSource = new EventSource(`/api/events/${endpointId}/sse`);

    eventSource.onmessage = (e) => {
      try {
        const newEvent: WebhookEvent = JSON.parse(e.data);
        setEvents((prev) => [newEvent, ...prev]);
        setSelectedEvent((prev) => prev ?? newEvent);
      } catch (err) {
        console.error("Failed to parse incoming SSE payload:", err);
      }
    };

    eventSource.onerror = () => {
      // Browsers attempt auto-reconnects on drop; suppress noisy logs during hot reload
    };

    return () => {
      eventSource.close();
    };
  }, [endpointId]);

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide uppercase text-neutral-400">
              Webhook Inspector
            </h1>
            <p className="text-xs text-neutral-500">Box ID: {endpointId}</p>
          </div>
        </div>

        {/* Copy Webhook URL Bar */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1.5 text-xs">
          <span className="text-neutral-500 font-mono select-none">POST</span>
          <code className="text-neutral-300 font-mono min-w-[280px]">
            {webhookUrl || "Loading endpoint..."}
          </code>
          <button
            onClick={copyToClipboard}
            className="ml-2 p-1 hover:text-emerald-400 transition-colors"
            title="Copy webhook URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Events Feed */}
        <aside className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-900/20">
          <div className="flex items-center justify-between p-3 border-b border-neutral-800">
            <span className="text-xs font-medium text-neutral-400">
              Requests ({events.length})
            </span>
            <button
              onClick={fetchEvents}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
              title="Refresh requests"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60">
            {events.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                Waiting for incoming webhooks...
              </div>
            ) : (
              events.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 ${
                      isSelected
                        ? "bg-neutral-800 text-white"
                        : "hover:bg-neutral-800/40 text-neutral-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-emerald-400">
                        {evt.method}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-xs truncate font-mono text-neutral-300">
                      {evt.ipAddress ?? "unknown"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Event Detail Inspector */}
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-950">
          {selectedEvent ? (
            <div className="max-w-4xl flex flex-col gap-6">
              {/* Replay / Action Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    {selectedEvent.method}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    ID: {selectedEvent.id}
                  </span>
                </div>
                <button
                  onClick={copyCurlToClipboard}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-300 transition-colors"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">cURL Copied!</span>
                    </>
                  ) : (
                    <>
                      <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy as cURL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Event Metadata Banner */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-500 block mb-1">Status</span>
                  <span className="text-emerald-400 font-mono font-medium">201 Created</span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-1">Received At</span>
                  <span className="font-mono text-neutral-300">
                    {new Date(selectedEvent.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block mb-1">Origin IP</span>
                  <span className="font-mono text-neutral-300">
                    {selectedEvent.ipAddress ?? "unknown"}
                  </span>
                </div>
              </div>

              {/* Parsed JSON Body */}
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Payload Body
                </h3>
                <pre className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                  {selectedEvent.body
                    ? JSON.stringify(selectedEvent.body, null, 2)
                    : selectedEvent.rawBody || "(Empty Body)"}
                </pre>
              </section>

              {/* Request Headers */}
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Headers
                </h3>
                <div className="rounded-lg bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/60 font-mono text-xs overflow-hidden">
                  {Object.entries(selectedEvent.headers).map(([k, v]) => (
                    <div key={k} className="flex px-4 py-2 hover:bg-neutral-800/30">
                      <span className="w-1/3 text-neutral-400 truncate">{k}</span>
                      <span className="w-2/3 text-neutral-200 truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
              <Terminal className="w-8 h-8 opacity-40" />
              <p className="text-sm">Select a request from the left sidebar to inspect details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}