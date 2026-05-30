import { describe, expect, it } from "vitest";

interface SecurityVector {
  name: string;
  input: string;
  mustNotContainAfterEscaping: string[];
}

export const aiOutputSecurityVectors: SecurityVector[] = [
  {
    name: "script tag",
    input: "Hello <script>alert('owned')</script>",
    mustNotContainAfterEscaping: ["<script", "</script>"],
  },
  {
    name: "image onerror",
    input: "<img src=x onerror=alert(1)>",
    mustNotContainAfterEscaping: ["<img"],
  },
  {
    name: "svg onload",
    input: "<svg onload=alert(1)><circle /></svg>",
    mustNotContainAfterEscaping: ["<svg"],
  },
  {
    name: "javascript url",
    input: "[click](javascript:alert(1))",
    mustNotContainAfterEscaping: ["javascript:alert"],
  },
  {
    name: "data url html",
    input: "[open](data:text/html,<script>alert(1)</script>)",
    mustNotContainAfterEscaping: ["data:text/html", "<script"],
  },
  {
    name: "malformed nested html",
    input: "<<script>img src=x onerror=alert(1)//<</script>",
    mustNotContainAfterEscaping: ["<script"],
  },
];

function escapeTextOnly(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stripDangerousUrlSchemes(input: string): string {
  return input.replace(/\b(?:javascript|data):/gi, "blocked:");
}

describe("AI output security vectors", () => {
  for (const vector of aiOutputSecurityVectors) {
    it(`neutralizes ${vector.name} in a text-only renderer`, () => {
      const rendered = stripDangerousUrlSchemes(escapeTextOnly(vector.input)).toLowerCase();
      for (const forbidden of vector.mustNotContainAfterEscaping) {
        expect(rendered).not.toContain(forbidden.toLowerCase());
      }
    });
  }
});
