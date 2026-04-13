import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  FileText,
  Clock,
  ChevronRight,
  MapPin,
  Lock,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";


// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[oklch(0.55_0.18_15)] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight">PardonPath</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
          <Link href="/how-it-works" className="hover:text-zinc-900 transition-colors">How it works</Link>
          <Link href="/eligibility" className="hover:text-zinc-900 transition-colors">Eligibility</Link>
          <Link href="/pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link>
          <Link href="/faq" className="hover:text-zinc-900 transition-colors">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <button className="h-9 px-4 rounded-lg bg-[oklch(0.55_0.18_15)] text-white text-sm font-medium hover:bg-[oklch(0.48_0.18_15)] active:scale-[0.98] transition-all">
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <a href={"/login"} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                Sign in
              </a>
              <a
                href="/login"
                className="h-9 px-4 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:scale-[0.98] transition-all"
              >
                Get started
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Status Card (hero right-side visual) ─────────────────────────────────────
function StatusCard() {
  const steps = [
    { label: "Eligibility confirmed", done: true, date: "Mar 14" },
    { label: "Documents submitted", done: true, date: "Mar 22" },
    { label: "AI document review", done: true, date: "Mar 22" },
    { label: "Paralegal review", done: false, active: true, date: "In progress" },
    { label: "PBC submission", done: false, active: false, date: "Pending" },
    { label: "Decision received", done: false, active: false, date: "—" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-zinc-400 mb-0.5">Application #PP-2847</p>
          <p className="font-semibold text-zinc-900 text-sm">Marcus Okafor</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Under review
        </span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-400 mb-2">
          <span>Progress</span>
          <span>3 of 6 steps</span>
        </div>
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[oklch(0.55_0.18_15)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "50%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.done
                  ? "bg-[oklch(0.55_0.18_15)]"
                  : step.active
                  ? "border-2 border-amber-400 bg-white"
                  : "border border-zinc-200 bg-white"
              }`}
            >
              {step.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {step.active && !step.done && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className={`text-sm flex-1 ${step.done ? "text-zinc-900" : "text-zinc-400"}`}>
              {step.label}
            </span>
            <span className="text-xs text-zinc-400 font-mono">{step.date}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Lock className="w-3 h-3" strokeWidth={2} />
          PIPEDA encrypted
        </div>
        <button className="text-xs text-[oklch(0.55_0.18_15)] font-medium hover:underline flex items-center gap-1">
          View details <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const { user } = useAuth();
  return (
    <section className="min-h-[100dvh] flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-16 items-center py-20">
          <AnimatedSection>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 text-xs text-zinc-500 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Parole Board of Canada — Authorized Process
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-zinc-900 mb-6"
            >
              Clear your
              <br />
              <span className="text-[oklch(0.55_0.18_15)]">criminal record.</span>
              <br />
              Move forward.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-zinc-500 leading-relaxed max-w-[52ch] mb-10"
            >
              PardonPath guides Canadians through the record suspension process
              with AI-assisted document review, real-time status tracking, and
              expert paralegal oversight.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <a
                href={user ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 active:scale-[0.98] transition-all"
              >
                Check my eligibility
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-zinc-200 text-zinc-700 font-medium hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] transition-all"
              >
                See how it works
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-12 flex flex-wrap items-center gap-6 text-sm text-zinc-400"
            >
              {["No upfront fees", "PIPEDA compliant", "Paralegal reviewed"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                  {item}
                </span>
              ))}
            </motion.div>
          </AnimatedSection>

          <AnimatedSection className="hidden lg:block">
            <motion.div variants={fadeUp} custom={1}>
              <StatusCard />
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Check eligibility",
      body: "Answer a short questionnaire. Our engine checks waiting periods, offense types, and sentence completion against PBC criteria.",
      icon: <CheckCircle className="w-5 h-5" strokeWidth={1.5} />,
    },
    {
      num: "02",
      title: "Submit documents",
      body: "Upload court records, police certificates, and ID. Our AI reviews each file for completeness and flags missing elements before submission.",
      icon: <FileText className="w-5 h-5" strokeWidth={1.5} />,
    },
    {
      num: "03",
      title: "Paralegal review",
      body: "A licensed Canadian paralegal reviews your file, prepares the PBC application, and handles correspondence with the Parole Board.",
      icon: <Shield className="w-5 h-5" strokeWidth={1.5} />,
    },
    {
      num: "04",
      title: "Track your progress",
      body: "Real-time milestone updates from submission through to the Parole Board's decision. No more waiting in the dark.",
      icon: <Clock className="w-5 h-5" strokeWidth={1.5} />,
    },
  ];

  return (
    <section id="how-it-works" className="py-28 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <motion.p variants={fadeUp} custom={0} className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">
            The process
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 mb-16 max-w-[18ch]">
            From application to approval in four steps
          </motion.h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 rounded-2xl overflow-hidden">
          {steps.map((step, i) => (
            <AnimatedSection key={step.num}>
              <motion.div
                variants={fadeUp}
                custom={i * 0.3}
                className="bg-white p-8 md:p-10 flex flex-col gap-6 h-full"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-zinc-300 font-medium">{step.num}</span>
                  <span className="text-zinc-400">{step.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm max-w-[42ch]">{step.body}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Self-Guided",
      price: "Free",
      sub: "Do it yourself",
      features: [
        "Eligibility checker",
        "Document checklist",
        "RCMP fingerprint locator",
        "Step-by-step guidance",
      ],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Assisted",
      price: "$299",
      sub: "One-time fee",
      features: [
        "Everything in Self-Guided",
        "AI document completeness review",
        "Paralegal file review",
        "PBC form preparation",
        "Status tracking dashboard",
      ],
      cta: "Get started",
      highlight: true,
    },
    {
      name: "Full Service",
      price: "$799",
      sub: "One-time fee",
      features: [
        "Everything in Assisted",
        "Dedicated paralegal",
        "Direct PBC correspondence",
        "Priority processing",
        "Post-approval support",
      ],
      cta: "Talk to us",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <motion.p variants={fadeUp} custom={0} className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">
            Pricing
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-900 mb-4 max-w-[22ch]">
            Transparent pricing. No hidden fees.
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-zinc-500 mb-16 max-w-[52ch]">
            Choose the level of support that fits your situation. All plans include access to the eligibility checker.
          </motion.p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <AnimatedSection key={plan.name}>
              <motion.div
                variants={fadeUp}
                custom={i * 0.3}
                className={`rounded-2xl p-8 flex flex-col h-full ${
                  plan.highlight
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white"
                }`}
              >
                <div className="mb-8">
                  <p className="text-xs font-mono uppercase tracking-widest mb-4 text-zinc-400">
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-4xl font-bold tracking-tighter ${plan.highlight ? "text-white" : "text-zinc-900"}`}>
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{plan.sub}</p>
                </div>

                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-[oklch(0.75_0.12_15)]" : "text-[oklch(0.55_0.18_15)]"}`}
                        strokeWidth={2}
                      />
                      <span className={plan.highlight ? "text-zinc-300" : "text-zinc-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={"/login"}
                  className={`w-full h-11 rounded-xl flex items-center justify-center text-sm font-medium transition-all active:scale-[0.98] ${
                    plan.highlight
                      ? "bg-white text-zinc-900 hover:bg-zinc-100"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ() {
  const items = [
    {
      q: "Who qualifies for a record suspension in Canada?",
      a: "You may qualify if you have completed your sentence (including probation and fines), and the required waiting period has passed: 5 years for summary offences, 10 years for indictable offences.",
    },
    {
      q: "How long does the process take?",
      a: "The Parole Board of Canada typically takes 6–12 months to process a complete application. PardonPath helps you prepare a complete, accurate application to avoid delays.",
    },
    {
      q: "What documents do I need?",
      a: "You will need court documents, a local police records check, RCMP fingerprint-based criminal record check, proof of sentence completion, and character references. Our checklist guides you through each one.",
    },
    {
      q: "Is my information kept private?",
      a: "Yes. All data is encrypted at rest and in transit, stored on Canadian servers, and handled in full compliance with PIPEDA. We never share your information with third parties.",
    },
    {
      q: "What is the difference between a pardon and a record suspension?",
      a: "They are the same thing. The term 'pardon' was replaced by 'record suspension' in 2012 under the Safe Streets and Communities Act. A record suspension sets aside your criminal record in RCMP databases.",
    },
  ];

  return (
    <section id="faq" className="py-28 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-16">
          <AnimatedSection>
            <motion.p variants={fadeUp} custom={0} className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">
              FAQ
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-bold tracking-tighter text-zinc-900 mb-4">
              Common questions
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-zinc-500 text-sm leading-relaxed">
              Have more questions? Reach us at{" "}
              <a href="mailto:support@pardonpath.ca" className="text-zinc-900 underline underline-offset-2">
                support@pardonpath.ca
              </a>
            </motion.p>
          </AnimatedSection>

          <AnimatedSection className="divide-y divide-zinc-200">
            {items.map((item, i) => (
              <motion.details
                key={item.q}
                variants={fadeUp}
                custom={i * 0.2}
                className="group py-5"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none text-zinc-900 font-medium text-sm">
                  {item.q}
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" strokeWidth={2} />
                </summary>
                <p className="mt-3 text-zinc-500 text-sm leading-relaxed max-w-[60ch]">{item.a}</p>
              </motion.details>
            ))}
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <motion.div
            variants={fadeUp}
            custom={0}
            className="rounded-3xl bg-zinc-900 px-10 py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
          >
            <div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
                Start today
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-3 max-w-[28ch]">
                Your record does not define your future.
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-[48ch]">
                Thousands of Canadians have cleared their records and rebuilt their lives.
                Check your eligibility in under 5 minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <a
                href={"/login"}
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white text-zinc-900 font-medium hover:bg-zinc-100 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Check eligibility
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </a>
              <p className="text-xs text-zinc-500 text-center">Free. No credit card required.</p>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-[oklch(0.55_0.18_15)] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
              <span className="font-semibold text-zinc-900 text-sm tracking-tight">PardonPath</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-[24ch]">
              Canada's trusted record suspension platform.
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-400">
              <MapPin className="w-3 h-3" strokeWidth={2} />
              Canadian-owned. Canadian servers.
            </div>
          </div>

          {[
            {
              heading: "Product",
              links: ["Eligibility checker", "Document review", "Status tracking", "Pricing"],
            },
            {
              heading: "Legal",
              links: ["Privacy policy", "Terms of service", "PIPEDA compliance", "Cookie policy"],
            },
            {
              heading: "Support",
              links: ["Help centre", "Contact us", "Paralegal team", "Careers"],
            },
          ].map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-4">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© 2025 PardonPath Inc. All rights reserved.</p>
          <p>Not a law firm. Paralegal services provided by licensed Ontario paralegals.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
