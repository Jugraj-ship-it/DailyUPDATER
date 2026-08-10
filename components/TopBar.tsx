"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, Users } from "lucide-react";
import { logout } from "@/app/actions/session";

function shiftDate(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

const iconBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-ink transition-colors hover:border-line-strong hover:bg-panel-soft";

export default function TopBar({ date, email }: { date: string; email: string }) {
  const router = useRouter();

  function goTo(nextDate: string) {
    router.push(nextDate === todayDate() ? "/" : `/?date=${nextDate}`);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-4 px-4 py-4">
        <div className="min-w-[160px] flex-1">
          <h1 className="text-xl font-medium">Daily Update</h1>
          <p className="mt-1 text-sm text-muted">Signed in as {email}</p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/friends" className={iconBtn} aria-label="Friends">
            <Users size={17} />
          </a>
          <form action={logout}>
            <button type="submit" className="h-9 rounded-lg border border-line bg-panel px-3 text-sm text-ink transition-colors hover:border-line-strong">
              Sign out
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goTo(shiftDate(date, -1))} className={iconBtn} aria-label="Previous day">
            <ChevronLeft size={17} />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => goTo(e.target.value || todayDate())}
            className="h-9 rounded-lg border border-line bg-panel px-2 text-sm text-ink"
          />
          <button type="button" onClick={() => goTo(shiftDate(date, 1))} className={iconBtn} aria-label="Next day">
            <ChevronRight size={17} />
          </button>
          <button
            type="button"
            onClick={() => goTo(todayDate())}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#bde5dd] bg-accent-soft px-3 text-sm text-accent-dark"
          >
            <CalendarDays size={16} />
            Today
          </button>
        </div>
      </div>
    </header>
  );
}
