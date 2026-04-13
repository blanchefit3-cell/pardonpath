-- Only create NEW ENUM types that don't already exist
CREATE TYPE "public"."blog_category" AS ENUM('guides', 'news', 'tips', 'legal', 'success_stories', 'updates');
CREATE TYPE "public"."help_article_category" AS ENUM('getting_started', 'eligibility', 'documents', 'forms', 'status', 'payment', 'legal', 'faq', 'troubleshooting');

-- Create blog posts table
CREATE TABLE "blogPosts" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blogPosts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "title" varchar(255) NOT NULL,
    "slug" varchar(255) NOT NULL UNIQUE,
    "content" text NOT NULL,
    "excerpt" text,
    "category" "blog_category" NOT NULL,
    "author" varchar(255) NOT NULL,
    "authorId" uuid,
    "featuredImage" text,
    "seoTitle" varchar(255),
    "seoDescription" text,
    "seoKeywords" text,
    "published" boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create help articles table
CREATE TABLE "helpArticles" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "helpArticles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "title" varchar(255) NOT NULL,
    "slug" varchar(255) NOT NULL UNIQUE,
    "content" text NOT NULL,
    "category" "help_article_category" NOT NULL,
    "author" varchar(255) NOT NULL,
    "authorId" uuid,
    "relatedArticles" json,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "unhelpfulCount" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create article feedback table
CREATE TABLE "articleFeedback" (
    "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "articleFeedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
    "articleId" integer NOT NULL,
    "userId" uuid,
    "helpful" boolean NOT NULL,
    "comment" text,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX "blogPosts_slug_idx" ON "blogPosts" USING btree ("slug");
CREATE INDEX "blogPosts_category_idx" ON "blogPosts" USING btree ("category");
CREATE INDEX "blogPosts_published_idx" ON "blogPosts" USING btree ("published");
CREATE INDEX "blogPosts_authorId_idx" ON "blogPosts" USING btree ("authorId");

CREATE INDEX "helpArticles_slug_idx" ON "helpArticles" USING btree ("slug");
CREATE INDEX "helpArticles_category_idx" ON "helpArticles" USING btree ("category");
CREATE INDEX "helpArticles_published_idx" ON "helpArticles" USING btree ("published");
CREATE INDEX "helpArticles_authorId_idx" ON "helpArticles" USING btree ("authorId");

CREATE INDEX "articleFeedback_articleId_idx" ON "articleFeedback" USING btree ("articleId");
CREATE INDEX "articleFeedback_userId_idx" ON "articleFeedback" USING btree ("userId");
