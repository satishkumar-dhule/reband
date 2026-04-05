/**
 * Shared markdown utilities — single source of truth.
 * Used by AnswerPanel, GenZAnswerPanel, UnifiedAnswerPanel and any future panels.
 */
import { createElement, type ReactNode } from 'react';

/**
 * Pre-process raw answer/explanation text to fix common LLM formatting issues
 * before handing it to react-markdown.
 */
export function preprocessMarkdown(text: string): string {
  if (!text) return '';
  let processed = text;

  // ── Protect code blocks first ──────────────────────────────────────────────
  const codeBlocks: string[] = [];
  processed = processed.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Remove stray ** markers that leaked inside code blocks
  codeBlocks.forEach((block, i) => {
    codeBlocks[i] = block.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, body) => {
      return '```' + lang + '\n' + body.replace(/\*\*/g, '') + '```';
    });
  });

  // ── Big-O notation ─────────────────────────────────────────────────────────
  processed = processed.replace(/([OΘΩ])\(([^)]+)\)/g, '`$1($2)`');

  // ── Bullet-character normalisation ────────────────────────────────────────
  processed = processed.replace(/^[•·]\s*/gm, '- ');

  // Inline bullets on a single line: "A • B • C" → separate list items
  if (processed.includes('•') || processed.includes('·')) {
    processed = processed.split('\n').map(line => {
      const count = (line.match(/[•·]/g) || []).length;
      if (count > 1 || (count === 1 && !line.trim().startsWith('•') && !line.trim().startsWith('·'))) {
        const parts = line.split(/[•·]/).map(p => p.trim()).filter(Boolean);
        if (parts.length > 1) return parts.map(p => `- ${p}`).join('\n');
      }
      return line.replace(/^[•·]\s*/, '- ');
    }).join('\n');
  }

  // ── Bold marker repairs ────────────────────────────────────────────────────
  processed = processed.replace(/\*\*\s*```/g, '**\n\n```');
  processed = processed.replace(/```\s*\*\*/g, '```\n\n**');
  processed = processed.replace(/^\*\*\s*$/gm, '');
  processed = processed.replace(/\*\*\s*\n\s*([^*]+)\*\*/g, '**$1**');

  // Nested list indentation ───────────────────────────────────────────────────
  const lines = processed.split('\n');
  const fixedLines: string[] = [];
  let inNestedList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isParent =
      /^-\s+\*\*[^*]+:\*\*\s*$/.test(trimmed) ||
      /^\*\*[^*]+:\*\*\s*$/.test(trimmed);

    if (isParent) {
      inNestedList = true;
      fixedLines.push(line);
      continue;
    }
    if (inNestedList && /^-\s+/.test(trimmed)) {
      fixedLines.push('  ' + trimmed);
      continue;
    }
    if (inNestedList && (!trimmed || !/^-\s+/.test(trimmed))) {
      inNestedList = false;
    }

    // Fix odd-count ** markers
    const boldCount = (line.match(/\*\*/g) || []).length;
    if (boldCount % 2 === 1) {
      if (trimmed.startsWith('**') && boldCount === 1) {
        fixedLines.push(line.replace(/^\s*\*\*\s*/, ''));
        continue;
      }
      if (trimmed.endsWith('**') && boldCount === 1) {
        fixedLines.push(line.replace(/\s*\*\*\s*$/, ''));
        continue;
      }
    }
    fixedLines.push(line);
  }
  processed = fixedLines.join('\n');

  // ── Cleanup ────────────────────────────────────────────────────────────────
  processed = processed.replace(/\n{3,}/g, '\n\n');
  processed = processed.replace(/^\n+/, '');

  // ── Restore code blocks ───────────────────────────────────────────────────
  codeBlocks.forEach((block, i) => {
    processed = processed.replace(`__CODE_BLOCK_${i}__`, block);
  });

  return processed;
}

/**
 * Render a string that may contain backtick-delimited inline code.
 * Returns React nodes with styled <code> elements.
 */
export function renderWithInlineCode(text: string): ReactNode {
  if (!text) return null;
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? createElement(
          'code',
          {
            key: i,
            className:
              'px-1.5 py-0.5 mx-0.5 bg-primary/15 text-primary rounded text-[0.9em] font-mono border border-primary/20',
          },
          part,
        )
      : part,
  );
}

/**
 * Returns true only for Mermaid diagram strings that are non-trivial and
 * likely to render correctly.
 */
export function isValidMermaidDiagram(diagram: string | undefined | null): boolean {
  if (!diagram || typeof diagram !== 'string') return false;
  const trimmed = diagram.trim();
  if (!trimmed || trimmed.length < 10) return false;

  const VALID_STARTS = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
    'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph', 'mindmap', 'timeline',
    'quadrantChart', 'sankey', 'xychart', 'block',
  ];
  const firstLine = trimmed.split('\n')[0].toLowerCase().trim();
  if (!VALID_STARTS.some(s => firstLine.startsWith(s.toLowerCase()))) return false;

  const contentLines = trimmed.split('\n').filter(l => {
    const ll = l.trim().toLowerCase();
    return ll && !ll.startsWith('%%') && !VALID_STARTS.some(s => ll.startsWith(s.toLowerCase()));
  });
  if (contentLines.length < 3) return false;

  const lc = trimmed.toLowerCase();
  if (
    (lc.includes('start') && lc.includes('end') && contentLines.length <= 3) ||
    (lc.match(/\bstart\b/g)?.length === 1 && lc.match(/\bend\b/g)?.length === 1 && contentLines.length <= 2)
  ) return false;

  return true;
}

/**
 * Shared difficulty config — single source of truth for colours/icons/labels.
 * Import the icon component from 'lucide-react' at call-site.
 */
export const DIFFICULTY_CONFIG = {
  beginner: {
    colorClass: 'text-green-500',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/20',
    ghLabel: 'gh-label-green',
    label: 'Beginner',
    labelShort: 'Easy',
  },
  intermediate: {
    colorClass: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/20',
    ghLabel: 'gh-label-yellow',
    label: 'Intermediate',
    labelShort: 'Medium',
  },
  advanced: {
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/20',
    ghLabel: 'gh-label-red',
    label: 'Advanced',
    labelShort: 'Hard',
  },
} as const;

export type Difficulty = keyof typeof DIFFICULTY_CONFIG;

export function getDifficultyConfig(difficulty: string) {
  return DIFFICULTY_CONFIG[difficulty as Difficulty] ?? DIFFICULTY_CONFIG.intermediate;
}
