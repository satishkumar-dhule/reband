import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  ChevronLeft,
  SkipForward,
  Volume2,
  Clock,
  Star,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const waveform = [20, 35, 55, 40, 70, 85, 60, 45, 75, 90, 65, 50, 80, 95, 70, 55, 40, 65, 50, 30, 45, 70, 85, 60, 75, 40, 55, 80, 95, 70, 60, 45];

const feedbackPoints = [
  { type: "good", text: "Mentioned horizontal scaling approach" },
  { type: "good", text: "Correctly identified Redis as the storage layer" },
  { type: "improve", text: "Could have discussed failure scenarios" },
  { type: "improve", text: "Missing mention of CAP theorem trade-offs" },
];

export function VoiceSession() {
  const [isRecording, setIsRecording] = useState(false);
  const [phase, setPhase] = useState<"prompt" | "recording" | "feedback">("prompt");

  const handleMicClick = () => {
    if (phase === "prompt") {
      setIsRecording(true);
      setPhase("recording");
    } else if (phase === "recording") {
      setIsRecording(false);
      setPhase("feedback");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <Button size="icon" variant="ghost" className="text-white/60">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-300 text-xs">Voice Practice</Badge>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Clock className="w-3 h-3" />
            <span>2:15</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-white/60">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white/60">
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 pt-5 pb-6 gap-5">
        {/* Question */}
        <div className="bg-[#161820] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-white/40 font-medium uppercase tracking-wide">Behavioral — Leadership</span>
          </div>
          <h2 className="text-base font-semibold text-white leading-snug">
            Tell me about a time you had to make a difficult technical decision with incomplete information. How did you handle it?
          </h2>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/30">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Tip: Use the STAR method — Situation, Task, Action, Result</span>
          </div>
        </div>

        {phase === "feedback" ? (
          <>
            {/* Score */}
            <div className="bg-gradient-to-r from-violet-600/15 to-blue-600/15 border border-violet-500/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-white/70">Your Score</div>
                  <div className="text-3xl font-bold mt-0.5">7.2 <span className="text-base text-white/40 font-normal">/ 10</span></div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <Star className="w-5 h-5 text-white/20" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-xl py-2.5">
                  <div className="text-lg font-bold text-green-400">8/10</div>
                  <div className="text-xs text-white/40 mt-0.5">Clarity</div>
                </div>
                <div className="bg-white/5 rounded-xl py-2.5">
                  <div className="text-lg font-bold text-blue-400">7/10</div>
                  <div className="text-xs text-white/40 mt-0.5">Structure</div>
                </div>
                <div className="bg-white/5 rounded-xl py-2.5">
                  <div className="text-lg font-bold text-violet-400">6/10</div>
                  <div className="text-xs text-white/40 mt-0.5">Depth</div>
                </div>
              </div>
            </div>

            {/* AI Feedback */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide">AI Feedback</h3>
              {feedbackPoints.map((point, i) => (
                <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                  point.type === "good"
                    ? "bg-green-500/8 border-green-500/20"
                    : "bg-amber-500/8 border-amber-500/20"
                }`}>
                  {point.type === "good"
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  }
                  <span className="text-sm text-white/75">{point.text}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 mt-auto">
              <Button variant="outline" className="flex-1 border-white/10 text-white/60 rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-xl">
                <SkipForward className="w-4 h-4 mr-2" />
                Next Question
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Waveform / mic area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              {/* Waveform visualization */}
              <div className={`flex items-center justify-center gap-[3px] h-20 ${phase !== "recording" ? "opacity-30" : ""}`}>
                {waveform.map((height, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-blue-600 to-violet-500 transition-all"
                    style={{
                      height: `${phase === "recording" ? height : 20}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              {/* Mic button */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleMicClick}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isRecording
                      ? "bg-red-500 shadow-red-500/30 scale-110"
                      : "bg-gradient-to-br from-violet-600 to-blue-600 shadow-violet-600/30"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                <div className="text-center">
                  {phase === "prompt" && (
                    <>
                      <div className="text-sm font-medium text-white">Tap to start recording</div>
                      <div className="text-xs text-white/40 mt-1">Speak clearly and at a measured pace</div>
                    </>
                  )}
                  {phase === "recording" && (
                    <>
                      <div className="text-sm font-medium text-red-400">Recording...</div>
                      <div className="text-xs text-white/40 mt-1">Tap again when finished</div>
                    </>
                  )}
                </div>
              </div>

              {/* Key points reminder */}
              <div className="w-full bg-[#161820] border border-white/5 rounded-xl p-4">
                <div className="text-xs text-white/40 font-medium mb-2">Key points to cover</div>
                <div className="space-y-1.5">
                  {["Specific situation and context", "Your decision-making process", "Outcome and what you learned"].map((point, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
