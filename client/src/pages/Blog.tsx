import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BLOG_CATEGORIES = [
  { id: "all", label: "All Posts" },
  { id: "guides", label: "Guides" },
  { id: "news", label: "News" },
  { id: "tips", label: "Tips" },
  { id: "legal", label: "Legal" },
  { id: "success_stories", label: "Success Stories" },
];

// Mock blog posts - replace with tRPC call once database is set up
const MOCK_BLOG_POSTS = [
  {
    id: 1,
    title: "Understanding Record Suspensions in Canada",
    slug: "understanding-record-suspensions",
    excerpt: "A comprehensive guide to what record suspensions are and how they can help you move forward.",
    category: "guides",
    author: "PardonPath Team",
    publishedAt: "2026-04-10",
    viewCount: 234,
  },
  {
    id: 2,
    title: "Eligibility Criteria: Am I Eligible for a Record Suspension?",
    slug: "eligibility-criteria",
    excerpt: "Learn about the Criminal Records Act requirements and waiting periods for different offences.",
    category: "legal",
    author: "Legal Team",
    publishedAt: "2026-04-08",
    viewCount: 156,
  },
  {
    id: 3,
    title: "5 Tips to Prepare Your Application",
    slug: "5-tips-prepare-application",
    excerpt: "Expert tips to ensure your record suspension application is complete and accurate.",
    category: "tips",
    author: "PardonPath Team",
    publishedAt: "2026-04-05",
    viewCount: 89,
  },
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredPosts = selectedCategory === "all" 
    ? MOCK_BLOG_POSTS 
    : MOCK_BLOG_POSTS.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">PardonPath Blog</h1>
          <p className="text-lg text-muted-foreground">
            Stay informed with the latest news, guides, and tips about record suspensions in Canada.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.viewCount} views</span>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(post.publishedAt).toLocaleDateString()} • {post.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
