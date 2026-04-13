import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";

const HELP_CATEGORIES = [
  { id: "getting_started", label: "Getting Started", icon: "🚀", count: 5 },
  { id: "eligibility", label: "Eligibility", icon: "✓", count: 8 },
  { id: "documents", label: "Documents", icon: "📄", count: 12 },
  { id: "forms", label: "Forms", icon: "📋", count: 6 },
  { id: "status", label: "Application Status", icon: "📊", count: 4 },
  { id: "payment", label: "Payment", icon: "💳", count: 5 },
  { id: "legal", label: "Legal Information", icon: "⚖️", count: 7 },
  { id: "faq", label: "FAQ", icon: "❓", count: 15 },
];

// Mock help articles - replace with tRPC call once database is set up
const MOCK_HELP_ARTICLES = [
  {
    id: 1,
    title: "How to Create an Account",
    slug: "how-to-create-account",
    category: "getting_started",
    viewCount: 456,
  },
  {
    id: 2,
    title: "What Documents Do I Need?",
    slug: "what-documents-needed",
    category: "documents",
    viewCount: 234,
  },
  {
    id: 3,
    title: "Understanding Waiting Periods",
    slug: "understanding-waiting-periods",
    category: "eligibility",
    viewCount: 189,
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = MOCK_HELP_ARTICLES.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers to your questions about record suspensions and PardonPath.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {HELP_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                selectedCategory === category.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-semibold">{category.label}</h3>
              <p className="text-sm text-muted-foreground">{category.count} articles</p>
            </button>
          ))}
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory ? `${HELP_CATEGORIES.find(c => c.id === selectedCategory)?.label} Articles` : "All Articles"}
          </h2>

          {filteredArticles.length > 0 ? (
            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/help/${article.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {article.viewCount} people found this helpful
                        </p>
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          )}
        </div>

        {/* Still need help? */}
        <div className="mt-16 p-8 bg-muted rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Contact our support team.
          </p>
          <Link href="/contact">
            <Button>Contact Support</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
