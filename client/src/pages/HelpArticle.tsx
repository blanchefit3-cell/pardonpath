import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, ThumbsUp, ThumbsDown } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function HelpArticle() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Fetch help article
  const { data: article, isLoading, error } = trpc.help.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Update document title and meta tags for SEO
  useEffect(() => {
    if (article) {
      const title = article.title;
      const description = article.content.substring(0, 160) || "";

      setSeoTitle(title);
      setSeoDescription(description);

      // Update document title
      document.title = title;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);

      // Update og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute("content", title);

      // Update og:description
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement("meta");
        ogDescription.setAttribute("property", "og:description");
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute("content", description);
    }
  }, [article]);

  const handleFeedback = (helpful: boolean) => {
    // In production, this would send feedback to the backend
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Button onClick={() => navigate("/help")} variant="outline" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Button>
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The help article you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/help")}>Return to Help Center</Button>
          </Card>
        </div>
      </div>
    );
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Button onClick={() => navigate("/help")} variant="outline" className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Button>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full capitalize">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">{article.title}</h1>

          {formattedDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          )}
        </header>

        {/* No excerpt for help articles - content starts immediately */}

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-12">
          <Streamdown>{article.content}</Streamdown>
        </div>

        {/* Feedback section */}
        <Card className="p-6 mb-8 bg-muted/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">Was this article helpful?</h3>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleFeedback(true)}
              disabled={feedbackSubmitted}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFeedback(false)}
              disabled={feedbackSubmitted}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              No
            </Button>
          </div>
          {feedbackSubmitted && (
            <p className="text-sm text-muted-foreground mt-4">Thank you for your feedback!</p>
          )}
        </Card>

        {/* Related articles */}
        <div className="border-t border-border pt-8">
          <Button onClick={() => navigate("/help")} className="w-full">
            View More Articles
          </Button>
        </div>
      </div>
    </article>
  );
}
