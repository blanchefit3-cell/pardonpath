import { describe, it, expect } from "vitest";
import { supabase } from "./const";

describe("Supabase Client", () => {
  it("should initialize with valid credentials", () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it("should be able to call getSession", async () => {
    const { data, error } = await supabase.auth.getSession();
    // We expect either a session or no error (no session is fine for this test)
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("should have valid auth methods", () => {
    expect(typeof supabase.auth.signInWithPassword).toBe("function");
    expect(typeof supabase.auth.signUp).toBe("function");
    expect(typeof supabase.auth.signOut).toBe("function");
    expect(typeof supabase.auth.getSession).toBe("function");
    expect(typeof supabase.auth.onAuthStateChange).toBe("function");
  });
});
