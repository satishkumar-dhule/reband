/**
 * AI Provider Adapter
 * Extracts AI provider logic into adapter pattern for cleaner architecture
 * Part of AICompanion.tsx refactoring (STARTED)
 */

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'cohere' | 'huggingface' | 'browser';
export type TTSProvider = 'elevenlabs' | 'openai' | 'webspeech';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh' | 'ja' | 'pt' | 'ar';

export interface AIRequest {
  provider: AIProvider;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
}

export interface AISettings {
  provider: AIProvider;
  ttsProvider: TTSProvider;
  language: Language;
  autoSpeak: boolean;
  selectedVoice: string;
  speechRate: number;
  geminiKey: string;
  openaiKey: string;
  groqKey: string;
  cohereKey: string;
  huggingfaceKey: string;
  elevenlabsKey: string;
}

// Re-export constants
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

/**
 * Main entry point for AI API calls
 * Routes to appropriate provider implementation
 */
export async function callAI(request: AIRequest): Promise<AIResponse> {
  switch (request.provider) {
    case 'gemini':
      return callGemini(request);
    case 'openai':
      return callOpenAI(request);
    case 'groq':
      return callGroq(request);
    case 'cohere':
      return callCohere(request);
    case 'huggingface':
      return callHuggingFace(request);
    case 'browser':
      return callBrowserLLM(request);
    default:
      throw new Error(`Unsupported provider: ${request.provider}`);
  }
}

// ============ Provider Implementations ============

async function callGroq(request: AIRequest): Promise<AIResponse> {
  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.2-90b-text-preview',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ];

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: request.messages,
          temperature: 0.7,
          max_tokens: 250,
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return {
          content: data.choices[0]?.message?.content,
          provider: 'groq',
          model,
        };
      }
    } catch {
      // Continue to next model
    }
  }
  throw new Error('All Groq models failed');
}

async function callGemini(request: AIRequest): Promise<AIResponse> {
  const models = [
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest',
    'gemini-pro',
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${request.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: request.messages[0]?.content }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 250,
            },
          }),
        }
      );

      if (!response.ok) continue;
      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          content: data.candidates[0]?.content?.parts?.[0]?.text,
          provider: 'gemini',
          model,
        };
      }
    } catch {
      // Continue to next model
    }
  }
  throw new Error('All Gemini models failed');
}

async function callOpenAI(request: AIRequest): Promise<AIResponse> {
  const models = ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  for (const model of models) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: request.messages,
          temperature: 0.7,
          max_tokens: 250,
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return {
          content: data.choices[0]?.message?.content,
          provider: 'openai',
          model,
        };
      }
    } catch {
      // Continue to next model
    }
  }
  throw new Error('All OpenAI models failed');
}

async function callCohere(request: AIRequest): Promise<AIResponse> {
  const models = ['command-r-plus', 'command-r', 'command'];

  for (const model of models) {
    try {
      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          prompt: request.messages[0]?.content,
          max_tokens: 250,
          temperature: 0.7,
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      if (data.generations?.[0]?.text) {
        return {
          content: data.generations[0]?.text,
          provider: 'cohere',
          model,
        };
      }
    } catch {
      // Continue to next model
    }
  }
  throw new Error('All Cohere models failed');
}

async function callHuggingFace(request: AIRequest): Promise<AIResponse> {
  const models = [
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'mistralai/Mistral-7B-Instruct-v0.2',
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${request.apiKey}`,
          },
          body: JSON.stringify({
            inputs: request.messages[0]?.content,
            parameters: { max_new_tokens: 1024, temperature: 0.7 },
          }),
        }
      );

      if (!response.ok) continue;
      const data = await response.json();
      if (data[0]?.generated_text) {
        return {
          content: data[0]?.generated_text,
          provider: 'huggingface',
          model,
        };
      }
    } catch {
      // Continue to next model
    }
  }
  throw new Error('All HuggingFace models failed');
}

async function callBrowserLLM(request: AIRequest): Promise<AIResponse> {
  // Browser LLM requires special handling - WebLLM engine
  // This is a stub that returns a message to use browser fallback
  return {
    content: '__USE_BROWSER_LLM__',
    provider: 'browser',
    model: 'Phi-3-mini-4k',
  };
}

// ============ TTS Providers ============

export interface TTSRequest {
  provider: TTSProvider;
  apiKey: string;
  text: string;
  voice?: string;
  language?: Language;
}

export async function callTTS(request: TTSRequest): Promise<AudioData | string> {
  switch (request.provider) {
    case 'elevenlabs':
      return callElevenLabsTTS(request);
    case 'openai':
      return callOpenAITTS(request);
    case 'webspeech':
      return { type: 'webspeech', text: request.text };
    default:
      throw new Error(`Unsupported TTS provider: ${request.provider}`);
  }
}

interface AudioData {
  type: string;
  audioUrl?: string;
  text: string;
}

async function callElevenLabsTTS(request: TTSRequest): Promise<AudioData> {
  const voiceMap: Record<Language, string> = {
    en: 'EXAVITQu4vr4xnSDxMaL',
    es: 'VR6AewLTigWG4xSOukaG',
    fr: 'cgSgspJ2msm6clMCkdW9',
    de: 'iP95p4xoKVk53GoZ742B',
    hi: 'pFZP5JQG7iQjIQuC4Bku',
    zh: 'XB0fDUnXU5powFXDhCwa',
    ja: 'jBpfuIE2acCO8z3wKNLl',
    pt: 'yoZ06aMxZJJ28mfd3POQ',
    ar: 'zrHiDUmCz8N6OhX4oXhE',
  };

  const voiceId = voiceMap[request.language || 'en'];

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${request.apiKey}`,
    },
    body: JSON.stringify({
      text: request.text,
      model_id: 'eleven_multilingual_v2',
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  return { type: 'elevenlabs', audioUrl, text: request.text };
}

async function callOpenAITTS(request: TTSRequest): Promise<AudioData> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${request.apiKey}`,
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      voice: 'alloy',
      input: request.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI TTS failed: ${response.statusText}`);
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  return { type: 'openai', audioUrl, text: request.text };
}
