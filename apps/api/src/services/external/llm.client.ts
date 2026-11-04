import OpenAI from 'openai';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import { ServiceError } from '../base.service';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 45_000;

export type LlmJsonRequest = {
  system: string;
  user: string;
  schemaName?: string;
  timeoutMs?: number;
};

export function isLlmConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY?.trim());
}

function getConfig() {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) {
    throw new ServiceError(
      'AI is not configured. Set AI_API_KEY (and optionally AI_BASE_URL and AI_MODEL).',
      null,
      HTTP_STATUS_CODES.SERVICE_UNAVAILABLE
    );
  }

  return {
    apiKey,
    baseURL: process.env.AI_BASE_URL?.trim() || DEFAULT_BASE_URL,
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
  };
}

export async function completeJson(request: LlmJsonRequest): Promise<unknown> {
  const { apiKey, baseURL, model } = getConfig();
  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const client = new OpenAI({ apiKey, baseURL, timeout: timeoutMs, maxRetries: 0 });

  let completion: OpenAI.Chat.Completions.ChatCompletion;
  try {
    completion = await client.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: request.system },
        { role: 'user', content: request.user },
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed';
    throw new ServiceError(`AI request failed: ${message}`, error, HTTP_STATUS_CODES.BAD_GATEWAY);
  }

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new ServiceError('AI returned an empty response', null, HTTP_STATUS_CODES.BAD_GATEWAY);
  }

  try {
    return JSON.parse(content) as unknown;
  } catch (error) {
    throw new ServiceError('AI returned invalid JSON', error, HTTP_STATUS_CODES.BAD_GATEWAY);
  }
}
