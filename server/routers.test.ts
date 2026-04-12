import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Mock context for testing
 */
function createMockContext(overrides?: Partial<TrpcContext>): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { "user-agent": "test-agent" },
      ip: "127.0.0.1",
    } as any,
    res: {
      clearCookie: () => {},
    } as any,
    ...overrides,
  };
}

describe("tRPC Routers", () => {
  describe("auth router", () => {
    it("should return current user via auth.me", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();

      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.email).toBe("test@example.com");
      expect(user?.role).toBe("user");
    });

    it("should return null for unauthenticated auth.me", async () => {
      const ctx = createMockContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();

      expect(user).toBeNull();
    });

    it("should logout successfully", async () => {
      const clearCookieMock = { called: false };
      const ctx = createMockContext({
        res: {
          clearCookie: () => {
            clearCookieMock.called = true;
          },
        } as any,
      });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(clearCookieMock.called).toBe(true);
    });
  });

  describe("applications router", () => {
    it("should require authentication for applications.list", async () => {
      const ctx = createMockContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.list();
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should require authentication for applications.create", async () => {
      const ctx = createMockContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.create({ tier: "diy" });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should validate tier input", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.create({ tier: "invalid" as any });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should validate applicationId is a number", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.getById({ applicationId: "invalid" as any });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should require authentication for applications.updateStatus", async () => {
      const ctx = createMockContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.applications.updateStatus({
          applicationId: 1,
          status: "documents",
        });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("documents router", () => {
    it("should require authentication for documents.list", async () => {
      const ctx = createMockContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.documents.list({ applicationId: 1 });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should require authentication for documents.create", async () => {
      const ctx = createMockContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.documents.create({
          applicationId: 1,
          documentType: "court_record",
          fileName: "test.pdf",
          fileUrl: "https://s3.example.com/test.pdf",
          fileKey: "test.pdf",
        });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should validate documentType input", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.documents.create({
          applicationId: 1,
          documentType: "invalid" as any,
          fileName: "test.pdf",
          fileUrl: "https://s3.example.com/test.pdf",
          fileKey: "test.pdf",
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("auditLogs router", () => {
    it("should require authentication for auditLogs.list", async () => {
      const ctx = createMockContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.auditLogs.list({ applicationId: 1 });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should forbid non-admin/paralegal users from accessing auditLogs", async () => {
      const ctx = createMockContext({
        user: {
          id: 1,
          openId: "test-user",
          email: "test@example.com",
          name: "Test User",
          role: "user", // Regular user, not admin/paralegal
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.auditLogs.list({ applicationId: 1 });
        expect.fail("Should have thrown FORBIDDEN");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin users to access auditLogs", async () => {
      const ctx = createMockContext({
        user: {
          id: 1,
          openId: "admin-user",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });
      const caller = appRouter.createCaller(ctx);

      // This will fail with NOT_FOUND since the application doesn't exist,
      // but it should pass the authorization check
      try {
        await caller.auditLogs.list({ applicationId: 999 });
        // If we get here without FORBIDDEN, authorization passed
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should allow paralegal users to access auditLogs", async () => {
      const ctx = createMockContext({
        user: {
          id: 1,
          openId: "paralegal-user",
          email: "paralegal@example.com",
          name: "Paralegal User",
          role: "paralegal",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });
      const caller = appRouter.createCaller(ctx);

      // This will fail with NOT_FOUND since the application doesn't exist,
      // but it should pass the authorization check
      try {
        await caller.auditLogs.list({ applicationId: 999 });
        // If we get here without FORBIDDEN, authorization passed
      } catch (error: any) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });
  });
});
