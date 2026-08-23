import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyEntry, listMyDates } from "@/app/actions/entries";
import { getMyStats } from "@/app/actions/gamification";
import EntryForm from "@/components/EntryForm";
import TopBar from "@/components/TopBar";
import StatsStrip from "@/components/StatsStrip";
import { defaultEntryValues, type EntryFormValues, type PriorityItem } from "@/lib/defaultEntry";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toFormValues(entry: Awaited<ReturnType<typeof getMyEntry>>): EntryFormValues {
  if (!entry) return defaultEntryValues();
  return {
    priorities: entry.priorities as PriorityItem[],
    completed: entry.completed as string[],
    pending: entry.pending as string[],
    nextSteps: entry.nextSteps as string[],
    reflection: entry.reflection,
    wentWell: entry.wentWell,
    challenges: entry.challenges,
    gratitude: entry.gratitude as string[],
    lifeForcePhysical: entry.lifeForcePhysical,
    lifeForceHuman: entry.lifeForceHuman,
    lifeForceSelf: entry.lifeForceSelf,
    improve: entry.improve,
    shareReflection: entry.shareReflection,
    shareGratitude: entry.shareGratitude,
    shareLifeForce: entry.shareLifeForce,
    shareImprove: entry.shareImprove,
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { date: requestedDate } = await searchParams;
  const date = isValidDate(requestedDate) ? requestedDate : todayDate();

  const [existing, historyDates, stats] = await Promise.all([getMyEntry(date), listMyDates(), getMyStats()]);

  return (
    <div className="min-h-screen">
      <TopBar date={date} email={session.user.email ?? ""} />
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <StatsStrip stats={stats} />
        <EntryForm key={date} date={date} initial={toFormValues(existing)} historyDates={historyDates} />
      </main>
    </div>
  );
}
