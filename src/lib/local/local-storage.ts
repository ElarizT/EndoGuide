const PREFIX = "endoguide:";

export function getLocalSetting<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(`${PREFIX}${key}`);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setLocalSetting<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
}

export function removeLocalSetting(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(`${PREFIX}${key}`);
}
