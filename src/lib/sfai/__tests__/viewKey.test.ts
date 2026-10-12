// getPublicUrl links carry the short view key, never the login token
import { afterEach, describe, expect, it, vi } from "vitest";
import { getViewKey, setToken } from "../http";
import { storage } from "../storage";

afterEach(() => {
  setToken(null);
  vi.unstubAllGlobals();
});

describe("file-view links", () => {
  it("use the view key from the API, and drop it on sign-out", async () => {
    const fetch = vi.fn(async (_url: string) =>
      Response.json({ key: "view-key-1", expiresAt: new Date(Date.now() + 600_000).toISOString() }),
    );
    vi.stubGlobal("fetch", fetch);
    setToken("login-token");
    await vi.waitFor(() => expect(getViewKey()).toBe("view-key-1"));
    expect(String(fetch.mock.calls[0][0])).toMatch(/\/files\/view-key$/);

    const url = storage.from("documents").getPublicUrl("u1/claim.pdf").data.publicUrl;
    expect(url).toContain("key=view-key-1");
    expect(url).not.toContain("login-token");

    setToken(null);
    expect(getViewKey()).toBeNull();
  });
});
