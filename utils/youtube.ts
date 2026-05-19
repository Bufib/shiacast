const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const CLOCK_TIME_PATTERN = /^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:\.\d+)?$/;
const COMPACT_TIME_PATTERN =
  /^(?:(\d+(?:\.\d+)?)h)?(?:(\d+(?:\.\d+)?)m)?(?:(\d+(?:\.\d+)?)s)?$/i;

function normalizeHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
}

function firstPathSegment(pathname: string) {
  return pathname.split("/").filter(Boolean)[0] ?? null;
}

export function getYoutubeVideoId(urlOrId?: string | null): string | null {
  const value = urlOrId?.trim();
  if (!value) return null;

  if (YOUTUBE_ID_PATTERN.test(value)) return value;

  try {
    const parsed = new URL(value);
    const host = normalizeHost(parsed.hostname);

    if (host === "youtu.be") {
      const id = firstPathSegment(parsed.pathname);
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (
      host === "youtube.com" ||
      host === "youtube-nocookie.com" ||
      host.endsWith(".youtube.com")
    ) {
      const watchId = parsed.searchParams.get("v");
      if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) return watchId;

      const [, route, id] = parsed.pathname.split("/");
      if (
        ["embed", "shorts", "live"].includes(route) &&
        YOUTUBE_ID_PATTERN.test(id)
      ) {
        return id;
      }
    }
  } catch {
    const match = value.match(
      /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/,
    );

    return match?.[1] ?? null;
  }

  return null;
}

export function parseYoutubeTime(value?: string | number | null) {
  if (value == null) return undefined;

  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalizedNumber = Number(trimmed.replace(",", "."));
  if (Number.isFinite(normalizedNumber) && normalizedNumber >= 0) {
    return Math.floor(normalizedNumber);
  }

  const clockMatch = trimmed.match(CLOCK_TIME_PATTERN);
  if (clockMatch) {
    const hours = Number(clockMatch[1] ?? 0);
    const minutes = Number(clockMatch[2] ?? 0);
    const seconds = Number(clockMatch[3] ?? 0);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const compactMatch = trimmed.match(COMPACT_TIME_PATTERN);
  if (compactMatch && compactMatch[0]) {
    const hours = Number(compactMatch[1] ?? 0);
    const minutes = Number(compactMatch[2] ?? 0);
    const seconds = Number(compactMatch[3] ?? 0);
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return totalSeconds >= 0 ? Math.floor(totalSeconds) : undefined;
  }

  return undefined;
}
