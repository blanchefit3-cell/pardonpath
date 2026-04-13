/**
 * Unit tests for the milestone pipeline logic that powers the Dashboard.
 * These tests validate the status-derivation algorithm (completed / in_progress / pending)
 * without any React or DOM dependencies.
 */
import { describe, it, expect } from "vitest";

// ─── Replicate the pipeline logic from Dashboard.tsx ─────────────────────────
type MilestoneStatus = "completed" | "in_progress" | "pending";

interface BackendMilestone {
  milestoneType: string;
  completedAt: Date | null;
  notes: string | null;
}

const PIPELINE = [
  "intake_started", "intake_completed", "documents_submitted", "documents_approved",
  "form_generated", "form_submitted", "under_review", "decision_received", "approved",
];

function buildMilestones(
  backendMilestones: BackendMilestone[],
  appStatus: string
): { id: string; status: MilestoneStatus }[] {
  const completedTypes = new Set<string>(backendMilestones.map(m => m.milestoneType));
  const isDone = appStatus === "completed" || appStatus === "rejected";

  return PIPELINE.map((type, i) => {
    let status: MilestoneStatus = "pending";
    if (completedTypes.has(type)) {
      status = "completed";
    } else if (!isDone) {
      const prevAllDone = PIPELINE.slice(0, i).every(t => completedTypes.has(t));
      if (prevAllDone) status = "in_progress";
    }
    return { id: type, status };
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Dashboard milestone pipeline logic", () => {
  it("marks all steps as pending when no milestones have been completed", () => {
    const result = buildMilestones([], "intake");
    expect(result[0].status).toBe("in_progress"); // first step is in_progress
    expect(result.slice(1).every(m => m.status === "pending")).toBe(true);
  });

  it("marks the first step as in_progress when no milestones are recorded", () => {
    const result = buildMilestones([], "intake");
    expect(result.find(m => m.id === "intake_started")?.status).toBe("in_progress");
  });

  it("marks completed milestones correctly and advances in_progress to next step", () => {
    const completed: BackendMilestone[] = [
      { milestoneType: "intake_started",   completedAt: new Date(), notes: null },
      { milestoneType: "intake_completed", completedAt: new Date(), notes: null },
    ];
    const result = buildMilestones(completed, "documents");
    expect(result.find(m => m.id === "intake_started")?.status).toBe("completed");
    expect(result.find(m => m.id === "intake_completed")?.status).toBe("completed");
    expect(result.find(m => m.id === "documents_submitted")?.status).toBe("in_progress");
    expect(result.find(m => m.id === "documents_approved")?.status).toBe("pending");
  });

  it("shows no in_progress step when application is completed", () => {
    const allCompleted: BackendMilestone[] = PIPELINE.map(type => ({
      milestoneType: type,
      completedAt: new Date(),
      notes: null,
    }));
    const result = buildMilestones(allCompleted, "completed");
    expect(result.every(m => m.status === "completed")).toBe(true);
    expect(result.find(m => m.status === "in_progress")).toBeUndefined();
  });

  it("shows no in_progress step when application is rejected", () => {
    const someCompleted: BackendMilestone[] = [
      { milestoneType: "intake_started",   completedAt: new Date(), notes: null },
      { milestoneType: "intake_completed", completedAt: new Date(), notes: null },
    ];
    const result = buildMilestones(someCompleted, "rejected");
    expect(result.find(m => m.status === "in_progress")).toBeUndefined();
    expect(result.find(m => m.id === "intake_started")?.status).toBe("completed");
    expect(result.find(m => m.id === "documents_submitted")?.status).toBe("pending");
  });

  it("pipeline has exactly 9 steps", () => {
    const result = buildMilestones([], "intake");
    expect(result).toHaveLength(9);
  });

  it("exactly one step is in_progress for a mid-pipeline application", () => {
    const completed: BackendMilestone[] = [
      { milestoneType: "intake_started",      completedAt: new Date(), notes: null },
      { milestoneType: "intake_completed",    completedAt: new Date(), notes: null },
      { milestoneType: "documents_submitted", completedAt: new Date(), notes: null },
    ];
    const result = buildMilestones(completed, "documents");
    const inProgressSteps = result.filter(m => m.status === "in_progress");
    expect(inProgressSteps).toHaveLength(1);
    expect(inProgressSteps[0].id).toBe("documents_approved");
  });
});
