// Everything is kept in this browser's localStorage under "soso.".
// A person's own things (journal, gifts, friend) live under their account, "soso.u.<email>.",
// so signing in again with the same email and password brings them back, and two people
// sharing a phone each keep their own. When a sync server is set up (lib/sync.ts) those same
// keys are also copied to the account on the server.
const PREFIX = "soso.";
export const USER_KEYS = ["journal", "gifts", "animal"] as const;
export type UserKey = (typeof USER_KEYS)[number];

let user: string | null = null;
let onUserSave: ((key: UserKey) => void) | null = null;

/** Whose things load()/save() read and write from now on (null: nobody signed in). */
export function setStorageUser(email: string | null) {
  user = email ? email.trim().toLowerCase() : null;
}

/** Called after any of the signed-in person's things are saved (used to sync them). */
export function setOnUserSave(fn: ((key: UserKey) => void) | null) {
  onUserSave = fn;
}

const isUserKey = (key: string): key is UserKey => (USER_KEYS as readonly string[]).includes(key);
const fullKey = (key: string, email = user) => (isUserKey(key) && email ? `${PREFIX}u.${email}.${key}` : PREFIX + key);

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(fullKey(key));
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(fullKey(key), JSON.stringify(value));
  } catch {
    /* private mode or storage full: the app still works for this visit */
  }
  if (user && isUserKey(key)) {
    try {
      localStorage.setItem(`${PREFIX}u.${user}.savedAt`, String(Date.now()));
    } catch {
      /* skip */
    }
    onUserSave?.(key);
  }
}

/** All of one account's things on this device, as one object. */
export function readUserData(email: string): Partial<Record<UserKey, unknown>> {
  const out: Partial<Record<UserKey, unknown>> = {};
  for (const k of USER_KEYS) {
    try {
      const raw = localStorage.getItem(fullKey(k, email.trim().toLowerCase()));
      if (raw != null) out[k] = JSON.parse(raw);
    } catch {
      /* skip */
    }
  }
  return out;
}

/** When this account's things were last changed on this device (ms, 0 = never). */
export function localSavedAt(email: string): number {
  try {
    return Number(localStorage.getItem(`${PREFIX}u.${email.trim().toLowerCase()}.savedAt`) ?? 0) || 0;
  } catch {
    return 0;
  }
}

/** Put one account's things on this device (from the server). */
export function writeUserData(email: string, data: Partial<Record<UserKey, unknown>>) {
  for (const k of USER_KEYS) {
    if (data[k] === undefined) continue;
    try {
      localStorage.setItem(fullKey(k, email.trim().toLowerCase()), JSON.stringify(data[k]));
    } catch {
      /* skip */
    }
  }
}

/** Things saved before accounts had their own space: hand them to the first account made here. */
export function adoptUnscopedData(email: string) {
  const e = email.trim().toLowerCase();
  for (const k of USER_KEYS) {
    try {
      const old = localStorage.getItem(PREFIX + k);
      if (old != null && localStorage.getItem(fullKey(k, e)) == null) localStorage.setItem(fullKey(k, e), old);
      localStorage.removeItem(PREFIX + k);
    } catch {
      /* skip */
    }
  }
}
