export function parseTopics(raw: unknown): string[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((topic) => String(topic).trim()).filter(Boolean);
  }

  if (typeof raw !== "string") {
    return [];
  }

  const trimmed = raw.trim();

  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed.map((topic) => String(topic).trim()).filter(Boolean);
      }
    } catch {
      // Invalid JSON. Continue and treat it as a single plain topic.
    }
  }

  return [trimmed];
}

export function matchesTopic(rawTopic: unknown, topic: string): boolean {
  return parseTopics(rawTopic).includes(topic);
}