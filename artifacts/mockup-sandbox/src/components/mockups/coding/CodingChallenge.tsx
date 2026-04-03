import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Play,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Terminal,
  Lightbulb,
  BarChart2,
  Code2,
} from "lucide-react";

const testCases = [
  { input: "[2,7,11,15], target=9", expected: "[0,1]", result: "[0,1]", passed: true },
  { input: "[3,2,4], target=6", expected: "[1,2]", result: "[1,2]", passed: true },
  { input: "[3,3], target=6", expected: "[0,1]", result: null, passed: null },
];

const code = `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`;

export function CodingChallenge() {
  const [activeTab, setActiveTab] = useState<"problem" | "solution">("problem");
  const [ran, setRan] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" className="text-white/60">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="text-sm font-semibold">1. Two Sum</div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className="bg-green-500/15 border-green-500/30 text-green-400 text-[10px] py-0">Easy</Badge>
              <span className="text-xs text-white/30">Arrays · Hash Map</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Clock className="w-3.5 h-3.5" />
            <span>18:42</span>
          </div>
          <Button size="default" variant="ghost" className="border border-white/10 text-white/60 text-xs h-8 px-3 rounded-lg gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            TypeScript
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Top tab bar */}
      <div className="flex border-b border-white/8">
        {(["problem", "solution"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm capitalize transition-colors ${
              activeTab === tab
                ? "text-white border-b-2 border-violet-500"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Split panes */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Problem */}
          {activeTab === "problem" && (
            <div className="w-full md:w-2/5 border-r border-white/8 overflow-auto p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                <div className="text-sm text-white/70 space-y-2 leading-relaxed">
                  <p>Given an array of integers <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-violet-300">nums</code> and an integer <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-violet-300">target</code>, return <em>indices of the two numbers such that they add up to target</em>.</p>
                  <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Examples</h3>
                <div className="space-y-2">
                  {[
                    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", note: "nums[0] + nums[1] = 9" },
                    { input: "nums = [3,2,4], target = 6", output: "[1,2]", note: "" },
                  ].map((ex, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 font-mono text-xs space-y-1">
                      <div><span className="text-white/40">Input: </span><span className="text-white/80">{ex.input}</span></div>
                      <div><span className="text-white/40">Output: </span><span className="text-green-400">{ex.output}</span></div>
                      {ex.note && <div><span className="text-white/40">Note: </span><span className="text-white/50">{ex.note}</span></div>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Constraints</h3>
                <ul className="text-xs text-white/50 space-y-1 font-mono">
                  <li>• 2 ≤ nums.length ≤ 10⁴</li>
                  <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                  <li>• -10⁹ ≤ target ≤ 10⁹</li>
                  <li>• Only one valid answer exists.</li>
                </ul>
              </div>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                <div className="text-xs text-white/60">
                  <span className="text-violet-300 font-medium">Hint: </span>
                  A hash map lets you check for complements in O(1) time. What's the complement of each number with respect to target?
                </div>
              </div>

              <div className="flex gap-3 text-xs text-white/40">
                <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Accepted: 78.4%</span>
                <span>Submissions: 14.2M</span>
              </div>
            </div>
          )}

          {/* Right: Code editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-[#0b0d11] font-mono text-sm p-4 overflow-auto">
              <pre className="text-white/80 leading-relaxed">
                {code.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none text-white/20 w-8 text-right mr-4 shrink-0">{i + 1}</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/\b(function|const|let|for|if|return|of|new)\b/g, '<span class="text-pink-400">$1</span>')
                          .replace(/\b(number|string|Map|number\[\])\b/g, '<span class="text-cyan-400">$1</span>')
                          .replace(/(\/\/.*)/g, '<span class="text-white/30">$1</span>')
                          .replace(/(".*?")/g, '<span class="text-green-400">$1</span>')
                          .replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')
                      }}
                    />
                  </div>
                ))}
              </pre>
            </div>

            {/* Test cases / output */}
            <div className="border-t border-white/8 bg-[#0d0f14]">
              <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Test Cases</span>
                </div>
                {ran && <span className="text-xs text-green-400">2/3 passed</span>}
              </div>
              <div className="p-3 space-y-2 max-h-44 overflow-auto">
                {testCases.map((tc, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border text-xs ${
                    tc.passed === true
                      ? "bg-green-500/8 border-green-500/20"
                      : tc.passed === false
                      ? "bg-red-500/8 border-red-500/20"
                      : "bg-white/4 border-white/8"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {tc.passed === true && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                      {tc.passed === false && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      {tc.passed === null && <div className="w-3.5 h-3.5 rounded-full border border-white/20" />}
                      <span className="text-white/50">Case {i + 1}</span>
                    </div>
                    <div className="font-mono text-white/60">Input: {tc.input}</div>
                    <div className="font-mono text-white/60">Expected: {tc.expected}</div>
                    {tc.result && <div className={`font-mono ${tc.passed ? "text-green-400" : "text-red-400"}`}>Got: {tc.result}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Action bar */}
            <div className="flex gap-2.5 px-4 py-3 border-t border-white/8">
              <Button
                variant="outline"
                className="border-white/15 text-white/70 rounded-lg text-sm"
                onClick={() => setRan(true)}
              >
                <Play className="w-4 h-4 mr-1.5" />
                Run
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold">
                <Send className="w-4 h-4 mr-1.5" />
                Submit Solution
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
