export type ToolRisk = "low" | "medium" | "high" | "critical";
export type ApprovalDecisionKind = "approved" | "denied" | "expired";

export interface ToolCallProposal<TArgs = Record<string, unknown>> {
  id: string;
  name: string;
  args: TArgs;
  reason?: string;
  proposedAt: string;
}

export interface RiskRule {
  matchName: RegExp;
  risk: ToolRisk;
  label: string;
  requiresHuman: boolean;
}

export interface RiskAssessment {
  risk: ToolRisk;
  label: string;
  requiresHuman: boolean;
  matchedRule?: string;
}

export interface ApprovalRequest<TArgs = Record<string, unknown>> {
  id: string;
  proposal: ToolCallProposal<TArgs>;
  assessment: RiskAssessment;
  card: ApprovalCard;
  createdAt: string;
  expiresAt?: string;
}

export interface ApprovalCard {
  title: string;
  summary: string;
  riskLabel: string;
  primaryAction: "Approve" | "Run";
  secondaryAction: "Deny" | "Cancel";
  details: string[];
}

export interface ApprovalDecision {
  requestId: string;
  kind: ApprovalDecisionKind;
  decidedAt: string;
  userNote?: string;
}

export interface ToolResultForAgent<TOutput = unknown> {
  proposalId: string;
  status: "not_run" | "ran" | "blocked" | "failed";
  output?: TOutput;
  messageForModel: string;
}

export const defaultRiskRules: RiskRule[] = [
  { matchName: /shell|terminal|exec|command/i, risk: "critical", label: "Can execute shell commands", requiresHuman: true },
  { matchName: /write|patch|delete|rename|move/i, risk: "high", label: "Can modify files", requiresHuman: true },
  { matchName: /network|fetch|http|browser/i, risk: "medium", label: "Can access network or browser surface", requiresHuman: true },
  { matchName: /read|list|search/i, risk: "low", label: "Read-only project inspection", requiresHuman: false },
];

export function assessToolRisk(proposal: ToolCallProposal<unknown>, rules: RiskRule[] = defaultRiskRules): RiskAssessment {
  const matched = rules.find(rule => rule.matchName.test(proposal.name));
  if (!matched) {
    return { risk: "medium", label: "Unknown tool capability", requiresHuman: true };
  }
  return {
    risk: matched.risk,
    label: matched.label,
    requiresHuman: matched.requiresHuman,
    matchedRule: String(matched.matchName),
  };
}

export function createApprovalRequest<TArgs>(
  proposal: ToolCallProposal<TArgs>,
  options: { now?: Date; expiresInMs?: number; rules?: RiskRule[] } = {},
): ApprovalRequest<TArgs> {
  const now = options.now ?? new Date();
  const expiresAt = options.expiresInMs ? new Date(now.getTime() + options.expiresInMs).toISOString() : undefined;
  const assessment = assessToolRisk(proposal, options.rules);
  return {
    id: `approval_${proposal.id}`,
    proposal,
    assessment,
    createdAt: now.toISOString(),
    expiresAt,
    card: buildApprovalCard(proposal, assessment),
  };
}

export function buildApprovalCard(proposal: ToolCallProposal<unknown>, assessment: RiskAssessment): ApprovalCard {
  return {
    title: `Allow agent tool: ${proposal.name}?`,
    summary: proposal.reason ?? "The agent requested permission to run a tool.",
    riskLabel: `${assessment.risk.toUpperCase()}: ${assessment.label}`,
    primaryAction: assessment.requiresHuman ? "Approve" : "Run",
    secondaryAction: assessment.requiresHuman ? "Deny" : "Cancel",
    details: summarizeArgs(proposal.args),
  };
}

export function decisionToAgentResult<TOutput>(
  proposal: ToolCallProposal,
  decision: ApprovalDecision,
  output?: TOutput,
): ToolResultForAgent<TOutput> {
  if (decision.kind === "approved") {
    return {
      proposalId: proposal.id,
      status: output === undefined ? "not_run" : "ran",
      output,
      messageForModel: output === undefined
        ? "User approved this tool call. The host application has not run it yet."
        : "User approved this tool call and the host application returned a result.",
    };
  }
  return {
    proposalId: proposal.id,
    status: "blocked",
    messageForModel: decision.kind === "expired"
      ? "Tool call was not run because the approval request expired."
      : `Tool call was not run because the user denied it.${decision.userNote ? ` User note: ${decision.userNote}` : ""}`,
  };
}

function summarizeArgs(args: unknown): string[] {
  if (!args || typeof args !== "object") return ["No structured arguments."];
  return Object.entries(args as Record<string, unknown>).map(([key, value]) => {
    const rendered = typeof value === "string" ? value : JSON.stringify(value);
    const short = rendered.length > 160 ? `${rendered.slice(0, 157)}...` : rendered;
    return `${key}: ${short}`;
  });
}
