import { describe, expect, it } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("Anthropic API Integration", () => {
  it("should successfully call Claude 3.5 Sonnet via the LLM helper", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with exactly one word.",
        },
        {
          role: "user",
          content: "Say 'success'",
        },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]?.message?.content).toBeDefined();
    expect(typeof response.choices[0]?.message?.content).toBe("string");
    // The response should contain something close to "success"
    const content = (response.choices[0]?.message?.content || "").toLowerCase();
    expect(content).toContain("success");
  });

  it("should handle structured JSON responses", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a JSON generator. Output valid JSON only.",
        },
        {
          role: "user",
          content: 'Generate a JSON object with fields "name" and "status".',
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "test_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              status: { type: "string" },
            },
            required: ["name", "status"],
            additionalProperties: false,
          },
        },
      },
    });

    expect(response).toBeDefined();
    expect(response.choices[0]?.message?.content).toBeDefined();
    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("status");
    }
  });
});
