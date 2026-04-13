import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy | PardonPath";
    document.head.appendChild(
      Object.assign(document.createElement("meta"), {
        name: "description",
        content: "PardonPath Privacy Policy - Learn how we protect your personal information.",
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-invert">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          <strong>Last Updated:</strong> April 13, 2026
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">1. Introduction</h2>
        <p className="text-muted-foreground mb-4">
          PardonPath ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">2. Information We Collect</h2>
        <p className="text-muted-foreground mb-4">We collect information you provide directly, including:</p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
          <li>Personal identification information (name, email, phone number)</li>
          <li>Criminal history information (for eligibility assessment)</li>
          <li>Employment and reference information</li>
          <li>Payment information (processed securely)</li>
          <li>Document uploads (stored encrypted)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">3. How We Use Your Information</h2>
        <p className="text-muted-foreground mb-4">We use your information to:</p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
          <li>Process your record suspension application</li>
          <li>Communicate with you about your application status</li>
          <li>Provide customer support</li>
          <li>Comply with legal obligations</li>
          <li>Improve our services</li>
        </ul>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">4. Data Security</h2>
        <p className="text-muted-foreground mb-4">
          We implement industry-standard security measures including AES-256-GCM encryption for sensitive data, SSL/TLS for data in transit, and regular security audits. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">5. PIPEDA Compliance</h2>
        <p className="text-muted-foreground mb-4">
          PardonPath complies with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA). You have the right to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
          <li>Access your personal information</li>
          <li>Request corrections to inaccurate information</li>
          <li>Withdraw consent (subject to legal obligations)</li>
          <li>Request deletion of your information</li>
        </ul>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">6. Third-Party Services</h2>
        <p className="text-muted-foreground mb-4">
          We use third-party services for payment processing (Stripe), cloud storage (Supabase), and AI document review (Anthropic). These providers have their own privacy policies.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">7. Cookies</h2>
        <p className="text-muted-foreground mb-4">
          We use cookies for authentication and session management. You can disable cookies in your browser settings, but this may affect functionality.
        </p>

        <h2 className="text-2xl font-bold mt-12 mb-4 text-foreground">8. Contact Us</h2>
        <p className="text-muted-foreground mb-4">
          If you have questions about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <p className="text-muted-foreground">
          <strong>Email:</strong> privacy@pardonpath.ca<br />
          <strong>Address:</strong> Toronto, Ontario, Canada
        </p>
      </div>
    </div>
  );
}
