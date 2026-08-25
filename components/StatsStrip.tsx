import { Flame, TrendingUp, Award } from "lucide-react";
import type { Stats } from "@/app/actions/gamification";

export default function StatsStrip({ stats }: { stats: Stats }) {
  return (
    <div className="mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-panel p-4 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
          <div className="flex items-center gap-2 text-muted">
            <Flame size={16} className={stats.streak > 0 ? "text-[#a35d10]" : "text-muted"} />
            <span className="text-xs font-medium uppercase tracking-wide">Streak</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {stats.streak}
            <span className="ml-1 text-sm font-normal text-muted">day{stats.streak === 1 ? "" : "s"}</span>
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-4 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
          <div className="flex items-center gap-2 text-muted">
            <TrendingUp size={16} className="text-accent-dark" />
            <span className="text-xs font-medium uppercase tracking-wide">Last 30 days</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {stats.consistency}
            <span className="ml-1 text-sm font-normal text-muted">%</span>
          </p>
        </div>
      </div>

      {stats.achievements.length > 0 && (
        <div className="rounded-xl border border-line bg-panel p-4 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
          <div className="mb-2 flex items-center gap-2 text-muted">
            <Award size={16} className="text-accent-dark" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Badges ({stats.achievements.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.achievements.map((a) => (
              <span
                key={a.type}
                title={a.description}
                className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-dark"
              >
                {a.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
