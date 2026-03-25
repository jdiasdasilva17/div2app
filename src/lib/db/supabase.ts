const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getApiKey(): string | undefined {
  return SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && getApiKey());
}

export async function supabaseRest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase REST error ${response.status}: ${details}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return response.json() as Promise<T>;
}
