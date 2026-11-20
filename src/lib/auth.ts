// Accounts: an email (the ID) and a password.
//
// With a sync server (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY set) accounts live on Supabase,
// so the same email and password work on any phone and bring the same journal back.
// Without one, accounts live on this device only: the password is kept as a salted hash and
// signing in again here brings back what was written here.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { adoptUnscopedData, load, save, setStorageUser } from "./storage";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
/** True when accounts and records are kept on this device only. */
export const localOnly = !supabase;

export type Account = { email: string; since: number };

export function loadAccount(): Account | null {
  return load<Account | null>("account", null);
}

export function saveAccount(a: Account | null) {
  save("account", a);
  setStorageUser(a?.email ?? null);
}

// whoever is signed in owns the journal from the very first read (someone signed in from before
// accounts had passwords keeps what they wrote)
{
  const signedIn = loadAccount();
  if (signedIn) adoptUnscopedData(signedIn.email);
  setStorageUser(signedIn?.email ?? null);
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export const MIN_PASSWORD = 6;

type LocalAccount = { salt: string; hash: string; since: number };

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const norm = (email: string) => email.trim().toLowerCase();

/** Make a new account. Returns an error message, or null when it worked. */
export async function signUp(email: string, password: string): Promise<string | null> {
  const e = norm(email);
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({ email: e, password });
    if (error) {
      if (/registered|exists/i.test(error.message)) return "이미 가입한 이메일이에요. '다시 왔어요'에서 로그인해 주세요.";
      if (/password/i.test(error.message)) return `비밀번호는 ${MIN_PASSWORD}자 이상으로 해 주세요.`;
      return "가입하지 못했어요. 잠시 후 다시 해 주세요.";
    }
    // an existing email comes back as a user with no identities
    if (data.user && data.user.identities?.length === 0) return "이미 가입한 이메일이에요. '다시 왔어요'에서 로그인해 주세요.";
    if (!data.session) return "메일함에서 가입 확인 메일을 눌러 준 뒤, '다시 왔어요'에서 로그인해 주세요.";
  } else {
    const accounts = load<Record<string, LocalAccount>>("accounts", {});
    if (accounts[e]) return "이미 가입한 이메일이에요. '다시 왔어요'에서 로그인해 주세요.";
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
    accounts[e] = { salt, hash: await hashPassword(password, salt), since: Date.now() };
    save("accounts", accounts);
  }
  // the first account made on this phone keeps anything written before accounts existed
  if (Object.keys(load<Record<string, LocalAccount>>("accounts", {})).length <= 1) adoptUnscopedData(e);
  saveAccount({ email: e, since: Date.now() });
  return null;
}

/** Sign in to an existing account. Returns an error message, or null when it worked. */
export async function signIn(email: string, password: string): Promise<string | null> {
  const e = norm(email);
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email: e, password });
    if (error) {
      if (/confirm/i.test(error.message)) return "메일함에서 가입 확인 메일을 먼저 눌러 주세요.";
      return "이메일이나 비밀번호가 맞지 않아요.";
    }
  } else {
    const acct = load<Record<string, LocalAccount>>("accounts", {})[e];
    if (!acct) return "이 휴대폰에서 가입한 적 없는 이메일이에요. '처음이에요'에서 가입해 주세요.";
    if ((await hashPassword(password, acct.salt)) !== acct.hash) return "비밀번호가 맞지 않아요.";
  }
  saveAccount({ email: e, since: Date.now() });
  return null;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  saveAccount(null);
}
