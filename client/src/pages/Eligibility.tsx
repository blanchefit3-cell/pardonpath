import { AlertCircle, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";

export default function Eligibility() {
  const [, setLocation] = useLocation();

  const eligibilityCriteria = [
    {
      title: "Schedule 1 Offenses",
      description: "Most minor offenses are eligible for record suspension after 5 years of successful completion of sentence.",
      examples: ["Theft under $5,000", "Assault", "Mischief", "Fraud under $1,000"],
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Hybrid Offenses",
      description: "Offenses that can be prosecuted as either summary or indictable. Eligibility depends on how they were prosecuted.",
      examples: ["Assault with a weapon", "Sexual assault", "Uttering threats", "Dangerous driving"],
      icon: AlertCircle,
      color: "text-amber-600",
    },
    {
      title: "Waiting Periods",
      description: "You must wait a certain period after completing your sentence before applying for record suspension.",
      examples: ["Summary convictions: 5 years", "Indictable convictions: 10 years", "Pardoned offenses: Immediate"],
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Geographic Considerations",
      description: "Some offenses have specific provincial or federal considerations that may affect eligibility.",
      examples: ["Federal offenses", "Provincial offenses", "Multi-jurisdiction cases"],
      icon: MapPin,
      color: "text-purple-600",
    },
  ];

  const ineligibleOffenses = [
    "Sexual offenses against children",
    "Offenses against the state (treason, espionage)",
    "Certain violent crimes",
    "Offenses with mandatory minimum sentences",
    "Multiple convictions with specific patterns",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Am I Eligible?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Understand the eligibility criteria for record suspension in Canada. Our AI-powered checker will instantly determine if you qualify.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Check CTA */}
      <section className="py-12 bg-primary/10 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Quick Eligibility Check</h2>
            <p className="text-muted-foreground mb-6">
              Answer a few simple questions and get an instant eligibility assessment.
            </p>
            <Button
              size="lg"
              onClick={() => setLocation("/login")}
            >
              Start Eligibility Check
            </Button>
          </div>
        </div>
      </section>

      {/* Eligibility Criteria */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Eligibility Criteria
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {eligibilityCriteria.map((criteria, index) => {
                const Icon = criteria.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 ${criteria.color} flex-shrink-0 mt-1`} />
                        <div>
                          <CardTitle>{criteria.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {criteria.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Examples:</p>
                        <ul className="space-y-1">
                          {criteria.examples.map((example, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-primary" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Ineligible Offenses */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Generally Ineligible Offenses
            </h2>

            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The following offenses are generally not eligible for record suspension. However, each case is unique. Contact us for a personalized assessment.
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {ineligibleOffenses.map((offense, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{offense}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Waiting Periods Detailed */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Waiting Periods Explained
            </h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Summary Convictions</CardTitle>
                  <CardDescription>Minor offenses prosecuted in provincial court</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Waiting Period: 5 years</p>
                    <p className="text-muted-foreground">
                      You must wait 5 years from the completion of your sentence (including probation) before you can apply for a record suspension.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Example:</strong> If you completed probation on January 15, 2020, you can apply on January 15, 2025.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Indictable Convictions</CardTitle>
                  <CardDescription>Serious offenses prosecuted in superior court</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Waiting Period: 10 years</p>
                    <p className="text-muted-foreground">
                      You must wait 10 years from the completion of your sentence before you can apply for a record suspension.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Example:</strong> If you completed your sentence on March 1, 2015, you can apply on March 1, 2025.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Pardoned Offenses</CardTitle>
                  <CardDescription>Offenses that have already been pardoned</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Waiting Period: None (Immediate)</p>
                    <p className="text-muted-foreground">
                      If your offense has already been pardoned, you may be eligible to apply for a record suspension immediately.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Common Questions
            </h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's the difference between a pardon and record suspension?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A record suspension (formerly called a pardon) is the official removal of a criminal record from public access. The record still exists but is kept separate and apart from other criminal records.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I apply if I'm still on probation?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No, you must complete your entire sentence including probation before you can apply. The waiting period starts from the completion date.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I have multiple convictions?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    If you have multiple convictions, you must meet the eligibility requirements for all of them. The waiting period is based on the most serious conviction.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How long does the process take?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    After submission to the Parole Board of Canada, the process typically takes 6-12 months. Our team will keep you updated throughout.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Unsure About Your Eligibility?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Our AI-powered eligibility checker will provide a personalized assessment based on your specific situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLocation("/login")}
              >
                Check My Eligibility
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/contact")}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
