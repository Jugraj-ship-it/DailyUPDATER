import { redirect, notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { auth } from "@/auth";
import { getFriendEntry, getFriendProfile } from "@/app/actions/friends";
import type { FriendVisibleEntry } from "@/lib/privacy";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function Section({
  title,
  shared,
  children,
}: {
  title: string;
  shared: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line p-5 last:border-b-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">{title}</h2>
        {!shared && (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Lock size={13} />
            Private
          </span>
        )}
      </div>
      {shared ? children : <p className="text-sm italic text-muted">Not shared for this day</p>}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  const clean = items.map((i) => i.trim()).filter(Boolean);
  if (!clean.length) return <p className="text-sm italic text-muted">Nothing added</p>;
  return (
    <ul className="list-inside list-disc space-y-1 text-sm">
      {clean.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default async function FriendCheckinPage({
  params,
}: {
  params: Promise<{ friendId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { friendId } = await params;
  const date = todayDate();

  let profile;
  let entry: FriendVisibleEntry | null;
  try {
    [profile, entry] = await Promise.all([getFriendProfile(friendId), getFriendEntry(friendId, date)]);
  } catch {
    notFound();
  }
  if (!profile) notFound();

  const priorities = entry?.priorities ?? [];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-medium">{profile.name}&rsquo;s Check-In</h1>
            <p className="text-sm text-muted">{date}</p>
          </div>
          <a href="/friends" className="text-sm text-accent-dark underline">
            Back to Friends
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        {!entry ? (
          <div className="rounded-xl border border-line bg-panel p-5 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
            <p className="text-sm text-muted">No entry for this day yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
            <Section title="1. Top 3 Priorities" shared>
              {priorities.length === 0 ? (
                <p className="text-sm italic text-muted">Nothing added</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {priorities.map((p, index) => (
                    <li key={index}>
                      {p.done ? "✓" : "○"} {p.text || <span className="italic text-muted">(blank)</span>}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="2. Tasks Completed" shared>
              <List items={entry.completed ?? []} />
            </Section>

            <Section title="3. Pending Tasks & Reasons" shared>
              <List items={entry.pending ?? []} />
            </Section>

            <Section title="5. Next Steps" shared>
              <List items={entry.nextSteps ?? []} />
            </Section>

            <Section title="4. Daily Reflection / How I Am Feeling" shared={"reflection" in entry}>
              <div className="space-y-2 text-sm">
                {entry.reflection && <p>{entry.reflection}</p>}
                {entry.wentWell && <p>{entry.wentWell}</p>}
                {entry.challenges && <p>{entry.challenges}</p>}
              </div>
            </Section>

            <Section title="6. Gratitude" shared={"gratitude" in entry}>
              <List items={entry.gratitude ?? []} />
            </Section>

            <Section title="7. Life Force" shared={"lifeForcePhysical" in entry}>
              <div className="space-y-2 text-sm">
                {entry.lifeForcePhysical && <p>{entry.lifeForcePhysical}</p>}
                {entry.lifeForceHuman && <p>{entry.lifeForceHuman}</p>}
                {entry.lifeForceSelf && <p>{entry.lifeForceSelf}</p>}
              </div>
            </Section>

            <Section title="8. How Can I Improve" shared={"improve" in entry}>
              <p className="text-sm">{entry.improve}</p>
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}
