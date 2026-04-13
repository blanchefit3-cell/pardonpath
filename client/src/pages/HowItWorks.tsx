import { CheckCircle2, FileText, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function HowItWorks() {
  const [, setLocation] = useLocation();

  const steps = [
    {
      number: 1,
      title: "Eligibility Check",
      description: "Answer a few questions about your criminal record. Our AI-powered system instantly determines if you qualify for a record suspension.",
      icon: CheckCircle2,
      details: [
        "Takes 5-10 minutes",
        "No personal information stored",
        "Instant results",
      ],
    },
    {
      number: 2,
      title: "Document Submission",
      description: "Upload your supporting documents securely. We'll review them for completeness and accuracy using AI-assisted analysis.",
      icon: FileText,
      details: [
        "Police certificate",
        "Court records",
        "ID documentation",
        "Encrypted storage",
      ],
    },
    {
      number: 3,
      title: "Paralegal Review",
      description: "Our expert paralegals review your application and documents. They ensure everything meets Parole Board of Canada standards.",
      icon: Users,
      details: [
        "Expert review",
        "Quality assurance",
        "Real-time updates",
        "Direct communication",
      ],
    },
    {
      number: 4,
      title: "PBC Submission",
      description: "Your completed application is submitted to the Parole Board of Canada. We track the status and notify you of any updates.",
      icon: Award,
      details: [
        "Official submission",
        "Status tracking",
        "Decision notification",
        "Post-decision support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              How PardonPath Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A streamlined 4-step process to clear your criminal record. From eligibility check to Parole Board submission, we guide you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Timeline */}
            <div className="space-y-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="flex gap-8">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                        {step.number}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-1 h-32 bg-border" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-start gap-3 mb-4">
                        <Icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground mt-2">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="ml-9 bg-muted/50 rounded-lg p-4">
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose PardonPath?
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI-Powered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Advanced AI analyzes your eligibility and documents for accuracy and completeness.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expert Paralegals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Experienced paralegals review every application to ensure Parole Board standards.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transparent Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No hidden fees. Choose the service level that fits your needs and budget.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-Time Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monitor your application status in real-time with milestone notifications.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Secure & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    PIPEDA-compliant encryption protects your sensitive information at every step.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Full Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our team provides guidance and support throughout your entire journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Estimate Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Timeline Estimate
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">5-10 min</div>
                <p className="text-sm text-muted-foreground">Eligibility Check</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1-2 days</div>
                <p className="text-sm text-muted-foreground">Document Review</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">3-5 days</div>
                <p className="text-sm text-muted-foreground">Paralegal Review</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">6-12 months</div>
                <p className="text-sm text-muted-foreground">PBC Decision</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Clear Your Record?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Start your journey to a clean slate today. Check your eligibility in just 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLocation("/login")}
              >
                Start Application
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/pricing")}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
