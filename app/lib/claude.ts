import type { AnalysisResult } from "@/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";

const PROVIDERS = {
  deepseek: {
    url: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
    apiKey: () => process.env.DEEPSEEK_API_KEY,
  },
  minimax: {
    url: "https://api.minimax.chat/v1/chat/completions",
    model: "MiniMax-Text-01",
    apiKey: () => process.env.MINIMAX_API_KEY,
  },
} as const;

function getProvider() {
  const name = (process.env.LLM_PROVIDER ?? "deepseek") as keyof typeof PROVIDERS;
  return PROVIDERS[name] ?? PROVIDERS.deepseek;
}

interface StreamOptions {
  systemPrompt?: string;
  userPrompt?: string;
}

export async function streamInterpretation(
  data: AnalysisResult | object,
  opts?: StreamOptions
): Promise<ReadableStream<Uint8Array>> {
  const provider = getProvider();
  const apiKey = provider.apiKey();

  const systemContent = opts?.systemPrompt ?? SYSTEM_PROMPT;
  const userContent = opts?.userPrompt ?? buildUserPrompt(data as AnalysisResult);

  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      stream: true,
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider.model} API error ${response.status}: ${err}`);
  }

  const encoder = new TextEncoder();
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const json = trimmed.slice(5).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // ignore malformed chunks
          }
        }
      }
      controller.close();
    },
    cancel() {
      reader.cancel();
    },
  });
}
