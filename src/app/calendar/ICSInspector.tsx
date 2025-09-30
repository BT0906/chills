'use client';

import React, { useMemo, useState } from "react";
import IcalExpander from "ical-expander";
import ICAL from "ical.js";
import { DateTime } from "luxon"; 

/**
 * Quick-start notes
 * 1) Install deps:
 *    npm i ical.js ical-expander luxon
 * 2) Drop <ICSInspector/> anywhere in your app.
 * 3) Many public .ics endpoints block cross-origin requests. If you get CORS errors,
 *    point the URL at your own tiny proxy (same-origin), then fetch the remote ICS server-side.
 *    (Example proxy idea)
 *      // /api/ics?url=ENCODED
 *      export async function GET(req) {
 *        const url = new URL(req.url).searchParams.get('url');
 *        if (!url) return new Response('Missing url', { status: 400 });
 *        const res = await fetch(url, { headers: { 'User-Agent': 'ICS Debugger' } });
 *        return new Response(await res.text(), {
 *          headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store' }
 *        });
 *      }
 */

// Simple helper to coerce webcal:// to https://
function normalizeIcsUrl(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("webcal://")) return "https://" + trimmed.slice("webcal://".length);
  return trimmed;
}

// Convert ical.js time to a Luxon DateTime in the user's local zone
function icalTimeToLuxon(t: any): DateTime | null {
  try {
    // ical-expander uses ICAL.Time; convert safely
    if (!t) return null;
    const jsDate = (t as any).toJSDate ? (t as any).toJSDate() : null;
    return jsDate ? DateTime.fromJSDate(jsDate) : null;
  } catch {
    return null;
  }
}

// Format a DateTime nicely, with timezone hint
function fmt(dt: DateTime | null) {
  return dt ? dt.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) + ` (${dt.zoneName})` : "—";
}

// Naive safety: limit ICS size so users can't paste a gigantic feed
const MAX_ICS_BYTES = 2_000_000; // ~2MB

export default function ICSInspector() {
  const [url, setUrl] = useState("");
  const [rangeDays, setRangeDays] = useState(90);
  const [rawIcs, setRawIcs] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const normalizedUrl = useMemo(() => normalizeIcsUrl(url), [url]);

  const now = DateTime.now();
  const rangeStart = now.minus({ days: 7 }); // include a week of history for context
  const rangeEnd = now.plus({ days: rangeDays });

  const parsed = useMemo(() => {
    if (!rawIcs) return null;
    try {
      // Validate that it looks like an ICS
      if (!/BEGIN:VCALENDAR/i.test(rawIcs)) throw new Error("This doesn't look like a .ics file.");

      // Build a master component for raw debug info
      const jcal = ICAL.parse(rawIcs);
      const comp = new ICAL.Component(jcal);
      const calendarProps = comp.getAllProperties().map(p => ({ name: p.name, value: p.getFirstValue() }));

      const expander = new IcalExpander({
        ics: rawIcs,
        maxIterations: 2000,
        skipInvalidDates: true,
      });

      const expanded = expander.between(rangeStart.toJSDate(), rangeEnd.toJSDate());

      // Occurrences (from recurring rules) and standalone events
      const items = [
        ...expanded.events.map(e => ({
          type: "single" as const,
          uid: e.uid,
          summary: e.summary,
          description: e.description,
          location: e.location,
          start: icalTimeToLuxon((e as any).startDate),
          end: icalTimeToLuxon((e as any).endDate),
          allDay: (e as any).startDate?.isDate,
        })),
        ...expanded.occurrences.map(o => ({
          type: "occurrence" as const,
          uid: o.item.uid,
          summary: o.item.summary,
          description: o.item.description,
          location: o.item.location,
          start: icalTimeToLuxon(o.startDate),
          end: icalTimeToLuxon(o.endDate),
          allDay: (o.startDate as any)?.isDate,
        })),
      ].sort((a, b) => (a.start?.toMillis() || 0) - (b.start?.toMillis() || 0));

      return { items, calendarProps };
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to parse .ics");
      return null;
    }
  }, [rawIcs, rangeStart.toISO(), rangeEnd.toISO()]);

  async function handleFetch() {
    setError(null);
    setLoading(true);
    setRawIcs(null);
    try {
      if (!normalizedUrl) throw new Error("Enter an .ics URL first");
      // Basic scheme allowlist
      if (!/^https?:\/\//i.test(normalizedUrl)) throw new Error("Only http(s) URLs are supported");

      // replace the fetch(normalizedUrl, ...) with:
      const proxied = `/api/ics?url=${encodeURIComponent(normalizedUrl)}`;
      const res = await fetch(proxied, {
        method: "GET",
        headers: { Accept: "text/calendar, text/plain; q=0.8, */*; q=0.1" },
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);

      const reader = res.body?.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            total += value.byteLength;
            if (total > MAX_ICS_BYTES) throw new Error("ICS file too large (>2MB)");
            chunks.push(value);
          }
        }
        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(Buffer.concat(chunks as any));
        setRawIcs(text);
      } else {
        const text = await res.text();
        if (text.length > MAX_ICS_BYTES) throw new Error("ICS file too large (>2MB)");
        setRawIcs(text);
      }
    } catch (err: any) {
      const msg = (err?.message || "Failed to fetch");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">ICS Inspector (React + TS)</h1>
      <p className="text-sm opacity-80">
        Paste a public .ics link. Supports recurring events and basic timezone handling. For many providers you may need a
        same-origin proxy to avoid CORS blocks.
      </p>

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <div className="space-y-2">
          <label className="block text-sm font-medium">.ics URL</label>
          <input
            className="w-full rounded-xl border p-3"
            placeholder="https://example.com/calendar.ics or webcal://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={loading}
          className="h-11 px-4 rounded-xl bg-foreground text-background disabled:opacity-50"
        >
          {loading ? "Fetching…" : "Fetch & Parse"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm">Show next</label>
        <input
          type="number"
          min={1}
          max={365}
          value={rangeDays}
          onChange={(e) => setRangeDays(Number(e.target.value) || 1)}
          className="w-24 rounded-lg border p-2"
        />
        <span className="text-sm">days</span>
        <span className="text-sm opacity-60">(plus 7 days of history)</span>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500 bg-red-70 p-4 text-sm">
          <div className="font-semibold">Error</div>
          <div>{error}</div>
          <div className="mt-2 opacity-80">
            If this is a CORS error, fetch the ICS server-side (same-origin) and pass it to the browser.
          </div>
        </div>
      )}

      {rawIcs && (
        <details className="rounded-xl border p-4" open>
          <summary className="cursor-pointer select-none font-semibold">Raw .ics (debug)</summary>
          <pre className="mt-3 overflow-auto max-h-64 text-xs leading-relaxed whitespace-pre-wrap">{rawIcs}</pre>
        </details>
      )}

      {parsed && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Expanded Events</h2>
          <div className="rounded-xl border overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-700">
                <tr>
                  <th className="text-left p-2">When (start → end)</th>
                  <th className="text-left p-2">Summary</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">All‑day</th>
                  <th className="text-left p-2">UID</th>
                </tr>
              </thead>
              <tbody>
                {parsed.items.map((ev, i) => (
                  <tr key={i} className={i % 2 ? "bg-slate-800/80" : "bg-slate-800"}>
                    <td className="p-2 align-top">
                      <div>{fmt(ev.start)}</div>
                      <div className="opacity-70">→ {fmt(ev.end)}</div>
                    </td>
                    <td className="p-2 align-top">
                      <div className="font-medium">{ev.summary || <span className="opacity-60">(no title)</span>}</div>
                      {ev.description && (
                        <div className="opacity-70 line-clamp-3 whitespace-pre-wrap">{ev.description}</div>
                      )}
                    </td>
                    <td className="p-2 align-top">{ev.location || "—"}</td>
                    <td className="p-2 align-top">{ev.type}</td>
                    <td className="p-2 align-top">{ev.allDay ? "Yes" : "No"}</td>
                    <td className="p-2 align-top text-[10px] break-all">{ev.uid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="rounded-xl border p-4">
            <summary className="cursor-pointer select-none font-semibold">Calendar Properties (debug)</summary>
            <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {parsed.calendarProps.map((p, idx) => (
                <li key={idx} className="rounded-lg bg-slate-700 p-2">
                  <div className="font-mono text-xs opacity-70">{p.name}</div>
                  <div className="break-words">{String(p.value)}</div>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
