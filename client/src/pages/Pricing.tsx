import { Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Pricing() {
  const [, setLocation] = useLocation();

  const tiers = [
    {
      name: "DIY",
      description: "Self-guided record suspension",
      price: 199,
      period: "one-time",
      highlight: false,
      features: [
        { name: "Eligibility checker", included: true },
        { name: "Document checklist", included: true },
        { name: "AI document review", included: true },
        { name: "Fingerprint locator", included: true },
        { name: "Form generation", included: true },
        { name: "Paralegal review", included: false },
        { name: "PBC submission", included: false },
        { name: "Status tracking", included: false },
        { name: "Email support", included: false },
        { name: "Priority support", included: false },
      ],
      cta: "Start DIY",
    },
    {
      name: "Done-With-You",
      description: "Expert guidance & support",
      price: 599,
      period: "one-time",
      highlight: true,
      badge: "Most Popular",
      features: [
        { name: "Eligibility checker", included: true },
        { name: "Document checklist", included: true },
        { name: "AI document review", included: true },
        { name: "Fingerprint locator", included: true },
        { name: "Form generation", included: true },
        { name: "Paralegal review", included: true },
        { name: "PBC submission", included: true },
        { name: "Status tracking", included: true },
        { name: "Email support", included: true },
        { name: "Priority support", included: false },
      ],
      cta: "Get Started",
    },
    {
      name: "Done-For-You",
      description: "Complete hands-off service",
      price: 1199,
      period: "one-time",
      highlight: false,
      features: [
        { name: "Eligibility checker", included: true },
        { name: "Document checklist", included: true },
        { name: "AI document review", included: true },
        { name: "Fingerprint locator", included: true },
        { name: "Form generation", included: true },
        { name: "Paralegal review", included: true },
        { name: "PBC submission", included: true },
        { name: "Status tracking", included: true },
        { name: "Email support", included: true },
        { name: "Priority support", included: true },
      ],
      cta: "Get Started",
    },
  ];

  const faqs = [
    {
      question: "Can I upgrade my tier later?",
      answer: "Yes, you can upgrade your tier at any time. You'll only pay the difference between your current tier and the new tier.",
    },
    {
      question: "Is there a money-back guarantee?",
      answer: "We offer a 30-day money-back guarantee if you're not satisfied with our service. No questions asked.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers.",
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees. The price you see is the price you pay. The only additional cost is the Parole Board of Canada application fee ($50-$100).",
    },
    {
      question: "How long does the process take?",
      answer: "After submission to the Parole Board of Canada, the process typically takes 6-12 months. Our team will keep you updated throughout.",
    },
    {
      question: "What if my application is rejected?",
      answer: "If your application is rejected, we'll provide guidance on next steps and support for reapplication. Your tier includes this support.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the service level that fits your needs. No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <div key={index} className={tier.highlight ? "md:scale-105" : ""}>
                <Card className={tier.highlight ? "border-primary shadow-lg" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                        <CardDescription>{tier.description}</CardDescription>
                      </div>
                      {tier.badge && (
                        <Badge className="bg-primary text-primary-foreground">
                          {tier.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">
                          ${tier.price}
                        </span>
                        <span className="text-muted-foreground">/{tier.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        + Parole Board fee ($50-$100)
                      </p>
                    </div>

                    <Button
                      size="lg"
                      className="w-full"
                      variant={tier.highlight ? "default" : "outline"}
                      onClick={() => setLocation("/login")}
                    >
                      {tier.cta}
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-4">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={
                              feature.included
                                ? "text-foreground"
                                : "text-muted-foreground line-through"
                            }
                          >
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Detailed Feature Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Feature
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">
                      DIY
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">
                      Done-With-You
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">
                      Done-For-You
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Eligibility Assessment",
                      diy: true,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "Document Checklist",
                      diy: true,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "AI Document Review",
                      diy: true,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "Fingerprint Locator",
                      diy: true,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "Form Generation",
                      diy: true,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "Expert Paralegal Review",
                      diy: false,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "PBC Submission",
                      diy: false,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "Real-Time Status Tracking",
                      diy: false,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "Email Support",
                      diy: false,
                      dwy: true,
                      dfy: true,
                    },
                    {
                      name: "Priority Support (24h response)",
                      diy: false,
                      dwy: false,
                      dfy: true,
                    },
                    {
                      name: "Dedicated Account Manager",
                      diy: false,
                      dwy: false,
                      dfy: true,
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4 text-foreground font-medium">
                        {row.name}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.diy ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.dwy ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.dfy ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
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
              Choose your service level and start your journey to a clean slate today.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation("/login")}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
