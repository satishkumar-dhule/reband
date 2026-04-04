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
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Cpu,
  Zap,
  RotateCcw,
  Copy,
  Settings2,
  ChevronRight,
  AlertCircle,
  Star,
  Lock,
} from "lucide-react";

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

type Token = { type: "keyword" | "type" | "comment" | "string" | "number" | "plain" | "punct"; value: string };

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;
  while (remaining.length > 0) {
    const kwMatch = remaining.match(/^(function|const|let|for|if|return|of|new|true|false|null)\b/);
    if (kwMatch) { tokens.push({ type: "keyword", value: kwMatch[0] }); remaining = remaining.slice(kwMatch[0].length); continue; }
    const typeMatch = remaining.match(/^(number|string|boolean|Map|void|any)\b/);
    if (typeMatch) { tokens.push({ type: "type", value: typeMatch[0] }); remaining = remaining.slice(typeMatch[0].length); continue; }
    const commentMatch = remaining.match(/^(\/\/.*)/);
    if (commentMatch) { tokens.push({ type: "comment", value: commentMatch[0] }); remaining = ""; continue; }
    const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
    if (strMatch) { tokens.push({ type: "string", value: strMatch[0] }); remaining = remaining.slice(strMatch[0].length); continue; }
    const numMatch = remaining.match(/^\d+/);
    if (numMatch) { tokens.push({ type: "number", value: numMatch[0] }); remaining = remaining.slice(numMatch[0].length); continue; }
    tokens.push({ type: "plain", value: remaining[0] });
    remaining = remaining.slice(1);
  }
  return tokens;
}

const tokenColors: Record<Token["type"], string> = {
  keyword: "text-pink-400",
  type: "text-cyan-400",
  comment: "text-white/30",
  string: "text-emerald-400",
  number: "text-orange-400",
  punct: "text-white/70",
  plain: "text-white/80",
};

const testCases = [
  { id: 1, input: "nums = [2,7,11,15]\ntarget = 9", expected: "[0,1]", output: "[0,1]", passed: true, time: "1ms", mem: "42.3 MB" },
  { id: 2, input: "nums = [3,2,4]\ntarget = 6", expected: "[1,2]", output: "[1,2]", passed: true, time: "1ms", mem: "41.8 MB" },
  { id: 3, input: "nums = [3,3]\ntarget = 6", expected: "[0,1]", output: null, passed: null, time: "-", mem: "-" },
];

const companies = ["Google", "Amazon", "Apple", "Meta", "Microsoft"];
const topics = ["Array", "Hash Table"];

type LeftTab = "description" | "hints" | "submissions";
type BottomTab = "testcases" | "output";

export function CodingChallenge() {
  const [leftTab, setLeftTab] = useState<LeftTab>("description");
  const [bottomTab, setBottomTab] = useState<BottomTab>("testcases");
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [ran, setRan] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [liked, setLiked] = useState(false);

  const activeCase = testCases[activeCaseIdx];

  return (
    <div className="h-screen bg-[#0c0e13] text-white font-sans flex flex-col overflow-hidden text-[13px]">

      {/* ── Top Nav ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.07] bg-[#0c0e13] shrink-0">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="text-white/50 h-7 w-7">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white/90 text-sm">1. Two Sum</span>
            <Badge className="bg-emerald-500/15 border-emerald-500/25 text-emerald-400 text-[10px] py-0 px-1.5 h-4">Easy</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-1">
            <Clock className="w-3 h-3" />
            <span className="font-mono font-semibold">24:18</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-md px-2 py-1">
            <Zap className="w-3 h-3" />
            <span>+150 XP</span>
          </div>
          <Button size="icon" variant="ghost" className="text-white/40 h-7 w-7">
            <Settings2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Main Body ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── LEFT PANEL ────────────────────────────────────────── */}
        <div className="w-[220px] shrink-0 flex flex-col border-r border-white/[0.07] overflow-hidden">

          {/* Left tabs */}
          <div className="flex border-b border-white/[0.07] shrink-0">
            {(["description", "hints", "submissions"] as LeftTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setLeftTab(t)}
                className={`flex-1 py-2 text-[11px] font-medium capitalize transition-colors ${
                  leftTab === t
                    ? "text-white border-b-2 border-violet-500"
                    : "text-white/35 hover:text-white/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {leftTab === "description" && (
              <>
                {/* Stats row */}
                <div className="flex items-center gap-3 text-[11px] text-white/40">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-1 transition-colors ${liked ? "text-violet-400" : "hover:text-white/60"}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>12.4k</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-white/60">
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>1.2k</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-white/60 ml-auto">
                    <Star className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>

                {/* Description */}
                <div className="text-[12px] text-white/65 leading-relaxed space-y-2">
                  <p>
                    Given an array of integers{" "}
                    <code className="bg-white/10 px-1 py-0.5 rounded text-violet-300 font-mono text-[11px]">nums</code>{" "}
                    and an integer{" "}
                    <code className="bg-white/10 px-1 py-0.5 rounded text-violet-300 font-mono text-[11px]">target</code>,
                    return <em className="text-white/80">indices of the two numbers</em> such that they add up to target.
                  </p>
                  <p className="text-white/45">
                    Assume exactly one solution. You may not use the same element twice.
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wide">Examples</div>
                  {[
                    { n: 1, input: "[2,7,11,15]\ntarget = 9", output: "[0,1]", note: "nums[0] + nums[1] = 9" },
                    { n: 2, input: "[3,2,4]\ntarget = 6", output: "[1,2]" },
                  ].map((ex) => (
                    <div key={ex.n} className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-2.5 font-mono text-[11px] space-y-1">
                      <div className="text-white/30 text-[10px] mb-1">Example {ex.n}</div>
                      <div><span className="text-white/35">In: </span><span className="text-white/70">{ex.input}</span></div>
                      <div><span className="text-white/35">Out: </span><span className="text-emerald-400">{ex.output}</span></div>
                      {ex.note && <div className="text-white/30 italic text-[10px]">{ex.note}</div>}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div>
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wide mb-1.5">Constraints</div>
                  <ul className="font-mono text-[11px] text-white/40 space-y-0.5">
                    {["2 ≤ n ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "One valid answer"].map((c) => (
                      <li key={c} className="flex items-center gap-1.5">
                        <span className="text-white/20">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Topics & companies */}
                <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                  <div className="flex flex-wrap gap-1">
                    {topics.map((t) => (
                      <Badge key={t} className="bg-white/5 border-white/10 text-white/45 text-[10px] py-0">{t}</Badge>
                    ))}
                  </div>
                  <div className="text-[11px] text-white/30 flex items-center gap-1">
                    <span>Asked at</span>
                    <span className="text-violet-400 cursor-pointer hover:underline">{companies.length} companies</span>
                    <Lock className="w-3 h-3 text-white/20" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-white/35">
                    <span className="text-emerald-400 font-medium">78.4%</span> acceptance
                    <span className="text-white/20">·</span>
                    <span>14.2M runs</span>
                  </div>
                </div>
              </>
            )}

            {leftTab === "hints" && (
              <div className="space-y-3">
                <div className="text-[11px] text-white/40">Stuck? Reveal hints one at a time.</div>
                {[
                  "Think about what you need to check for each element in the array.",
                  "A hash map lets you do lookups in O(1). What would you store as keys and values?",
                  "For each element x, check if (target - x) already exists in your map before inserting x.",
                ].map((hint, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setShowHint(true)}
                      className="w-full flex items-center justify-between p-2.5 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[11px] text-white/60 font-medium">Hint {i + 1}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/25" />
                    </button>
                    {showHint && i === 0 && (
                      <div className="px-2.5 pb-2.5 text-[11px] text-white/55 leading-relaxed border-t border-white/[0.06]">
                        <div className="pt-2">{hint}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {leftTab === "submissions" && (
              <div className="space-y-2">
                {[
                  { status: "Accepted", time: "2 days ago", lang: "TypeScript", runtime: "72ms", memory: "42.3MB" },
                  { status: "Wrong Answer", time: "2 days ago", lang: "TypeScript", runtime: "-", memory: "-" },
                  { status: "Accepted", time: "1 week ago", lang: "JavaScript", runtime: "84ms", memory: "41.8MB" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-2.5 space-y-1 cursor-pointer hover-elevate">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold ${s.status === "Accepted" ? "text-emerald-400" : "text-red-400"}`}>
                        {s.status}
                      </span>
                      <span className="text-[10px] text-white/30">{s.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/35">
                      <span>{s.lang}</span>
                      {s.runtime !== "-" && <><span className="text-white/20">·</span><span>{s.runtime}</span><span className="text-white/20">·</span><span>{s.memory}</span></>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e1117] border-b border-white/[0.07] shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>solution.ts</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 bg-white/5 border border-white/8 rounded px-2 py-0.5">
                TypeScript <ChevronDown className="w-3 h-3" />
              </button>
              <Button size="icon" variant="ghost" className="text-white/35 h-6 w-6">
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="text-white/35 h-6 w-6">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 bg-[#0b0d11] overflow-auto min-h-0">
            <div className="p-3 font-mono text-[12px] leading-[1.7]">
              {code.split("\n").map((line, lineIdx) => {
                const tokens = tokenizeLine(line);
                const isCurrentLine = lineIdx === 4;
                return (
                  <div
                    key={lineIdx}
                    className={`flex group ${isCurrentLine ? "bg-violet-500/[0.08] rounded" : ""}`}
                  >
                    <span
                      className={`select-none w-7 text-right shrink-0 mr-3 pt-px ${
                        isCurrentLine ? "text-violet-400" : "text-white/[0.18]"
                      }`}
                    >
                      {lineIdx + 1}
                    </span>
                    <span className="flex-1">
                      {tokens.map((tok, ti) => (
                        <span key={ti} className={tokenColors[tok.type]}>
                          {tok.value}
                        </span>
                      ))}
                      {isCurrentLine && (
                        <span className="inline-block w-[2px] h-[14px] bg-violet-400 ml-px align-middle animate-pulse" />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom Console ────────────────────────────────── */}
          <div className="border-t border-white/[0.07] bg-[#0c0e13] shrink-0" style={{ minHeight: "180px", maxHeight: "220px" }}>

            {/* Console tabs */}
            <div className="flex items-center border-b border-white/[0.07] px-3">
              {(["testcases", "output"] as BottomTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setBottomTab(t)}
                  className={`py-2 mr-4 text-[11px] font-medium capitalize transition-colors ${
                    bottomTab === t
                      ? "text-white border-b-2 border-violet-500"
                      : "text-white/35 hover:text-white/55"
                  }`}
                >
                  {t === "testcases" ? "Test Cases" : "Output"}
                </button>
              ))}
              {ran && (
                <span className="ml-auto text-[11px] flex items-center gap-1.5 text-white/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  2 / 3 passed
                </span>
              )}
            </div>

            {bottomTab === "testcases" && (
              <div className="flex h-full" style={{ maxHeight: "170px" }}>
                {/* Case selector */}
                <div className="flex flex-col border-r border-white/[0.07] p-2 gap-1 shrink-0">
                  {testCases.map((tc, i) => (
                    <button
                      key={tc.id}
                      onClick={() => setActiveCaseIdx(i)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                        activeCaseIdx === i
                          ? "bg-white/8 text-white"
                          : "text-white/35 hover:text-white/60"
                      }`}
                    >
                      {ran && tc.passed === true && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                      {ran && tc.passed === false && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />}
                      {(!ran || tc.passed === null) && <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />}
                      Case {i + 1}
                    </button>
                  ))}
                  <button className="mt-1 px-2.5 py-1 text-[10px] text-violet-400 border border-violet-500/25 rounded-lg hover-elevate">
                    + Add
                  </button>
                </div>

                {/* Active case detail */}
                <div className="flex-1 p-3 overflow-auto font-mono text-[11px] space-y-2.5">
                  <div>
                    <div className="text-white/30 mb-1">Input</div>
                    <div className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-2 text-white/70 whitespace-pre-line">
                      {activeCase.input}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/30 mb-1">Expected</div>
                    <div className="bg-white/[0.04] border border-white/[0.07] rounded-lg p-2 text-emerald-400">
                      {activeCase.expected}
                    </div>
                  </div>
                  {ran && activeCase.output && (
                    <div>
                      <div className="text-white/30 mb-1 flex items-center gap-1.5">
                        Output
                        {activeCase.passed
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                      <div className={`bg-white/[0.04] border rounded-lg p-2 ${activeCase.passed ? "border-emerald-500/25 text-emerald-400" : "border-red-500/25 text-red-400"}`}>
                        {activeCase.output}
                      </div>
                      <div className="flex gap-3 mt-1.5 text-[10px] text-white/30">
                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3" />{activeCase.time}</span>
                        <span>{activeCase.mem}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {bottomTab === "output" && (
              <div className="p-3 font-mono text-[11px] overflow-auto" style={{ maxHeight: "170px" }}>
                {!ran ? (
                  <div className="flex items-center gap-2 text-white/25 pt-2">
                    <Terminal className="w-4 h-4" />
                    <span>Run your code to see output here.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="text-white/30">&gt; Running test cases...</div>
                    <div className="text-emerald-400">&gt; Case 1: ✓ Passed (1ms)</div>
                    <div className="text-emerald-400">&gt; Case 2: ✓ Passed (1ms)</div>
                    <div className="text-white/50">&gt; Case 3: Pending...</div>
                    <div className="flex items-center gap-2 pt-1 text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>2/3 test cases passed.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Action Bar ────────────────────────────────────── */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-white/[0.07] bg-[#0c0e13] shrink-0">
            <button className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 mr-auto">
              <BookOpen className="w-3.5 h-3.5" />
              Editorial
            </button>
            <Button
              variant="ghost"
              className="border border-white/12 text-white/60 rounded-lg text-[12px] h-8 px-3 gap-1.5"
              onClick={() => { setRan(true); setBottomTab("testcases"); }}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              Run
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-lg text-[12px] h-8 px-4 font-semibold gap-1.5 border-0"
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
