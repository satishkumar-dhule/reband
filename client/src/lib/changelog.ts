/**
 * Changelog data - fetched via GraphQL
 * Updated automatically by bots during build
 */

import { gql } from './graphql-client';
import { GET_CHANGELOG } from './graphql-queries';

export interface ChangelogEntry {
  date: string;
  type: 'added' | 'improved' | 'initial' | 'feature';
  title: string;
  description: string;
  details?: {
    questionsAdded?: number;
    questionsImproved?: number;
    channels?: string[];
    questionIds?: string[];
    features?: string[];
    activities?: Array<{ type: string; action: string; count: number }>;
  };
}

export interface ChangelogData {
  entries: ChangelogEntry[];
  stats: {
    totalQuestionsAdded: number;
    totalQuestionsImproved: number;
    lastUpdated: string;
  };
}

export const defaultChangelog: ChangelogData = {
  entries: [
    {
      date: new Date().toISOString().split('T')[0],
      type: 'feature',
      title: 'Platform Active',
      description: 'Questions served from Turso database with real-time bot updates.',
      details: {
        features: [
          'Questions served from Turso database',
          'Real-time updates from AI bots',
          'Improved API performance'
        ]
      }
    }
  ],
  stats: {
    totalQuestionsAdded: 0,
    totalQuestionsImproved: 0,
    lastUpdated: new Date().toISOString()
  }
};

export async function fetchChangelog(): Promise<ChangelogData> {
  try {
    const data = await gql<{ changelog: ChangelogData }>(GET_CHANGELOG);
    if (data?.changelog) return data.changelog;
  } catch {
    // Use default if fetch fails
  }
  return defaultChangelog;
}

export const changelog = defaultChangelog;
export default changelog;
