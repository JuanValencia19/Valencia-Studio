import { openai } from "@ai-sdk/openai";

export function selectModel(task: "simple" | "moderate" | "complex") {
  const models = {
    simple: openai("gpt-4o-mini"),
    moderate: openai("gpt-4o-mini"),
    complex: openai("gpt-4o"),
  };
  return models[task];
}
