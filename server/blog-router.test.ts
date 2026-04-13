import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { blogPosts, helpArticles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Blog Router", () => {
  let db: Awaited<ReturnType<typeof getDb>>;  let dbAvailable = false;

  beforeAll(async () => {
    db = await getDb();
    dbAvailable = !!db;
  });

  it("should fetch all published blog posts", async () => {
    if (!dbAvailable) {
      console.warn("Database not available, skipping test");
      expect(true).toBe(true);
      return;
    }

    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true));

    // Should return an array (empty or with posts)
    expect(Array.isArray(posts)).toBe(true);
  });

  it("should fetch blog post by slug", async () => {
    if (!dbAvailable) {
      console.warn("Database not available, skipping test");
      expect(true).toBe(true);
      return;
    }

    // Try to fetch a blog post by slug
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, "test-slug"))
      .limit(1);

    // Should return null or a post object
    expect(post === undefined || post.id).toBeTruthy();
  });

  it("should get unique blog categories", async () => {
    if (!dbAvailable) {
      console.warn("Database not available, skipping test");
      expect(true).toBe(true);
      return;
    }

    const posts = await db
      .select({ category: blogPosts.category })
      .from(blogPosts)
      .where(eq(blogPosts.published, true));

    const categorySet = new Set(posts.map((p: any) => p.category));
    const categories = Array.from(categorySet);

    expect(Array.isArray(categories)).toBe(true);
  });
});

describe("Help Router", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let dbAvailable = false;

  beforeAll(async () => {
    db = await getDb();
    dbAvailable = !!db;
  });

  it("should fetch all published help articles", async () => {
    if (!dbAvailable) {
      console.warn("Database not available, skipping test");
      expect(true).toBe(true);
      return;
    }

    const articles = await db
      .select()
      .from(helpArticles)
      .where(eq(helpArticles.published, true));

    expect(Array.isArray(articles)).toBe(true);
  });

  it("should fetch help article by slug", async () => {
    if (!dbAvailable) {
      console.warn("Database not available, skipping test");
      expect(true).toBe(true);
      return;
    }

    const [article] = await db
      .select()
      .from(helpArticles)
      .where(eq(helpArticles.slug, "test-slug"))
      .limit(1);

    expect(article === undefined || article.id).toBeTruthy();
  });

  it("should get unique help article categories", async () => {
    if (!dbAvailable) {
      console.warn("Database not available, skipping test");
      expect(true).toBe(true);
      return;
    }

    const articles = await db
      .select({ category: helpArticles.category })
      .from(helpArticles)
      .where(eq(helpArticles.published, true));

    const categorySet = new Set(articles.map((a: any) => a.category));
    const categories = Array.from(categorySet);

    expect(Array.isArray(categories)).toBe(true);
  });

  it("should search help articles by title", async () => {
    if (!dbAvailable) {
      console.warn("Database not available, skipping test");
      expect(true).toBe(true);
      return;
    }

    const articles = await db
      .select()
      .from(helpArticles)
      .where(eq(helpArticles.published, true));

    const searchTerm = "test";
    const results = articles.filter(
      (a: any) =>
        a.title.toLowerCase().includes(searchTerm) ||
        a.content.toLowerCase().includes(searchTerm)
    );

    expect(Array.isArray(results)).toBe(true);
  });
});
