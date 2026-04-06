/**
 * API Switcher - Routes to static JSON or Express API based on environment
 * 
 * VITE_STATIC_MODE=true, running on github.io, or pages.dev -> use static JSON
 * otherwise -> use Express API (development mode)
 */

import { fetchChannels, fetchQuestionIds, fetchQuestion, fetchRandomQuestion, fetchStats, fetchSubChannels, fetchCompanies, fetchChannelQuestions, clearCache, invalidateChannel, type Question, type QuestionListItem, type ChannelStats, type ChannelDetailedStats } from './api-client';

const IS_STATIC = import.meta.env.VITE_STATIC_MODE === 'true' ||
                  (typeof window !== 'undefined' && (
                    window.location.hostname.includes('github.io') ||
                    window.location.hostname.includes('pages.dev') ||
                    window.location.hostname.includes('cloudflare')
                  ));

const API_BASE = '/api';

async function apiFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function fetchQuestions(channelId: string): Promise<Question[]> {
  if (IS_STATIC) {
    return fetchChannelQuestions(channelId);
  }
  return apiFetch<Question[]>(`/questions/${channelId}`);
}

export async function fetchQuestionsIndexed(
  channelId: string,
  subChannel?: string,
  difficulty?: string
): Promise<QuestionListItem[]> {
  if (IS_STATIC) {
    return fetchQuestionIds(channelId, subChannel, difficulty);
  }
  let endpoint = `/questions/${channelId}`;
  const params = new URLSearchParams();
  if (subChannel && subChannel !== 'all') params.set('subChannel', subChannel);
  if (difficulty && difficulty !== 'all') params.set('difficulty', difficulty);
  const query = params.toString();
  if (query) endpoint += `?${query}`;
  return apiFetch<QuestionListItem[]>(endpoint);
}

export { fetchChannels, fetchQuestion, fetchRandomQuestion, fetchStats, fetchSubChannels, fetchCompanies, clearCache, invalidateChannel };
export type { Question, QuestionListItem, ChannelStats, ChannelDetailedStats };

export const isStaticMode = IS_STATIC;
