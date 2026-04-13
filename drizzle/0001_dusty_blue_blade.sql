CREATE TYPE "public"."ai_review_status" AS ENUM('pending', 'approved', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."app_status" AS ENUM('intake', 'documents', 'review', 'submission', 'decision', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."app_tier" AS ENUM('diy', 'done_with_you', 'done_for_you');--> statement-breakpoint
CREATE TYPE "public"."blog_category" AS ENUM('guides', 'news', 'tips', 'legal', 'success_stories', 'updates');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('court_record', 'police_certificate', 'id_document', 'other');--> statement-breakpoint
CREATE TYPE "public"."eligibility_status" AS ENUM('pass', 'flag', 'ineligible');--> statement-breakpoint
CREATE TYPE "public"."help_article_category" AS ENUM('getting_started', 'eligibility', 'documents', 'forms', 'status', 'payment', 'legal', 'faq', 'troubleshooting');--> statement-breakpoint
CREATE TYPE "public"."human_review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."milestone_status_enum" AS ENUM('pending', 'completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."milestone_type" AS ENUM('intake_started', 'intake_completed', 'documents_submitted', 'documents_approved', 'form_generated', 'form_submitted', 'under_review', 'decision_received', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'sms');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('eligibility_confirmed', 'document_approved', 'form_ready', 'submission_sent', 'decision_received', 'milestone_update');--> statement-breakpoint
CREATE TYPE "public"."partner_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_tier" AS ENUM('diy', 'done_with_you', 'done_for_you');--> statement-breakpoint
CREATE TYPE "public"."pbc_decision" AS ENUM('approved', 'denied', 'pending');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'paralegal', 'partner');--> statement-breakpoint
CREATE TABLE "articleFeedback" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "articleFeedback_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"articleId" integer NOT NULL,
	"userId" uuid,
	"helpful" boolean NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blogPosts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "blogPosts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
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
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blogPosts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "helpArticles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "helpArticles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
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
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "helpArticles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "applicants" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "paralegalAssignedId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "auditLogs" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "createdBy" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "partners" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
CREATE INDEX "articleFeedback_articleId_idx" ON "articleFeedback" USING btree ("articleId");--> statement-breakpoint
CREATE INDEX "articleFeedback_userId_idx" ON "articleFeedback" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "blogPosts_slug_idx" ON "blogPosts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blogPosts_category_idx" ON "blogPosts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "blogPosts_published_idx" ON "blogPosts" USING btree ("published");--> statement-breakpoint
CREATE INDEX "blogPosts_authorId_idx" ON "blogPosts" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "helpArticles_slug_idx" ON "helpArticles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "helpArticles_category_idx" ON "helpArticles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "helpArticles_published_idx" ON "helpArticles" USING btree ("published");--> statement-breakpoint
CREATE INDEX "helpArticles_authorId_idx" ON "helpArticles" USING btree ("authorId");