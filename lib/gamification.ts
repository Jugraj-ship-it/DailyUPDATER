// Streak and consistency are computed live from existing entry dates - no
// separate table to keep in sync. Achievements (badges) are the one thing
// that needs real persistence, since they should stay earned even after a
// streak breaks (see prisma schema's Achievement model).

function shiftDate(date: string, days: number): string {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

// Counts consecutive days ending today (or, if today isn't checked in yet,
// ending yesterday - so the streak doesn't look "broken" mid-day).
export function computeStreak(entryDates: string[], today: string): number {
  const dates = new Set(entryDates);
  let streak = 0;
  let cursor = dates.has(today) ? today : shiftDate(today, -1);
  while (dates.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return streak;
}

// Percentage of the last `windowDays` (including today) that have an entry.
export function computeConsistency(entryDates: string[], today: string, windowDays = 30): number {
  const dates = new Set(entryDates);
  let count = 0;
  for (let i = 0; i < windowDays; i += 1) {
    if (dates.has(shiftDate(today, -i))) count += 1;
  }
  return Math.round((count / windowDays) * 100);
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 100] as const;
export const FRIEND_MILESTONES = [1, 3, 5, 10] as const;

export function achievementInfo(type: string): { label: string; description: string } {
  const streakMatch = type.match(/^streak_(\d+)$/);
  if (streakMatch) {
    const n = streakMatch[1];
    return { label: `${n}-Day Streak`, description: `Checked in ${n} days in a row` };
  }
  const friendMatch = type.match(/^friend_(\d+)$/);
  if (friendMatch) {
    const n = Number(friendMatch[1]);
    return {
      label: n === 1 ? "First Friend" : `${n} Friends`,
      description: n === 1 ? "Added your first accountability friend" : `Added ${n} accountability friends`,
    };
  }
  if (type === "first_share") {
    return { label: "Opened Up", description: "Shared a private section with a friend for the first time" };
  }
  return { label: type, description: "" };
}
