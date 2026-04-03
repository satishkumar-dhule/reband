import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ThumbsUp,
  ThumbsDown,
  SkipForward,
  Bookmark,
  Share2,
  ChevronLeft,
  Timer,
  Lightbulb,
  ChevronDown,
  Flame,
  Zap,
  RotateCcw,
} from "lucide-react";

export function QuestionCard() {
  const [revealed, setRevealed] = useState(false);
  const [rating, setRating] = useState<"easy" | "hard" | null>(null);

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <Button size="icon" variant="ghost" className="text-white/60">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-violet-500/20 border-violet-500/30 text-violet-300 text-xs">System Design</Badge>
          <Badge className="bg-orange-500/20 border-orange-500/30 text-orange-300 text-xs">Medium</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-white/60">
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white/60">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex justify-between text-xs text-white/40 mb-1.5">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>8 streak</span>
          </div>
          <span>Question 14 / 30</span>
          <div className="flex items-center gap-1">
            <Timer className="w-3 h-3 text-blue-400" />
            <span>1:32</span>
          </div>
        </div>
        <Progress value={46} className="h-1.5 bg-white/10" />
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-4 gap-3">
        {/* Question card */}
        <div className="bg-[#161820] border border-white/8 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="text-xs text-white/40 font-medium uppercase tracking-wide">Question</span>
          </div>
          <h2 className="text-lg font-semibold text-white leading-snug">
            How would you design a distributed rate limiter that scales to handle 10 million requests per second?
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Redis", "Token Bucket", "Sliding Window", "Distributed Systems"].map((tag) => (
              <Badge key={tag} className="bg-white/5 border-white/8 text-white/40 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Answer section */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="bg-[#161820] border border-dashed border-white/15 rounded-2xl p-5 flex flex-col items-center gap-2 hover-elevate cursor-pointer w-full"
          >
            <ChevronDown className="w-5 h-5 text-white/30" />
            <span className="text-sm text-white/40">Tap to reveal answer</span>
            <span className="text-xs text-white/25">Think about it first...</span>
          </button>
        ) : (
          <div className="bg-[#161820] border border-white/8 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-green-400" />
              </div>
              <span className="text-xs text-white/40 font-medium uppercase tracking-wide">Answer</span>
            </div>
            <div className="space-y-2.5 text-sm text-white/80 leading-relaxed">
              <p><span className="text-white font-medium">1. Token Bucket Algorithm:</span> Each user gets a bucket that refills at a fixed rate. Exceeding the limit rejects requests.</p>
              <p><span className="text-white font-medium">2. Redis-based storage:</span> Use Redis sorted sets (ZRANGEBYSCORE) for sliding window or atomic increments for fixed windows. Redis Cluster for horizontal scaling.</p>
              <p><span className="text-white font-medium">3. Architecture:</span> Place rate limiter behind a load balancer. Use consistent hashing to route requests to the same Redis node per user.</p>
              <p><span className="text-white font-medium">4. Failure modes:</span> If Redis is down, use local in-memory fallback. Consider circuit breakers.</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mt-2">
              <div className="text-xs text-blue-300 font-medium mb-1">Follow-up question</div>
              <div className="text-xs text-white/60">How would you handle rate limiting across multiple data centers?</div>
            </div>
          </div>
        )}

        {/* Rating buttons */}
        {revealed && (
          <div className="space-y-3">
            <div className="text-xs text-white/40 text-center">How well did you know this?</div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setRating("hard")}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                  rating === "hard"
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-white/5 border-white/8 text-white/40 hover-elevate"
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-xs font-medium">Hard</span>
                <span className="text-[10px] text-white/30">Review soon</span>
              </button>
              <button
                onClick={() => setRating(null)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border bg-white/5 border-white/8 text-white/40 hover-elevate"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs font-medium">Okay</span>
                <span className="text-[10px] text-white/30">4 days</span>
              </button>
              <button
                onClick={() => setRating("easy")}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                  rating === "easy"
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : "bg-white/5 border-white/8 text-white/40 hover-elevate"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs font-medium">Easy</span>
                <span className="text-[10px] text-white/30">11 days</span>
              </button>
            </div>
            {rating && (
              <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl">
                <SkipForward className="w-4 h-4 mr-2" />
                Next Question
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
