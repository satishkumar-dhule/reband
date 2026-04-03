/**
 * Security: API Key Encryption Utilities
 * Uses Web Crypto API to encrypt sensitive data before storage
 */

const SALT_KEY = 'ai-companion-salt';

/**
 * Generate a random salt for key derivation
 * Uses session-specific salt that changes each session
 */
function getOrCreateSalt(): string {
  let salt = sessionStorage.getItem(SALT_KEY);
  if (!salt) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    salt = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(SALT_KEY, salt);
  }
  return salt;
}

/**
 * Derive an encryption key from the salt
 * Uses PBKDF2 with SHA-256
 */
async function deriveKey(salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(salt),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string using AES-GCM
 */
async function encrypt(plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(getOrCreateSalt());
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Convert to base64 string safely
  const binary = Array.from(combined).map(b => String.fromCharCode(b)).join('');
  return btoa(binary);
}

/**
 * Decrypt a string using AES-GCM
 */
async function decrypt(ciphertext: string): Promise<string> {
  try {
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const key = await deriveKey(getOrCreateSalt());
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    // If decryption fails, return empty string
    return '';
  }
}

/**
 * Secure storage wrapper for API keys
 * Encrypts before storing, decrypts when retrieving
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await encrypt(value);
    sessionStorage.setItem(key, encrypted);
  },
  
  async getItem(key: string): Promise<string | null> {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    return decrypt(encrypted);
  },
  
  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  },
};

/**
 * Store API keys securely in sessionStorage
 * Sensitive keys will be encrypted
 */
export interface AISettings {
  provider: string;
  ttsProvider: string;
  language: string;
  autoSpeak: boolean;
  selectedVoice: string;
  speechRate: number;
  geminiKey?: string;
  openaiKey?: string;
  groqKey?: string;
  cohereKey?: string;
  huggingfaceKey?: string;
  elevenlabsKey?: string;
}

const SETTINGS_KEY = 'ai-companion-settings';

/**
 * Save AI companion settings with encrypted API keys
 */
export async function saveAISettings(settings: AISettings): Promise<void> {
  const nonSensitive = {
    provider: settings.provider,
    ttsProvider: settings.ttsProvider,
    language: settings.language,
    autoSpeak: settings.autoSpeak,
    selectedVoice: settings.selectedVoice,
    speechRate: settings.speechRate,
  };
  
  // Encrypt each API key before storing
  const encryptedKeys: Partial<AISettings> = {};
  
  if (settings.geminiKey) encryptedKeys.geminiKey = await encrypt(settings.geminiKey);
  if (settings.openaiKey) encryptedKeys.openaiKey = await encrypt(settings.openaiKey);
  if (settings.groqKey) encryptedKeys.groqKey = await encrypt(settings.groqKey);
  if (settings.cohereKey) encryptedKeys.cohereKey = await encrypt(settings.cohereKey);
  if (settings.huggingfaceKey) encryptedKeys.huggingfaceKey = await encrypt(settings.huggingfaceKey);
  if (settings.elevenlabsKey) encryptedKeys.elevenlabsKey = await encrypt(settings.elevenlabsKey);
  
  // Store non-sensitive settings in plaintext, encrypted keys separately
  sessionStorage.setItem(SETTINGS_KEY, JSON.stringify(nonSensitive));
  
  // Store encrypted API keys
  const encryptedKeysKey = `${SETTINGS_KEY}-keys`;
  sessionStorage.setItem(encryptedKeysKey, JSON.stringify(encryptedKeys));
}

/**
 * Load AI companion settings with decrypted API keys
 */
export async function loadAISettings(): Promise<AISettings | null> {
  const saved = sessionStorage.getItem(SETTINGS_KEY);
  const encryptedKeysKey = `${SETTINGS_KEY}-keys`;
  const encryptedKeysSaved = sessionStorage.getItem(encryptedKeysKey);
  
  if (!saved) return null;
  
  try {
    const settings = JSON.parse(saved) as AISettings;
    const encryptedKeys = encryptedKeysSaved ? JSON.parse(encryptedKeysSaved) : {};
    
    // Decrypt each API key
    if (encryptedKeys.geminiKey) settings.geminiKey = await decrypt(encryptedKeys.geminiKey);
    if (encryptedKeys.openaiKey) settings.openaiKey = await decrypt(encryptedKeys.openaiKey);
    if (encryptedKeys.groqKey) settings.groqKey = await decrypt(encryptedKeys.groqKey);
    if (encryptedKeys.cohereKey) settings.cohereKey = await decrypt(encryptedKeys.cohereKey);
    if (encryptedKeys.huggingfaceKey) settings.huggingfaceKey = await decrypt(encryptedKeys.huggingfaceKey);
    if (encryptedKeys.elevenlabsKey) settings.elevenlabsKey = await decrypt(encryptedKeys.elevenlabsKey);
    
    return settings;
  } catch {
    return null;
  }
}

/**
 * Clear all AI companion settings including encrypted keys
 */
export function clearAISettings(): void {
  sessionStorage.removeItem(SETTINGS_KEY);
  sessionStorage.removeItem(`${SETTINGS_KEY}-keys`);
  sessionStorage.removeItem(SALT_KEY);
}
