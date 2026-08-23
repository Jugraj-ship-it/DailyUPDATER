"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assertFriendsWith } from "@/lib/friendship";
import {
  achievementInfo,
  computeConsistency,
  computeStreak,
  FRIEND_MILESTONES,
  STREAK_MILESTONES,
} from "@/lib/gamification";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export type Stats = {
  streak: number;
  consistency: number;
  achievements: { type: string; label: string; description: string; unlockedAt: string }[];
};

async function computeStatsFor(targetUserId: string): Promise<Stats> {
  const [entries, achievements] = await Promise.all([
    prisma.entry.findMany({ where: { userId: targetUserId }, select: { date: true } }),
    prisma.achievement.findMany({ where: { userId: targetUserId }, orderBy: { unlockedAt: "desc" } }),
  ]);
  const dates = entries.map((entry: (typeof entries)[number]) => entry.date);
  const today = todayDate();

  return {
    streak: computeStreak(dates, today),
    consistency: computeConsistency(dates, today),
    achievements: achievements.map((a: (typeof achievements)[number]) => ({
      type: a.type,
      unlockedAt: a.unlockedAt.toISOString(),
      ...achievementInfo(a.type),
    })),
  };
}

export async function getMyStats(): Promise<Stats> {
  const userId = await requireUserId();
  return computeStatsFor(userId);
}

export async function getFriendStats(friendUserId: string): Promise<Stats> {
  const userId = await requireUserId();
  await assertFriendsWith(userId, friendUserId);
  return computeStatsFor(friendUserId);
}

// Idempotent - safe to call after any action that might newly cross a
// threshold. Uses the Achievement table's @@unique([userId, type]) with
// skipDuplicates so already-unlocked badges are never re-awarded or lost.
export async function awardAchievements(userId: string): Promise<void> {
  const entries = await prisma.entry.findMany({
    where: { userId },
    select: {
      date: true,
      shareReflection: true,
      shareGratitude: true,
      shareLifeForce: true,
      shareImprove: true,
    },
  });

  const dates = entries.map((entry: (typeof entries)[number]) => entry.date);
  const streak = computeStreak(dates, todayDate());

  const toAward: string[] = [];

  for (const milestone of STREAK_MILESTONES) {
    if (streak >= milestone) toAward.push(`streak_${milestone}`);
  }

  const hasSharedAnything = entries.some(
    (entry: (typeof entries)[number]) =>
      entry.shareReflection || entry.shareGratitude || entry.shareLifeForce || entry.shareImprove
  );
  if (hasSharedAnything) toAward.push("first_share");

  const friendCount = await prisma.friendship.count({
    where: { status: "accepted", OR: [{ requesterId: userId }, { addresseeId: userId }] },
  });
  for (const milestone of FRIEND_MILESTONES) {
    if (friendCount >= milestone) toAward.push(`friend_${milestone}`);
  }

  if (toAward.length === 0) return;

  await prisma.achievement.createMany({
    data: toAward.map((type) => ({ userId, type })),
    skipDuplicates: true,
  });
}
