// src/lib/local/client.ts
"use client";

/**
 * Browser-side local backend client.
 * Provides a Supabase-compatible surface (auth.X, from(...)) so existing
 * client code that was written for Supabase works unchanged.
 *
 * Internally calls our own /api/local/* endpoints and stores the session
 * token in localStorage. (We do NOT use cookies on the client because
 * cookies need server-side reads via the Server Client for RLS-style
 * auth — for our purposes, bearer-token in localStorage is fine and
 * matches the Supabase anon-key pattern.)
 */

const TOKEN_KEY = "medassist-session-token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function api<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<{ data: T | null; error: { message: string } | null }> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(path, { ...init, headers });
    const text = await res.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { error: { message: "Invalid JSON response" } };
    }
    if (!res.ok) {
      const errMsg =
        (payload as { error?: { message?: string } })?.error?.message ||
        `HTTP ${res.status}`;
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

// ========== AUTH OBJECT (Supabase-shaped) ==========

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: { full_name?: string };
}

interface SupabaseSession {
  access_token: string;
  token_type: "bearer";
  user: SupabaseUser;
}

interface AuthState {
  data: { session: SupabaseSession | null; user: SupabaseUser | null };
}

const authListeners = new Set<(event: string, session: SupabaseSession | null) => void>();

function notifyAuth(event: string, session: SupabaseSession | null) {
  for (const cb of authListeners) cb(event, session);
}

async function authMe(): Promise<SupabaseUser | null> {
  const result = await api<{ user: SupabaseUser | null }>("/api/local/auth/me");
  return result.data?.user ?? null;
}

const auth = {
  async getSession(): Promise<AuthState> {
    const token = getToken();
    if (!token) return { data: { session: null, user: null } };
    const user = await authMe();
    if (!user) {
      setToken(null);
      return { data: { session: null, user: null } };
    }
    const session: SupabaseSession = {
      access_token: token,
      token_type: "bearer",
      user,
    };
    return { data: { session, user } };
  },

  async getUser(): Promise<SupabaseUser | null> {
    return authMe();
  },

  async signUp(args: {
    email: string;
    password: string;
    full_name?: string;
    options?: { data?: { full_name?: string } };
  }) {
    const fullName =
      args.full_name ?? args.options?.data?.full_name ?? "";
    const { data, error } = await api<{ session: SupabaseSession }>(
      "/api/local/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          email: args.email,
          password: args.password,
          full_name: fullName,
        }),
      }
    );
    if (error) return { data: null, error };
    if (data?.session) {
      setToken(data.session.access_token);
      notifyAuth("SIGNED_IN", data.session);
    }
    return { data: { user: data?.session.user ?? null, session: data?.session ?? null }, error: null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const { data, error } = await api<{ session: SupabaseSession }>(
      "/api/local/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    if (error) return { data: null, error };
    if (data?.session) {
      setToken(data.session.access_token);
      notifyAuth("SIGNED_IN", data.session);
    }
    return { data: { user: data?.session.user ?? null, session: data?.session ?? null }, error: null };
  },

  async signInWithOAuth(args: { provider: string; options?: unknown }) {
    return {
      data: null,
      error: {
        message:
          `OAuth with ${args.provider} is not yet configured in the local backend. ` +
          "Please use email + password to sign in.",
      },
    };
  },

  async signOut() {
    await api("/api/local/auth/logout", { method: "POST" });
    setToken(null);
    notifyAuth("SIGNED_OUT", null);
  },

  async resetPasswordForEmail(email: string, _options?: unknown) {
    return api("/api/local/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async signInWithMagicLink(email: string) {
    return api("/api/local/auth/magic-link/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async verifyMagicLink(token: string) {
    const { data, error } = await api<{ session: SupabaseSession }>(
      "/api/local/auth/magic-link/verify",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      }
    );
    if (error) return { data: null, error };
    if (data?.session) {
      setToken(data.session.access_token);
      notifyAuth("SIGNED_IN", data.session);
    }
    return { data: { user: data?.session.user ?? null, session: data?.session ?? null }, error: null };
  },

  async updateUser(args: { password?: string; data?: unknown }) {
    if (!args.password) {
      return { data: null, error: { message: "Password is required" } };
    }
    return api("/api/local/auth/update-password", {
      method: "POST",
      body: JSON.stringify({ password: args.password }),
    });
  },

  onAuthStateChange(callback: (event: string, session: SupabaseSession | null) => void) {
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

  async exchangeCodeForSession(_code: string) {
    return { data: null, error: { message: "OAuth not configured" } };
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

  private async execute(): Promise<{ data: unknown; error: { message: string } | null }> {
    const { table, mode, filters, orderBy, limitN, selectCols, payload, upsertOpts } = this.state;
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
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
        headers,
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
