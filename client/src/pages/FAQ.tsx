import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<number | null>(0);

  useEffect(() => {
    document.title = "FAQ | PardonPath";
    document.head.appendChild(
      Object.assign(document.createElement("meta"), {
        name: "description",
        content: "Frequently Asked Questions about PardonPath record suspension services.",
      })
    );
  }, []);

  const faqs = [
    {
      id: 1,
      question: "What is a record suspension?",
      answer:
        "A record suspension (formerly called a pardon) is a legal process that removes your criminal record from public access in Canada. Once granted, you can legally say you don't have a criminal record.",
    },
    {
      id: 2,
      question: "Am I eligible for a record suspension?",
      answer:
        "Eligibility depends on several factors including the type of offense, time elapsed since completion of sentence, and whether you have any subsequent convictions. Use our eligibility checker to find out.",
    },
    {
      id: 3,
      question: "How long does the process take?",
      answer:
        "With PardonPath, the process typically takes 4-8 weeks from application submission to decision. The Parole Board of Canada then takes 2-4 weeks to make their decision.",
    },
    {
      id: 4,
      question: "What documents do I need?",
      answer:
        "You'll need your criminal record, employment references, and proof of rehabilitation. Our platform guides you through exactly what's needed for your specific situation.",
    },
    {
      id: 5,
      question: "How much does it cost?",
      answer:
        "PardonPath offers transparent pricing with no upfront fees. We charge a service fee only when your application is approved. Prices vary by tier (DIY, Standard, Premium).",
    },
    {
      id: 6,
      question: "Will my record suspension be guaranteed?",
      answer:
        "While we can't guarantee approval, our expert paralegals ensure your application meets all Parole Board requirements. Our approval rate is significantly higher than average.",
    },
    {
      id: 7,
      question: "Can I work while my application is pending?",
      answer:
        "Yes! Your criminal record remains on file until the Parole Board makes a decision. You can continue working and living normally during the process.",
    },
    {
      id: 8,
      question: "What if my application is denied?",
      answer:
        "If denied, you can reapply after one year. We'll help you understand why and what changes might improve your chances on the next application.",
    },
    {
      id: 9,
      question: "Is my information secure?",
      answer:
        "Yes. We use military-grade AES-256-GCM encryption for all sensitive information and comply with PIPEDA (Canada's privacy law). Your data is never shared with third parties.",
    },
    {
      id: 10,
      question: "Do you offer payment plans?",
      answer:
        "Yes. We offer flexible payment plans for all tiers. Contact our support team to discuss options that work for your budget.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-rose/10 to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about record suspension and PardonPath.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card
                key={faq.id}
                className="border-border cursor-pointer hover:border-deep-rose/50 transition-colors"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-foreground">{faq.question}</CardTitle>
                    <ChevronDown
                      className={`w-5 h-5 text-deep-rose transition-transform ${
                        expandedId === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CardHeader>
                {expandedId === faq.id && (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Still have questions?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our support team is ready to help. Get in touch with us anytime.
          </p>
          <Button className="bg-deep-rose hover:bg-deep-rose/90">Contact Support</Button>
        </div>
      </section>
    </div>
  );
}
