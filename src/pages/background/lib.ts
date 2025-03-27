import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";

const model = "perplexity/sonar";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error(
    "OpenRouter API key not found. Please ensure you have:",
    "\n1. Created a .env file in the root directory",
    "\n2. Added OPENROUTER_API_KEY=your_api_key to the .env file",
    "\n3. Restarted the development server"
  );
  throw new Error("OpenRouter API key not found in environment variables.");
}

const openRouter = createOpenRouter({
  apiKey: OPENROUTER_API_KEY,
});

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface GeneratePerplexityOptions {
  model: string;
  temperature?: number;
  system?: string;
  messages: Message[];
}

interface PerplexityResponse {
  content: string;
  citations: string[];
}

interface PageInfo {
  title: string;
  url: string;
  text: string;
}

interface TruthResult {
  success: true;
  accuracy: string;
  explanation: string;
  citations: string[];
  timing: {
    perplexity: string;
    objectGeneration: string;
    total: string;
  };
}

interface TruthError {
  success: false;
  error: string;
  details?: unknown;
}

type TruthResponse = TruthResult | TruthError;

export async function truth(pageInfo: PageInfo): Promise<TruthResponse> {
  try {
    const { accuracy, explanation, citations, timing } = await getAccuracy(
      pageInfo
    );

    return {
      success: true,
      accuracy,
      explanation,
      citations,
      timing,
    };
  } catch (error) {
    console.error("Error in truth function:", error);
    return {
      success: false,
      error: "Failed to analyze the statement",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getAccuracy(pageInfo: PageInfo) {
  try {
    // Start timer for perplexity
    const perplexityStart = performance.now();
    const { content, citations } = await generatePerplexity({
      model,
      temperature: 0,
      system: `
      You are a fact-checking extension which attempts to give correct answers as much as possible and interprets things literally. You feel very comfortable responding with "Somewhere in between" or "I don't know" if you are not sure. You only respond with "Almost certainly true" or "Almost certainly false" if you are very sure.
      `,
      messages: [
        {
          role: "user",
          content: `Is the following statement true or false? Please respond with one of the allowed phrases and then explain why.

Source URL: ${pageInfo.url}
Page Title: ${pageInfo.title}
Statement to verify: ${pageInfo.text}
        `,
        },
      ],
    });
    const perplexityTime = performance.now() - perplexityStart;

    // Start timer for object generation
    const objectStart = performance.now();
    const { object: accuracy } = await generateObject({
      model: openRouter.languageModel("gpt-4o"),
      output: "enum",
      enum: [
        "Almost certainly true",
        "Somewhere in between",
        "I don't know",
        "Requires more context",
        "Almost certainly false",
      ],
      prompt: `
      Choose one of the following phrases:
      - Almost certainly true
      - Somewhere in between
      - I don't know
      - Requires more context
      - Almost certainly false

      Based on the following response:
      ${content}
      `,
    });
    const objectTime = performance.now() - objectStart;

    return {
      accuracy,
      explanation: content,
      citations,
      timing: {
        perplexity: `${(perplexityTime / 1000).toFixed(2)}s`,
        objectGeneration: `${(objectTime / 1000).toFixed(2)}s`,
        total: `${((perplexityTime + objectTime) / 1000).toFixed(2)}s`,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to analyze accuracy: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function generatePerplexity({
  model,
  temperature = 0,
  system = "",
  messages,
}: GeneratePerplexityOptions): Promise<PerplexityResponse> {
  const systemMessage = system
    ? { role: "system" as const, content: system }
    : null;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://github.com/robg3/",
        "X-Title": "Context Menu Truthy",
      },
      body: JSON.stringify({
        model,
        messages: systemMessage ? [systemMessage, ...messages] : messages,
        temperature,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  return {
    content: result.choices[0].message.content,
    citations: result.citations || [],
  };
}
