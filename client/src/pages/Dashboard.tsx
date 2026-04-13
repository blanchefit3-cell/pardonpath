import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  Bell,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
type MilestoneStatus = "completed" | "in_progress" | "pending" | "skipped";

interface Milestone {
  id: string;
  label: string;
  description: string;
  status: MilestoneStatus;
  date?: string;
}

// ─── Milestone label/description map ────────────────────────────────────────
const MILESTONE_META: Record<string, { label: string; description: string }> = {
  intake_started:      { label: "Eligibility check started",   description: "Initial eligibility assessment begun." },
  intake_completed:    { label: "Eligibility confirmed",        description: "Your record qualifies for a suspension." },
  documents_submitted: { label: "Documents submitted",         description: "All required documents uploaded and received." },
  documents_approved:  { label: "AI document review",          description: "Automated completeness check passed." },
  form_generated:      { label: "Application form generated",  description: "PBC form pre-filled from your intake data." },
  form_submitted:      { label: "PBC submission",              description: "Application submitted to the Parole Board of Canada." },
  under_review:        { label: "Paralegal review",            description: "A certified paralegal is reviewing your application." },
  decision_received:   { label: "Decision received",           description: "The PBC has issued a decision on your application." },
  approved:            { label: "Record suspension approved",  description: "Congratulations — your record suspension has been granted." },
  rejected:            { label: "Application rejected",        description: "The PBC has declined this application." },
};

// Ordered pipeline (excluding 'rejected' which is a terminal branch)
const PIPELINE: string[] = [
  "intake_started", "intake_completed", "documents_submitted", "documents_approved",
  "form_generated", "form_submitted", "under_review", "decision_received", "approved",
];

// ─── Status colours ──────────────────────────────────────────────────────────
const statusConfig: Record<MilestoneStatus, { dot: string; line: string; text: string }> = {
  completed:   { dot: "bg-emerald-500",                        line: "bg-emerald-200", text: "text-emerald-600" },
  in_progress: { dot: "bg-amber-400 ring-4 ring-amber-100",   line: "bg-zinc-200",    text: "text-amber-600" },
  pending:     { dot: "bg-zinc-200",                           line: "bg-zinc-100",    text: "text-zinc-400" },
  skipped:     { dot: "bg-zinc-100",                           line: "bg-zinc-100",    text: "text-zinc-300" },
};

// ─── Milestone Row ───────────────────────────────────────────────────────────
function MilestoneRow({ milestone, index, isLast }: { milestone: Milestone; index: number; isLast: boolean }) {
  const cfg = statusConfig[milestone.status];
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      className="flex gap-4"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${cfg.dot}`} />
        {!isLast && <div className={`w-0.5 flex-1 mt-1 ${cfg.line}`} />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-sm font-medium ${milestone.status === "pending" ? "text-zinc-400" : "text-zinc-900"}`}>
              {milestone.label}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{milestone.description}</p>
          </div>
          {milestone.date && (
            <span className={`text-xs flex-shrink-0 ${cfg.text}`}>{milestone.date}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>Progress</span>
        <span>{completed} of {total} steps</span>
      </div>
      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[oklch(0.55_0.22_15)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Notification Card ───────────────────────────────────────────────────────
function NotificationCard({ message, time }: { message: string; time: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
      <div className="w-2 h-2 rounded-full bg-[oklch(0.55_0.22_15)] mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-700">{message}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// ─── Status badge helper ─────────────────────────────────────────────────────
function statusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    intake:     { label: "Intake",        className: "bg-blue-50 text-blue-700 border-blue-200" },
    documents:  { label: "Documents",     className: "bg-violet-50 text-violet-700 border-violet-200" },
    review:     { label: "Under review",  className: "bg-amber-50 text-amber-700 border-amber-200" },
    submission: { label: "Submitted",     className: "bg-sky-50 text-sky-700 border-sky-200" },
    decision:   { label: "Decision",      className: "bg-orange-50 text-orange-700 border-orange-200" },
    completed:  { label: "Approved",      className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rejected:   { label: "Rejected",      className: "bg-red-50 text-red-700 border-red-200" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-zinc-50 text-zinc-700 border-zinc-200" };
  return (
    <Badge className={`${cfg.className} hover:${cfg.className}`}>{cfg.label}</Badge>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  // Use applicationId = 1 as the demo application; in production this would
  // come from the user's active application list.
  const [applicationId] = useState(1);

  const statusQuery = trpc.status.getStatus.useQuery(
    { applicationId },
    { enabled: !!user, retry: 1 }
  );
  const milestonesQuery = trpc.status.getMilestones.useQuery(
    { applicationId },
    { enabled: !!user, retry: 1 }
  );
  const progressQuery = trpc.status.getProgress.useQuery(
    { applicationId },
    { enabled: !!user, retry: 1 }
  );

  // Build the milestone timeline from backend data, falling back to the full
  // pipeline with all steps as "pending" when no data is available yet.
  const milestones = useMemo<Milestone[]>(() => {
    const completedTypes = new Set<string>(
      (milestonesQuery.data ?? []).map((m: { milestoneType: string }) => m.milestoneType)
    );

    // The last completed milestone is "in_progress" if the application is not yet done
    const appStatus = statusQuery.data?.status ?? "intake";
    const isDone = appStatus === "completed" || appStatus === "rejected";

    return PIPELINE.map((type, i) => {
      const meta = MILESTONE_META[type] ?? { label: type, description: "" };
      const isCompleted = completedTypes.has(type);

      // Find the date from backend milestone data
      const backendMilestone = (milestonesQuery.data ?? []).find(
        (m: { milestoneType: string; completedAt: Date | null }) => m.milestoneType === type
      );
      const dateStr = backendMilestone?.completedAt
        ? backendMilestone.completedAt.toLocaleDateString("en-CA", { month: "short", day: "numeric" })
        : undefined;

      // Determine status
      let status: MilestoneStatus = "pending";
      if (isCompleted) {
        status = "completed";
      } else if (!isDone) {
        // The first non-completed step after all completed steps is "in_progress"
        const prevAllDone = PIPELINE.slice(0, i).every(t => completedTypes.has(t));
        if (prevAllDone) status = "in_progress";
      }

      return { id: type, label: meta.label, description: meta.description, status, date: dateStr };
    });
  }, [milestonesQuery.data, statusQuery.data]);

  const completedCount = milestones.filter(m => m.status === "completed").length;
  const currentStep = milestones.find(m => m.status === "in_progress");
  const appStatus = statusQuery.data?.status ?? "intake";

  // ── Auth loading ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  // ── Not signed in ──
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-zinc-300 mx-auto" />
          <p className="text-zinc-500">Please sign in to view your dashboard.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800">Sign in</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top nav */}
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-7 h-7 rounded-md bg-[oklch(0.55_0.22_15)] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-zinc-900 text-sm">PardonPath</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-zinc-100 transition-colors">
              <Bell className="w-4 h-4 text-zinc-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[oklch(0.55_0.22_15)] rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-zinc-100">
              <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <span className="text-sm text-zinc-700 hidden sm:block">{user.name || user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: Status + Timeline ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">
                    Application #{statusQuery.data?.id ? `PP-${String(statusQuery.data.id).padStart(4, "0")}` : "—"}
                  </p>
                  <h1 className="text-xl font-semibold text-zinc-900">{user.name || "Your Application"}</h1>
                </div>
                {statusQuery.isLoading ? (
                  <Loader2 className="w-4 h-4 text-zinc-300 animate-spin" />
                ) : statusQuery.isError ? (
                  <Badge className="bg-zinc-50 text-zinc-400 border-zinc-200">No application</Badge>
                ) : (
                  statusBadge(appStatus)
                )}
              </div>

              {progressQuery.isLoading ? (
                <div className="h-6 bg-zinc-100 rounded-full animate-pulse" />
              ) : (
                <ProgressBar
                  completed={progressQuery.data?.completedMilestones ?? completedCount}
                  total={progressQuery.data?.totalMilestones ?? PIPELINE.length}
                />
              )}

              {currentStep && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Currently: {currentStep.label}</p>
                    <p className="text-xs text-amber-600">{currentStep.description}</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {statusQuery.isError && !statusQuery.isLoading && (
                <div className="mt-4 p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <p className="text-sm text-zinc-500">No active application found. Start your eligibility check to begin.</p>
                </div>
              )}
            </motion.div>

            {/* Milestone timeline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-zinc-900 mb-6">Application timeline</h2>

              {milestonesQuery.isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-zinc-100 animate-pulse" />
                        {i < 4 && <div className="w-0.5 h-8 bg-zinc-100 mt-1 animate-pulse" />}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="h-4 bg-zinc-100 rounded w-40 animate-pulse mb-1" />
                        <div className="h-3 bg-zinc-50 rounded w-56 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {milestones.map((milestone, i) => (
                    <MilestoneRow
                      key={milestone.id}
                      milestone={milestone}
                      index={i}
                      isLast={i === milestones.length - 1}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Right column: Actions + Notifications ── */}
          <div className="space-y-6">

            {/* Next action card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              className="bg-zinc-900 rounded-2xl p-6 text-white"
            >
              <p className="text-xs text-zinc-400 mb-1">Next step</p>
              <h3 className="text-base font-semibold mb-2">
                {currentStep ? currentStep.label : "Start your application"}
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                {currentStep
                  ? currentStep.description
                  : "Complete the eligibility check to begin your record suspension journey."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white bg-transparent"
              >
                Contact support
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </motion.div>

            {/* Documents card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-900">Documents</h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs">
                  All approved
                </Badge>
              </div>
              <div className="space-y-2">
                {[
                  "RCMP criminal record check",
                  "Local police certificate",
                  "Court documents",
                  "Proof of identity",
                ].map((doc) => (
                  <div key={doc} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-zinc-600 truncate">{doc}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
              className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Recent updates</h3>
              {milestonesQuery.data && milestonesQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {[...milestonesQuery.data]
                    .sort((a: { completedAt: Date | null }, b: { completedAt: Date | null }) =>
                      (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)
                    )
                    .slice(0, 3)
                    .map((m: { id: number; milestoneType: string; completedAt: Date | null; notes: string | null }) => {
                      const meta = MILESTONE_META[m.milestoneType];
                      const dateStr = m.completedAt
                        ? m.completedAt.toLocaleString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "";
                      return (
                        <NotificationCard
                          key={m.id}
                          message={m.notes ?? meta?.label ?? m.milestoneType}
                          time={dateStr}
                        />
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No updates yet. Check back after your first milestone.</p>
              )}
            </motion.div>

            {/* Security badge */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
              <Shield className="w-3.5 h-3.5" />
              <span>PIPEDA encrypted · Data stored in Canada</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
