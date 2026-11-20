// Email sign-up with a 6-digit code (Supabase email OTP).
// A code instead of a magic link, because on iPhone a link opens Safari, not the home-screen app.
// Without Supabase settings (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) it runs in a local test
// mode: no email is sent and any 6 digits are accepted, so the flow can be tried end to end.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { load, save } from "./storage";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
export const testMode = !supabase;

export type Account = { email: string; since: number };

export function loadAccount(): Account | null {
  return load<Account | null>("account", null);
}

export function saveAccount(a: Account | null) {
  save("account", a);
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Send the 6-digit code. Creates the account on first use. */
export async function sendCode(email: string): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
  if (!error) return null;
  if (/rate|seconds/i.test(error.message)) return "잠시 후에 다시 보내 주세요. (메일은 1분에 한 번 보낼 수 있어요)";
  return "코드를 보내지 못했어요. 이메일 주소를 확인해 주세요.";
}

/** Check the code; on success the account is remembered on this device. */
export async function verifyCode(email: string, code: string): Promise<string | null> {
  const token = code.replace(/\D/g, "");
  if (token.length !== 6) return "6자리 숫자를 입력해 주세요.";
  if (supabase) {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    if (error) return "코드가 맞지 않거나 시간이 지났어요. 다시 받아 볼까요?";
  }
  saveAccount({ email: email.trim(), since: Date.now() });
  return null;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  saveAccount(null);
}
