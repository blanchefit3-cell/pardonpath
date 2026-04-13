import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { blogPosts, helpArticles } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const blogRouter = router({
  // Get all published blog posts
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not initialized");

      const conditions = [eq(blogPosts.published, true)];
      if (input.category) {
        conditions.push(eq(blogPosts.category, input.category as any));
      }

      const posts = await db
        .select()
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input.limit)
        .offset(input.offset);

      return posts;
    }),

  // Get blog post by slug
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized");

    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, input.slug))
      .limit(1);

    if (post) {
      // Increment view count
      await db
        .update(blogPosts)
        .set({ viewCount: (post.viewCount || 0) + 1 })
        .where(eq(blogPosts.id, post.id));
    }

    return post || null;
  }),

  // Get blog categories
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized");

    const posts = await db
      .select({ category: blogPosts.category })
      .from(blogPosts)
      .where(eq(blogPosts.published, true));

    // Get unique categories
    const categorySet = new Set(posts.map((p: any) => p.category));
    return Array.from(categorySet);
  }),
});

export const helpRouter = router({
  // Get all published help articles
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not initialized");

      const conditions = [eq(helpArticles.published, true)];
      if (input.category) {
        conditions.push(eq(helpArticles.category, input.category as any));
      }

      const articles = await db
        .select()
        .from(helpArticles)
        .where(and(...conditions))
        .orderBy(desc(helpArticles.publishedAt))
        .limit(input.limit)
        .offset(input.offset);

      return articles;
    }),

  // Get help article by slug
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized");

    const [article] = await db
      .select()
      .from(helpArticles)
      .where(eq(helpArticles.slug, input.slug))
      .limit(1);

    if (article) {
      // Increment view count
      await db
        .update(helpArticles)
        .set({ viewCount: (article.viewCount || 0) + 1 })
        .where(eq(helpArticles.id, article.id));
    }

    return article || null;
  }),

  // Get help categories
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized");

    const articles = await db
      .select({ category: helpArticles.category })
      .from(helpArticles)
      .where(eq(helpArticles.published, true));

    // Get unique categories
    const categorySet = new Set(articles.map((a: any) => a.category));
    return Array.from(categorySet);
  }),

  // Search help articles
  search: publicProcedure.input(z.object({ query: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not initialized");

    // Simple search - in production, use full-text search
    const articles = await db
      .select()
      .from(helpArticles)
      .where(eq(helpArticles.published, true));

    const searchTerm = input.query.toLowerCase();
    return articles.filter(
      (a: any) =>
        a.title.toLowerCase().includes(searchTerm) ||
        a.content.toLowerCase().includes(searchTerm)
    );
  }),
});
