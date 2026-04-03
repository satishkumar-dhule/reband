import { memo, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton loading primitives for GitHub-themed UI
 * These components provide visual loading states that match the app's design system
 */

/**
 * A single skeleton "bone" element for loading placeholders
 * Uses GitHub canvas-subtle color and pulse animation
 * 
 * @example
 * // Simple bone
 * <Bone />
 * 
 * // Custom size
 * <Bone className="h-8 w-32" />
 */
function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-[var(--gh-canvas-subtle)] animate-pulse",
        className
      )}
    />
  );
}

/**
 * App shell skeleton showing the standard layout structure
 * Includes sidebar navigation, header, and main content area
 * Used as wrapper for page-specific skeleton content
 * 
 * @param children - Page-specific skeleton content to render inside the shell
 * @example
 * <AppShell>
 *   <HomeSkeleton />
 * </AppShell>
 */
const AppShell = memo(function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--gh-canvas-default)]">
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-[var(--gh-border-default)] bg-[var(--gh-canvas-default)] p-3 gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <Bone key={i} className="h-8 w-full" />
        ))}
      </aside>
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-14 border-b border-[var(--gh-border-default)] px-4 flex items-center gap-3 shrink-0">
          <Bone className="h-7 w-32" />
          <Bone className="h-7 flex-1 max-w-xs" />
          <Bone className="h-7 w-7 ml-auto rounded-full" />
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
});

export const HomeSkeleton = memo(function HomeSkeleton() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Bone className="h-8 w-56" />
          <Bone className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bone key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          <Bone className="h-5 w-36" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bone key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
});

export const ChannelsSkeleton = memo(function ChannelsSkeleton() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Bone className="h-9 flex-1" />
          <Bone className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border border-[var(--gh-border-default)] rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Bone className="h-9 w-9 rounded-md shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Bone className="h-4 w-3/4" />
                  <Bone className="h-3 w-1/2" />
                </div>
              </div>
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-5/6" />
              <Bone className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
});

export const QuestionViewerSkeleton = memo(function QuestionViewerSkeleton() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-2">
          <Bone className="h-4 w-20" />
          <Bone className="h-4 w-4 rounded-full" />
          <Bone className="h-4 w-32" />
        </div>
        <div className="border border-[var(--gh-border-default)] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <Bone className="h-5 w-24 rounded-full" />
            <Bone className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-2.5">
            <Bone className="h-6 w-full" />
            <Bone className="h-6 w-4/5" />
            <Bone className="h-6 w-3/5" />
          </div>
          <Bone className="h-px w-full" />
          <div className="space-y-2">
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-5/6" />
            <Bone className="h-4 w-3/4" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Bone className="h-9 w-24 rounded-md" />
          <div className="flex gap-2">
            <Bone className="h-9 w-9 rounded-md" />
            <Bone className="h-9 w-9 rounded-md" />
          </div>
          <Bone className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </AppShell>
  );
});

export const CodingSkeleton = memo(function CodingSkeleton() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="space-y-2">
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-[var(--gh-border-default)] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Bone className="h-5 w-40" />
                <Bone className="h-5 w-16 rounded-full" />
              </div>
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-4/5" />
              <div className="flex gap-2 pt-1">
                <Bone className="h-5 w-16 rounded-full" />
                <Bone className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
});

export const StatsSkeleton = memo(function StatsSkeleton() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <Bone className="h-8 w-40" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-[var(--gh-border-default)] rounded-lg p-4 space-y-2">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-8 w-1/2" />
            </div>
          ))}
        </div>
        <Bone className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </AppShell>
  );
});

export const ReviewSkeleton = memo(function ReviewSkeleton() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <Bone className="h-7 w-36" />
          <Bone className="h-7 w-24 rounded-full" />
        </div>
        <Bone className="h-2 w-full rounded-full" />
        <div className="border border-[var(--gh-border-default)] rounded-xl p-6 space-y-5">
          <div className="space-y-2.5">
            <Bone className="h-6 w-full" />
            <Bone className="h-6 w-4/5" />
          </div>
          <Bone className="h-px w-full" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="h-4 w-full" style={{ width: `${100 - i * 8}%` }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    </AppShell>
  );
});

export const GenericPageSkeleton = memo(function GenericPageSkeleton() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-[var(--gh-border-default)] rounded-lg p-4 space-y-2">
              <Bone className="h-5 w-2/3" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
});

export const VoiceSkeleton = memo(function VoiceSkeleton() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 pt-4">
        <div className="text-center space-y-2">
          <Bone className="h-8 w-56 mx-auto" />
          <Bone className="h-4 w-72 mx-auto" />
        </div>
        <Bone className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="flex justify-center">
          <Bone className="h-14 w-14 rounded-full" />
        </div>
      </div>
    </AppShell>
  );
});

export const CertificationsSkeleton = memo(function CertificationsSkeleton() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="space-y-2">
          <Bone className="h-8 w-52" />
          <Bone className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-[var(--gh-border-default)] rounded-lg p-5 space-y-4">
              <Bone className="h-10 w-10 rounded-lg" />
              <div className="space-y-1.5">
                <Bone className="h-5 w-3/4" />
                <Bone className="h-4 w-full" />
                <Bone className="h-4 w-5/6" />
              </div>
              <Bone className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
});

export const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Bone className="h-16 w-16 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Bone className="h-6 w-40" />
            <Bone className="h-4 w-56" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-[var(--gh-border-default)] rounded-lg p-5 space-y-3">
            <Bone className="h-5 w-32" />
            <Bone className="h-9 w-full rounded-md" />
            <Bone className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </AppShell>
  );
});
