import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Flame,
  Zap,
  Trophy,
  Target,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Code2,
  Mic,
  BookOpen,
  BarChart2,
  Share2,
  Settings,
} from "lucide-react";

const topicStats = [
  { label: "System Design", mastery: 68, questions: 97, color: "from-violet-500 to-purple-600" },
  { label: "Data Structures", mastery: 45, questions: 94, color: "from-blue-500 to-cyan-500" },
  { label: "React", mastery: 80, questions: 78, color: "from-cyan-500 to-blue-500" },
  { label: "Algorithms", mastery: 32, questions: 61, color: "from-orange-500 to-red-500" },
  { label: "Node.js", mastery: 55, questions: 42, color: "from-green-500 to-emerald-600" },
  { label: "TypeScript", mastery: 72, questions: 47, color: "from-blue-600 to-indigo-600" },
];

const badges = [
  { label: "7-Day Streak", icon: Flame, color: "text-orange-400 bg-orange-500/15 border-orange-500/25" },
  { label: "System Design Pro", icon: Trophy, color: "text-violet-400 bg-violet-500/15 border-violet-500/25" },
  { label: "Voice Master", icon: Mic, color: "text-blue-400 bg-blue-500/15 border-blue-500/25" },
  { label: "Quick Learner", icon: Zap, color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/25" },
  { label: "Top 10%", icon: Star, color: "text-green-400 bg-green-500/15 border-green-500/25" },
  { label: "Challenge Ace", icon: Code2, color: "text-pink-400 bg-pink-500/15 border-pink-500/25" },
];

const activityHeatmap = Array.from({ length: 63 }, (_, i) => {
  const rand = Math.random();
  if (rand < 0.35) return 0;
  if (rand < 0.55) return 1;
  if (rand < 0.75) return 2;
  if (rand < 0.90) return 3;
  return 4;
});

const intensityClass = ["bg-white/5", "bg-violet-900/60", "bg-violet-700/70", "bg-violet-500/80", "bg-violet-400"];

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0d0f14] text-white font-sans overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0f14]/90 backdrop-blur-md border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <span className="font-bold text-base">Profile</span>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="text-white/60">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white/60">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-5 pt-5 max-w-2xl mx-auto">
        {/* Profile card */}
        <div className="bg-[#161820] border border-white/5 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 border-2 border-violet-500/40">
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white text-xl font-bold">SK</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Satish Kumar</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-violet-500/20 border-violet-500/30 text-violet-300 text-xs">Level 8</Badge>
                <span className="text-xs text-white/40">Senior Dev • Joined Mar 2025</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="text-xs text-white/30">4,820 XP</div>
                <div className="text-white/15 mx-1">•</div>
                <div className="text-xs text-white/30">Rank #42 globally</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>Level 8</span>
              <span>4,820 / 6,000 XP → Level 9</span>
            </div>
            <Progress value={80} className="h-2 bg-white/10" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { icon: Flame, value: "12", label: "Streak", color: "text-orange-400 bg-orange-500/15" },
            { icon: BookOpen, value: "419", label: "Questions", color: "text-blue-400 bg-blue-500/15" },
            { icon: Target, value: "71%", label: "Accuracy", color: "text-green-400 bg-green-500/15" },
            { icon: Award, value: "6", label: "Badges", color: "text-violet-400 bg-violet-500/15" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#161820] border border-white/5 rounded-xl p-3 text-center">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color.split(" ")[0]}`} />
              </div>
              <div className="text-lg font-bold leading-none">{stat.value}</div>
              <div className="text-[10px] text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Activity heatmap */}
        <div className="bg-[#161820] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/40" />
              <span className="text-sm font-semibold">Activity</span>
            </div>
            <span className="text-xs text-white/30">Last 9 weeks</span>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(9, 1fr)" }}>
            {activityHeatmap.map((level, i) => (
              <div
                key={i}
                className={`aspect-square rounded-sm ${intensityClass[level]}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <span className="text-[10px] text-white/30">Less</span>
            {intensityClass.map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-white/30">More</span>
          </div>
        </div>

        {/* Topic breakdown */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-white/40" />
              <span className="text-sm font-semibold">Topic Mastery</span>
            </div>
            <Button variant="ghost" className="text-xs text-violet-400 h-auto p-0">
              All topics <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
          <div className="space-y-2.5">
            {topicStats.map((topic) => (
              <div key={topic.label} className="bg-[#161820] border border-white/5 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{topic.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">{topic.questions} answered</span>
                    <span className="text-sm font-semibold text-white">{topic.mastery}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${topic.color} rounded-full`}
                    style={{ width: `${topic.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-white/40" />
              <span className="text-sm font-semibold">Achievements</span>
            </div>
            <span className="text-xs text-white/30">6 earned</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className={`${badge.color} border rounded-xl p-3.5 text-center flex flex-col items-center gap-2`}
              >
                <badge.icon className={`w-6 h-6 ${badge.color.split(" ")[0]}`} />
                <span className="text-xs text-white/70 font-medium leading-tight">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard teaser */}
        <div className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="text-sm font-semibold">You're in the top 10%</div>
              <div className="text-xs text-white/40 mt-0.5">Keep up the streak to reach top 5%</div>
            </div>
          </div>
          <Button variant="ghost" className="text-xs text-violet-300 h-auto p-0">
            Leaderboard <ChevronRight className="w-3 h-3 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
