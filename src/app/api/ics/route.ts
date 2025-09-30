export const runtime = "nodejs"; // ensure Node runtime (not edge) for maximum compat

const BAD_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^\[?::1\]?$/,
];

function isPrivateHost(hostname: string) {
  return BAD_HOST_PATTERNS.some((re) => re.test(hostname));
}

export async function GET(req: Request) {
  try {
    const urlParam = new URL(req.url).searchParams.get("url");
    if (!urlParam) {
      return new Response("Missing ?url=", { status: 400 });
    }

    // Normalize webcal:// → https://
    const raw = urlParam.trim();
    const fixed = raw.startsWith("webcal://")
      ? "https://" + raw.slice("webcal://".length)
      : raw;

    let remote: URL;
    try {
      remote = new URL(fixed);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }

    if (!/^https?:$/i.test(remote.protocol)) {
      return new Response("Only http(s) URLs are allowed", { status: 400 });
    }

    if (isPrivateHost(remote.hostname)) {
      return new Response("Private/loopback hosts are not allowed", { status: 400 });
    }

    // Simple timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const upstream = await fetch(remote.toString(), {
      method: "GET",
      headers: {
        // some servers are picky without UA/accept
        "User-Agent": "ICS-Proxy/1.0",
        "Accept": "text/calendar, text/plain; q=0.8, */*; q=0.1",
      },
      signal: controller.signal,
      // Don't forward cookies/credentials
      redirect: "follow",
    }).finally(() => clearTimeout(timeout));

    if (!upstream.ok) {
      return new Response(
        `Upstream error: ${upstream.status} ${upstream.statusText}`,
        { status: 502 }
      );
    }

    // Read as text and return with a safe content-type.
    const text = await upstream.text();
    return new Response(text, {
      status: 200,
      headers: {
        // present as calendar text
        "Content-Type": "text/calendar; charset=utf-8",
        // prevent caching during dev
        "Cache-Control": "no-store",
        // allow your own frontend to read it (same origin); no wildcard needed
        // (Not strictly necessary for same-origin fetches, but harmless.)
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "Upstream timeout" : (err?.message || "Proxy error");
    return new Response(msg, { status: 500 });
  }
}