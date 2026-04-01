/**
 * AI Settings Component
 * Extracts settings UI from AICompanion.tsx
 * Part of AICompanion.tsx refactoring (STARTED)
 */

import { motion } from 'framer-motion';
import { AIProvider, TTSProvider, Language, LANGUAGES } from './AIProviderAdapter';

interface AISettingsProps {
  // State
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
  availableVoices: SpeechSynthesisVoice[];
  
  // Setters
  onProviderChange: (provider: AIProvider) => void;
  onTTSProviderChange: (provider: TTSProvider) => void;
  onLanguageChange: (language: Language) => void;
  onAutoSpeakChange: (autoSpeak: boolean) => void;
  onSelectedVoiceChange: (voice: string) => void;
  onSpeechRateChange: (rate: number) => void;
  onGeminiKeyChange: (key: string) => void;
  onOpenAIKeyChange: (key: string) => void;
  onGroqKeyChange: (key: string) => void;
  onCohereKeyChange: (key: string) => void;
  onHuggingfaceKeyChange: (key: string) => void;
  onElevenlabsKeyChange: (key: string) => void;
  onSave: () => void;
}

export function AISettings({
  provider,
  ttsProvider,
  language,
  autoSpeak,
  selectedVoice,
  speechRate,
  geminiKey,
  openaiKey,
  groqKey,
  cohereKey,
  huggingfaceKey,
  elevenlabsKey,
  availableVoices,
  onProviderChange,
  onTTSProviderChange,
  onLanguageChange,
  onAutoSpeakChange,
  onSelectedVoiceChange,
  onSpeechRateChange,
  onGeminiKeyChange,
  onOpenAIKeyChange,
  onGroqKeyChange,
  onCohereKeyChange,
  onHuggingfaceKeyChange,
  onElevenlabsKeyChange,
  onSave,
}: AISettingsProps) {
  const getApiKey = () => {
    switch (provider) {
      case 'gemini': return geminiKey;
      case 'openai': return openaiKey;
      case 'groq': return groqKey;
      case 'cohere': return cohereKey;
      case 'huggingface': return huggingfaceKey;
      default: return '';
    }
  };

  const setApiKey = (key: string) => {
    switch (provider) {
      case 'gemini': onGeminiKeyChange(key); break;
      case 'openai': onOpenAIKeyChange(key); break;
      case 'groq': onGroqKeyChange(key); break;
      case 'cohere': onCohereKeyChange(key); break;
      case 'huggingface': onHuggingfaceKeyChange(key); break;
    }
  };

  const getVoiceLanguage = (lang: Language): string => {
    const langMap: Record<Language, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      hi: 'hi-IN',
      zh: 'zh-CN',
      ja: 'ja-JP',
      pt: 'pt-BR',
      ar: 'ar-SA',
    };
    return langMap[lang];
  };

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      className="overflow-hidden border-b border-border bg-muted/30"
    >
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {/* AI Provider */}
        <div>
          <label className="text-xs font-semibold mb-1 block">AI Provider</label>
          <div className="grid grid-cols-4 gap-1">
            {(['browser', 'groq', 'gemini', 'openai'] as AIProvider[]).map(p => (
              <button
                key={p}
                onClick={() => onProviderChange(p)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  provider === p
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {p === 'browser' ? '🌐 Browser' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {provider === 'browser' && '✅ Free, works offline, no API key needed'}
            {provider === 'groq' && '⚡ Free, fast, recommended'}
            {provider === 'gemini' && '🤖 Google AI'}
            {provider === 'openai' && '🔥 Best quality, paid'}
          </p>
        </div>

        {/* API Key (only if not browser) */}
        {provider !== 'browser' && (
          <div>
            <label className="text-xs font-semibold mb-1 block">API Key</label>
            <input
              type="password"
              value={getApiKey()}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
              className="w-full px-3 py-1.5 text-sm bg-transparent border border-[var(--gh-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-fg)] focus:border-[var(--gh-accent-fg)] text-[var(--gh-fg)] placeholder:text-[var(--gh-fg-muted)] transition-colors duration-150"
            />
          </div>
        )}

        {/* Language */}
        <div>
          <label className="text-xs font-semibold mb-1 block">Language</label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="w-full px-3 py-1.5 text-sm bg-transparent border border-[var(--gh-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-fg)] focus:border-[var(--gh-accent-fg)] text-[var(--gh-fg)] transition-colors duration-150"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* TTS Provider */}
        <div>
          <label className="text-xs font-semibold mb-1 block">Voice Provider (TTS)</label>
          <div className="grid grid-cols-3 gap-1">
            {(['webspeech', 'elevenlabs', 'openai'] as TTSProvider[]).map(p => (
              <button
                key={p}
                onClick={() => onTTSProviderChange(p)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  ttsProvider === p
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {p === 'webspeech' ? 'Browser' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {ttsProvider === 'webspeech' && '✅ Free, works without API key'}
            {ttsProvider === 'elevenlabs' && '🎙️ Best quality, free 10k/mo (API key needed)'}
            {ttsProvider === 'openai' && '🔊 High quality, paid (API key needed)'}
          </p>
        </div>

        {/* TTS API Key (if needed) */}
        {(ttsProvider === 'elevenlabs' || ttsProvider === 'openai') && (
          <div>
            <label className="text-xs font-semibold mb-1 block">
              {ttsProvider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'} TTS API Key
            </label>
            <input
              type="password"
              value={ttsProvider === 'elevenlabs' ? elevenlabsKey : openaiKey}
              onChange={(e) => {
                if (ttsProvider === 'elevenlabs') onElevenlabsKeyChange(e.target.value);
                else onOpenAIKeyChange(e.target.value);
              }}
              placeholder="Enter TTS API key"
              className="w-full px-3 py-1.5 text-sm bg-transparent border border-[var(--gh-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-fg)] focus:border-[var(--gh-accent-fg)] text-[var(--gh-fg)] placeholder:text-[var(--gh-fg-muted)] transition-colors duration-150"
            />
          </div>
        )}

        {/* Voice Selection (for Browser TTS) */}
        {ttsProvider === 'webspeech' && availableVoices.length > 0 && (
          <div>
            <label className="text-xs font-semibold mb-1 block">Voice Selection</label>
            <select
              value={selectedVoice}
              onChange={(e) => onSelectedVoiceChange(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-transparent border border-[var(--gh-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-fg)] focus:border-[var(--gh-accent-fg)] text-[var(--gh-fg)] transition-colors duration-150"
            >
              <option value="">Default Voice</option>
              {availableVoices
                .filter(voice => voice.lang.startsWith(getVoiceLanguage(language).split('-')[0]))
                .map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {availableVoices.filter(v => v.lang.startsWith(getVoiceLanguage(language).split('-')[0])).length} voices available for {LANGUAGES.find(l => l.code === language)?.name}
            </p>
          </div>
        )}

        {/* Speech Rate */}
        {ttsProvider === 'webspeech' && (
          <div>
            <label className="text-xs font-semibold mb-1 block">
              Speech Rate: {speechRate.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={speechRate}
              onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
        )}

        {/* Auto-speak */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto-speak"
            checked={autoSpeak}
            onChange={(e) => onAutoSpeakChange(e.target.checked)}
            className="h-[18px] w-[18px] rounded border-2 border-[var(--gh-border)] bg-[var(--gh-canvas)] checked:bg-[var(--gh-accent-emphasis)] checked:border-[var(--gh-accent-emphasis)] focus:outline-none focus:ring-2 focus:ring-[var(--gh-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--gh-canvas)] cursor-pointer transition-colors duration-150"
          />
          <label htmlFor="auto-speak" className="text-xs text-[var(--gh-fg)] cursor-pointer">
            Auto-speak responses (always on in voice mode)
          </label>
        </div>

        <button
          onClick={onSave}
          className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Save Settings
        </button>
      </div>
    </motion.div>
  );
}
