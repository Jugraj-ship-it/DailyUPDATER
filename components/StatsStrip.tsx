import { Flame, TrendingUp, Award } from "lucide-react";
import type { Stats } from "@/app/actions/gamification";

export default function StatsStrip({ stats }: { stats: Stats }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-panel p-4 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
      <div className="flex items-center gap-2">
        <Flame size={18} className={stats.streak > 0 ? "text-[#a35d10]" : "text-muted"} />
        <span className="text-sm font-medium">
          {stats.streak} day{stats.streak === 1 ? "" : "s"} streak
        </span>
      </div>
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-accent-dark" />
        <span className="text-sm font-medium">{stats.consistency}% this month</span>
      </div>
      {stats.achievements.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Award size={18} className="shrink-0 text-accent-dark" />
          {stats.achievements.map((a) => (
            <span
              key={a.type}
              title={`${a.label} - ${a.description}`}
              className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-dark"
            >
              {a.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
