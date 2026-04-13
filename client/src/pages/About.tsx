import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function About() {
  useEffect(() => {
    document.title = "About PardonPath | Record Suspension Platform";
    document.head.appendChild(
      Object.assign(document.createElement("meta"), {
        name: "description",
        content:
          "Learn about PardonPath, Canada's AI-powered record suspension platform helping Canadians clear their criminal records.",
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-rose/10 to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            About PardonPath
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Empowering Canadians to reclaim their futures through streamlined record suspension services.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                PardonPath is dedicated to making record suspension accessible, affordable, and straightforward for every Canadian. We believe that past mistakes shouldn't define your future.
              </p>
              <p className="text-lg text-muted-foreground">
                Using AI-assisted document review, real-time status tracking, and expert paralegal oversight, we've reduced the record suspension process from months of confusion to a clear, guided journey.
              </p>
            </div>
            <Card className="border-deep-rose/20 bg-deep-rose/5">
              <CardHeader>
                <CardTitle className="text-deep-rose">By The Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-deep-rose">1000+</div>
                  <p className="text-muted-foreground">Canadians helped</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-deep-rose">$0</div>
                  <p className="text-muted-foreground">Upfront fees</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-deep-rose">3x</div>
                  <p className="text-muted-foreground">Faster than traditional methods</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-foreground text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Accessibility",
                description: "Record suspension shouldn't be a privilege. We're committed to making it affordable and easy for everyone.",
              },
              {
                title: "Transparency",
                description: "No hidden fees, no surprises. You'll know exactly where your application stands at every step.",
              },
              {
                title: "Expertise",
                description: "Our team of paralegals and AI specialists ensures your application meets all Parole Board requirements.",
              },
            ].map((value, i) => (
              <Card key={i} className="border-border">
                <CardHeader>
                  <CardTitle className="text-deep-rose">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-foreground text-center">Our Team</h2>
          <p className="text-lg text-muted-foreground text-center mb-8">
            PardonPath was founded by a team of legal professionals, software engineers, and advocates who've seen firsthand how a criminal record can derail lives. We're committed to changing that.
          </p>
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Our team includes former Parole Board staff, certified paralegals, and criminal justice advocates.
            </p>
            <Link href="/contact">
              <Button variant="outline">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-deep-rose/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Clear Your Record?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start your record suspension journey today. It takes just 5 minutes to check your eligibility.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-deep-rose hover:bg-deep-rose/90">
              Check My Eligibility
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
