import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Flame,
  Zap,
  Trophy,
  BookOpen,
  Code2,
  Mic,
  GraduationCap,
  ChevronRight,
  Bell,
  Search,
  Star,
  TrendingUp,
  Clock,
  BarChart2,
} from "lucide-react";

const topics = [
  { label: "System Design", icon: "🏗️", color: "from-violet-600 to-purple-700", questions: 142, mastery: 68 },
  { label: "Data Structures", icon: "🌳", color: "from-blue-600 to-cyan-600", questions: 210, mastery: 45 },
  { label: "Algorithms", icon: "⚡", color: "from-orange-500 to-red-600", questions: 189, mastery: 32 },
  { label: "React", icon: "⚛️", color: "from-cyan-500 to-blue-600", questions: 98, mastery: 80 },
  { label: "Node.js", icon: "🟢", color: "from-green-600 to-emerald-700", questions: 76, mastery: 55 },
  { label: "SQL", icon: "🗄️", color: "from-amber-500 to-orange-600", questions: 88, mastery: 40 },
  { label: "TypeScript", icon: "🔷", color: "from-blue-700 to-indigo-700", questions: 65, mastery: 72 },
  { label: "AWS", icon: "☁️", color: "from-orange-400 to-yellow-500", questions: 120, mastery: 28 },
];

const recentActivity = [
  { topic: "System Design", question: "Design a URL shortener like bit.ly", time: "2h ago", status: "review" },
  { topic: "Algorithms", question: "Find the longest palindromic substring", time: "1d ago", status: "mastered" },
  { topic: "React", question: "Explain useEffect cleanup functions", time: "2d ago", status: "learning" },
];

const modes = [
  { icon: BookOpen, label: "Quick Study", desc: "Swipe through Q&A cards", color: "bg-violet-500/15 border-violet-500/30 text-violet-400", to: "/questions" },
  { icon: Mic, label: "Voice Practice", desc: "Speak your answers aloud", color: "bg-blue-500/15 border-blue-500/30 text-blue-400", to: "/voice" },
  { icon: Code2, label: "Coding Challenges", desc: "Write & run real code", color: "bg-green-500/15 border-green-500/30 text-green-400", to: "/coding" },
  { icon: GraduationCap, label: "Certifications", desc: "MCQ exam practice", color: "bg-orange-500/15 border-orange-500/30 text-orange-400", to: "/certs" },
];

export function HomeScreen() {
  return (
    <div className="min-h-screen bg-[#0d0f14] text-white font-sans overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0f14]/90 backdrop-blur-md border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-sm font-bold">C</div>
          <span className="font-bold text-base tracking-tight">Code Reels</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="text-white/60">
            <Search className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white/60 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </Button>
          <Avatar className="w-8 h-8 border border-white/10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white text-xs font-semibold">SK</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-6 max-w-2xl mx-auto pt-5">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#161820] border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-lg font-bold leading-none">12</div>
              <div className="text-xs text-white/40 mt-0.5">Day streak</div>
            </div>
          </div>
          <div className="bg-[#161820] border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-lg font-bold leading-none">4,820</div>
              <div className="text-xs text-white/40 mt-0.5">Total XP</div>
            </div>
          </div>
          <div className="bg-[#161820] border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="text-lg font-bold leading-none">#42</div>
              <div className="text-xs text-white/40 mt-0.5">Rank</div>
            </div>
          </div>
        </div>

        {/* Daily goal */}
        <div className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold text-sm">Daily Goal</div>
              <div className="text-xs text-white/50 mt-0.5">12 of 20 questions answered</div>
            </div>
            <div className="text-right">
              <Badge className="bg-violet-500/25 text-violet-300 border-violet-500/30 text-xs">Level 8</Badge>
            </div>
          </div>
          <Progress value={60} className="h-2 bg-white/10" />
          <div className="flex justify-between mt-1.5 text-xs text-white/40">
            <span>60% complete</span>
            <span>+180 XP remaining</span>
          </div>
        </div>

        {/* Practice modes */}
        <div>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Practice Modes</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {modes.map((mode) => (
              <div
                key={mode.label}
                className={`${mode.color} border rounded-xl p-4 cursor-pointer hover-elevate`}
              >
                <mode.icon className="w-6 h-6 mb-2" />
                <div className="font-semibold text-sm text-white">{mode.label}</div>
                <div className="text-xs text-white/50 mt-0.5">{mode.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic channels */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Topics</h2>
            <Button variant="ghost" className="text-xs text-violet-400 h-auto p-0">
              View all <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {topics.map((topic) => (
              <div
                key={topic.label}
                className="bg-[#161820] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover-elevate"
              >
                <div className={`h-1.5 bg-gradient-to-r ${topic.color}`} />
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base">{topic.icon}</span>
                    <span className="text-xs text-white/30">{topic.questions}Q</span>
                  </div>
                  <div className="font-medium text-sm text-white mb-1.5">{topic.label}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Mastery</span>
                      <span>{topic.mastery}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${topic.color} rounded-full`}
                        style={{ width: `${topic.mastery}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Recent Activity</h2>
            <TrendingUp className="w-4 h-4 text-white/30" />
          </div>
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div key={i} className="bg-[#161820] border border-white/5 rounded-xl p-3.5 flex items-center gap-3 hover-elevate cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-white/5 border-white/10 text-white/50 text-xs">{item.topic}</Badge>
                    <div className="flex items-center gap-1 text-xs text-white/30">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </div>
                  </div>
                  <div className="text-sm text-white/80 truncate">{item.question}</div>
                </div>
                <Badge
                  className={
                    item.status === "mastered"
                      ? "bg-green-500/15 border-green-500/30 text-green-400 text-xs"
                      : item.status === "review"
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-400 text-xs"
                      : "bg-blue-500/15 border-blue-500/30 text-blue-400 text-xs"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
