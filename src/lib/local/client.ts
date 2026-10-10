// src/lib/local/client.ts
"use client";

/**
 * Browser-side backend client (cookie-based sessions — gaps G1/G2).
 *
 * The session JWT lives ONLY in an httpOnly cookie set by the server.
 * This client never reads, stores, or transmits the token itself; same-origin
 * fetches include the cookie automatically. It exposes a Supabase-shaped
 * surface (auth.X, from(...)) so existing client code keeps working.
 */

// One-time migration: remove any legacy localStorage token from the
// pre-cookie era (it was XSS-stealable).
const LEGACY_TOKEN_KEY = "medassist-session-token";
if (typeof window !== "undefined") {
  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

interface ApiUser {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

interface ApiSession {
  user: ApiUser;
}

async function api<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<{ data: T | null; error: { message: string } | null }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(path, { ...init, headers, credentials: "same-origin" });
    const text = await res.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { error: { message: "Invalid JSON response" } };
    }
    if (!res.ok) {
      const errMsg =
        (payload as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`;
      return { data: null, error: { message: errMsg } };
    }
    return { data: payload as T, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err instanceof Error ? err.message : "Network error" },
    };
  }
}

// ========== AUTH OBJECT (Supabase-shaped, cookie-backed) ==========

const authListeners = new Set<(event: string, session: ApiSession | null) => void>();

function notifyAuth(event: string, session: ApiSession | null) {
  for (const cb of authListeners) cb(event, session);
}

async function authMe(): Promise<ApiUser | null> {
  const result = await api<{ user: ApiUser | null }>("/api/local/auth/me");
  return result.data?.user ?? null;
}

const auth = {
  async getSession(): Promise<{ data: { session: ApiSession | null; user: ApiUser | null } }> {
    const user = await authMe();
    const session = user ? { user } : null;
    return { data: { session, user } };
  },

  async getUser(): Promise<ApiUser | null> {
    return authMe();
  },

  async signUp(args: {
    email: string;
    password: string;
    full_name?: string;
    options?: { data?: { full_name?: string } };
  }) {
    const fullName = args.full_name ?? args.options?.data?.full_name ?? "";
    const { data, error } = await api<{ user: ApiUser }>("/api/local/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: args.email,
        password: args.password,
        full_name: fullName,
      }),
    });
    if (error || !data?.user) return { data: null, error: error ?? { message: "Sign up failed" } };
    const session: ApiSession = { user: data.user };
    notifyAuth("SIGNED_IN", session);
    return { data: { user: data.user, session }, error: null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const { data, error } = await api<{ user: ApiUser }>("/api/local/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (error || !data?.user) {
      return { data: null, error: error ?? { message: "Sign in failed" } };
    }
    const session: ApiSession = { user: data.user };
    notifyAuth("SIGNED_IN", session);
    return { data: { user: data.user, session }, error: null };
  },

  async signOut() {
    await api("/api/local/auth/logout", { method: "POST" });
    notifyAuth("SIGNED_OUT", null);
  },

  async resetPasswordForEmail(email: string) {
    return api<{ ok: boolean; resetUrl?: string }>("/api/local/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /** Change password for the signed-in user (requires current password, verified server-side). */
  async changePassword(currentPassword: string, newPassword: string) {
    return api<{ ok: boolean }>("/api/local/auth/update-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, password: newPassword }),
    });
  },

  /** Reset password with a single-use token from the reset email. */
  async resetPasswordWithToken(token: string, newPassword: string) {
    return api<{ ok: boolean }>("/api/local/auth/update-password", {
      method: "POST",
      body: JSON.stringify({ token, password: newPassword }),
    });
  },

  onAuthStateChange(callback: (event: string, session: ApiSession | null) => void) {
    authListeners.add(callback);
    // Fire current state once
    (async () => {
      const { data } = await auth.getSession();
      callback("INITIAL_SESSION", data.session);
    })();
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(callback),
        },
      },
    };
  },
};

// ========== from(...) QUERY BUILDER (Supabase-shaped) ==========

type Filter = { col: string; op: "eq"; val: unknown };
type Order = { col: string; ascending: boolean };

interface QueryState {
  table: string;
  filters: Filter[];
  orderBy?: Order;
  limitN?: number;
  selectCols: string; // "*"
  mode: "select" | "insert" | "update" | "delete" | "upsert";
  payload?: unknown;
  upsertOpts?: { onConflict?: string };
}

class QueryBuilder {
  constructor(private state: QueryState) {}

  select(cols: string = "*"): QueryBuilder {
    this.state.selectCols = cols;
    this.state.mode = "select";
    return this;
  }

  insert(payload: unknown): QueryBuilder {
    this.state.mode = "insert";
    this.state.payload = payload;
    return this;
  }

  update(payload: unknown): QueryBuilder {
    this.state.mode = "update";
    this.state.payload = payload;
    return this;
  }

  upsert(payload: unknown, opts?: { onConflict?: string }): QueryBuilder {
    this.state.mode = "upsert";
    this.state.payload = payload;
    this.state.upsertOpts = opts;
    return this;
  }

  delete(): QueryBuilder {
    this.state.mode = "delete";
    return this;
  }

  eq(col: string, val: unknown): QueryBuilder {
    this.state.filters.push({ col, op: "eq", val });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): QueryBuilder {
    this.state.orderBy = { col, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(n: number): QueryBuilder {
    this.state.limitN = n;
    return this;
  }

  async single(): Promise<{ data: unknown; error: unknown }> {
    const result = await this.execute();
    if (result.error) return { data: null, error: result.error };
    const arr = Array.isArray(result.data) ? result.data : [];
    return { data: arr[0] ?? null, error: arr.length === 0 ? { message: "No rows" } : null };
  }

  async maybeSingle(): Promise<{ data: unknown; error: unknown }> {
    const result = await this.execute();
    if (result.error) return { data: null, error: result.error };
    const arr = Array.isArray(result.data) ? result.data : [];
    return { data: arr[0] ?? null, error: null };
  }

  async then<TResult1 = { data: unknown; error: unknown }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: unknown; error: unknown }) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    try {
      const result = await this.execute();
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1);
    } catch (e) {
      if (onrejected) return onrejected(e);
      throw e;
    }
  }

  private async execute(): Promise<{
    data: unknown;
    error: { message: string } | null;
  }> {
    const { table, mode, filters, orderBy, limitN, selectCols, payload, upsertOpts } =
      this.state;
    const body = {
      table,
      mode,
      filters,
      orderBy,
      limit: limitN,
      select: selectCols,
      payload,
      onConflict: upsertOpts?.onConflict,
    };
    try {
      const res = await fetch("/api/local/data/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const text = await res.text();
      const parsed = text ? JSON.parse(text) : null;
      if (!res.ok) {
        return {
          data: null,
          error: parsed?.error || { message: `HTTP ${res.status}` },
        };
      }
      return { data: parsed?.data ?? null, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : "Network error" },
      };
    }
  }
}

function from(table: string): QueryBuilder {
  return new QueryBuilder({
    table,
    filters: [],
    selectCols: "*",
    mode: "select",
  });
}

// ========== EXPORT ==========

export function createClient() {
  return { auth, from };
}

let _singleton: ReturnType<typeof createClient> | null = null;
export function getSupabaseClient() {
  if (!_singleton) _singleton = createClient();
  return _singleton;
}
