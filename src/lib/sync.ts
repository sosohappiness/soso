// Keeps a signed-in person's journal, gifts and friend on the sync server (Supabase), so the
// same account shows the same things on any phone. One row per account in the "soso_data"
// table (see supabase.sql); whichever copy was changed last wins. Does nothing without a server.
import { supabase } from "./auth";
import { localSavedAt, readUserData, setOnUserSave, writeUserData } from "./storage";

/**
 * Bring the account's things from the server when the server's copy is newer, or send this
 * phone's copy when it is newer. Returns true when this phone's copy changed.
 */
export async function pullFromServer(email: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const { data } = await supabase.from("soso_data").select("data, updated_at").eq("user_id", auth.user.id).maybeSingle();
    const serverAt = data?.updated_at ? Date.parse(data.updated_at) : 0;
    if (data?.data && serverAt > localSavedAt(email)) {
      writeUserData(email, data.data);
      return true;
    }
    if (localSavedAt(email) > serverAt) await pushNow(email);
  } catch {
    /* offline: keep going with what this phone has */
  }
  return false;
}

async function pushNow(email: string) {
  if (!supabase) return;
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    await supabase.from("soso_data").upsert({ user_id: auth.user.id, data: readUserData(email), updated_at: new Date(localSavedAt(email) || Date.now()).toISOString() });
  } catch {
    /* offline: the next change or the next start sends it */
  }
}

let timer = 0;
/** From now on, send changes to the server a moment after they are saved. */
export function startSync(email: string | null) {
  if (!supabase || !email) {
    setOnUserSave(null);
    return;
  }
  setOnUserSave(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => void pushNow(email), 1500);
  });
}
