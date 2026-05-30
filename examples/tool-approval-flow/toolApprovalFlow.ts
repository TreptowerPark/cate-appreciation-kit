import {
  createApprovalRequest,
  decisionToAgentResult,
  type ApprovalDecision,
  type ToolCallProposal,
} from "../../packages/tool-approval-protocol/src/index.js";

const proposal: ToolCallProposal<{ command: string; cwd: string }> = {
  id: "tool_001",
  name: "shell.exec",
  args: { command: "npm test", cwd: "project-root" },
  reason: "Run the test suite before suggesting a patch.",
  proposedAt: new Date().toISOString(),
};

const request = createApprovalRequest(proposal, { expiresInMs: 60_000 });

// Render request.card in your app. Do not run dangerous tools before approval.
export const approvalCardForUi = request.card;

const userDecision: ApprovalDecision = {
  requestId: request.id,
  kind: "approved",
  decidedAt: new Date().toISOString(),
};

// Host app runs the tool only after approval, then returns concise result to model.
export const resultForAgent = decisionToAgentResult(proposal, userDecision, {
  exitCode: 0,
  summary: "All tests passed.",
});
