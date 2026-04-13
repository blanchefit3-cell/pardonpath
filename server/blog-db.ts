import { getDb } from "./db";
import { blogPosts, helpArticles, articleFeedback } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Get all published blog posts with optional filtering
 */
export async function getPublishedBlogPosts(category?: string, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  
  let whereClause = eq(blogPosts.published, true);
  if (category) {
    whereClause = and(eq(blogPosts.published, true), eq(blogPosts.category, category as any))!;
  }

  return db
    .select()
    .from(blogPosts)
    .where(whereClause)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const post = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);

  if (post.length > 0) {
    // Increment view count
    await db
      .update(blogPosts)
      .set({ viewCount: post[0].viewCount + 1 })
      .where(eq(blogPosts.id, post[0].id));

    return post[0];
  }

  return null;
}

/**
 * Get all published help articles with optional filtering
 */
export async function getPublishedHelpArticles(category?: string, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  
  let whereClause = eq(helpArticles.published, true);
  if (category) {
    whereClause = and(eq(helpArticles.published, true), eq(helpArticles.category, category as any))!;
  }

  return db
    .select()
    .from(helpArticles)
    .where(whereClause)
    .orderBy(desc(helpArticles.publishedAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get a single help article by slug
 */
export async function getHelpArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const article = await db
    .select()
    .from(helpArticles)
    .where(and(eq(helpArticles.slug, slug), eq(helpArticles.published, true)))
    .limit(1);

  if (article.length > 0) {
    // Increment view count
    await db
      .update(helpArticles)
      .set({ viewCount: article[0].viewCount + 1 })
      .where(eq(helpArticles.id, article[0].id));

    return article[0];
  }

  return null;
}

/**
 * Search blog posts by title or content
 */
export async function searchBlogPosts(query: string, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  return db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.published, true)))
    .limit(limit);
  // Note: Full-text search would require PostgreSQL FTS setup
  // For now, this is a placeholder for basic search
}

/**
 * Search help articles by title or content
 */
export async function searchHelpArticles(query: string, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  return db
    .select()
    .from(helpArticles)
    .where(and(eq(helpArticles.published, true)))
    .limit(limit);
  // Note: Full-text search would require PostgreSQL FTS setup
}

/**
 * Get related help articles
 */
export async function getRelatedHelpArticles(articleId: number, limit = 5) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  const article = await db
    .select()
    .from(helpArticles)
    .where(eq(helpArticles.id, articleId))
    .limit(1);

  if (!article[0] || !article[0].relatedArticles) {
    return [];
  }

  return db
    .select()
    .from(helpArticles)
    .where(and(eq(helpArticles.published, true)))
    .limit(limit);
}

/**
 * Add feedback to a help article
 */
export async function addArticleFeedback(
  articleId: number,
  helpful: boolean,
  userId?: string,
  comment?: string
) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  return db.insert(articleFeedback).values({
    articleId,
    userId,
    helpful,
    comment,
  });
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  return db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.published, true), eq(blogPosts.category, category as any)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

/**
 * Get help articles by category
 */
export async function getHelpArticlesByCategory(category: string, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  return db
    .select()
    .from(helpArticles)
    .where(and(eq(helpArticles.published, true), eq(helpArticles.category, category as any)))
    .orderBy(desc(helpArticles.publishedAt))
    .limit(limit);
}
