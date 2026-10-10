import { describe, it, expect, beforeAll } from "vitest";
import { runMigrations } from "@/lib/db/schema";
import {
  signupUser,
  loginUser,
  logoutWithToken,
  changePassword,
  requestPasswordReset,
  resetPasswordWithToken,
} from "@/lib/auth/service";
import { verifySession } from "@/lib/auth/session";

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const strongPw = "Str0ngPass1";

beforeAll(async () => {
  await runMigrations();
});

describe("auth service", () => {
  it("signs up, logs in, verifies the session, and logs out (revokes server-side)", async () => {
    const email = `user-${unique()}@example.com`;
    const su = await signupUser({ email, password: strongPw, full_name: "Test User" });
    expect(su.error).toBeNull();
    const userId = su.data?.user.id;

    const login = await loginUser({ email, password: strongPw });
    expect(login.error).toBeNull();
    const session = login.data?.session;
    expect(session?.token).toBeTruthy();

    const verified = await verifySession(session!.token);
    expect(verified?.id).toBe(userId);

    await logoutWithToken(session!.token);
    expect(await verifySession(session!.token)).toBeNull();
  });

  it("rejects duplicate signup and wrong passwords without enumeration", async () => {
    const email = `user-${unique()}@example.com`;
    await signupUser({ email, password: strongPw });

    const dup = await signupUser({ email, password: strongPw });
    expect(dup.error?.status).toBe(409);

    const bad = await loginUser({ email, password: "Wr0ngPass1" });
    expect(bad.error?.status).toBe(401);
    expect(bad.error?.message).toBe("Invalid email or password.");

    const unknown = await loginUser({
      email: `nobody-${unique()}@example.com`,
      password: strongPw,
    });
    expect(unknown.error?.status).toBe(401);
    expect(unknown.error?.message).toBe("Invalid email or password.");
  });

  it("rejects weak passwords", async () => {
    const r = await signupUser({
      email: `user-${unique()}@example.com`,
      password: "weak",
    });
    expect(r.error?.status).toBe(400);
  });

  it("changes password with current-password verification and revokes other sessions", async () => {
    const email = `user-${unique()}@example.com`;
    const su = await signupUser({ email, password: strongPw });
    const userId = su.data!.user.id;
    const s1 = su.data!.session;
    const login2 = await loginUser({ email, password: strongPw });
    const s2 = login2.data!.session;

    const wrong = await changePassword(userId, "n0pe-n0pe", "N3wStrongPass", s1.jti);
    expect(wrong.error?.status).toBe(403);

    const ok = await changePassword(userId, strongPw, "N3wStrongPass", s1.jti);
    expect(ok.error).toBeNull();

    // Old password no longer works; new password does.
    expect((await loginUser({ email, password: strongPw })).error?.status).toBe(401);
    expect((await loginUser({ email, password: "N3wStrongPass" })).error).toBeNull();

    // The kept session survives; the other session is revoked.
    expect(await verifySession(s1.token)).not.toBeNull();
    expect(await verifySession(s2.token)).toBeNull();
  });

  it("resets password with a single-use token and revokes sessions", async () => {
    const email = `user-${unique()}@example.com`;
    const su = await signupUser({ email, password: strongPw });
    const session = su.data!.session;

    const req = await requestPasswordReset(email);
    expect(req.resetUrl).toBeTruthy();
    const token = new URL(req.resetUrl!).searchParams.get("token");
    expect(token).toBeTruthy();

    const bad = await resetPasswordWithToken("deadbeef".repeat(8), "N3wStrongPass");
    expect(bad.error?.status).toBe(400);

    const good = await resetPasswordWithToken(token!, "N3wStrongPass");
    expect(good.error).toBeNull();

    // Single-use: the same token cannot be replayed.
    const again = await resetPasswordWithToken(token!, "An0therStrong1");
    expect(again.error?.status).toBe(400);

    // All sessions revoked; new password works.
    expect(await verifySession(session.token)).toBeNull();
    expect((await loginUser({ email, password: "N3wStrongPass" })).error).toBeNull();
  });

  it("does not reveal whether an account exists on reset request", async () => {
    const r = await requestPasswordReset(`nobody-${unique()}@example.com`);
    expect(r.resetUrl).toBeUndefined();
  });
});
