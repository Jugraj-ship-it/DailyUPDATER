"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { awardAchievements } from "@/app/actions/gamification";

const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  priorities: z
    .array(z.object({ done: z.boolean(), text: z.string().max(500) }))
    .length(3),
  completed: z.array(z.string().max(500)).max(50),
  pending: z.array(z.string().max(500)).max(50),
  nextSteps: z.array(z.string().max(500)).max(50),
  reflection: z.string().max(5000),
  wentWell: z.string().max(5000),
  challenges: z.string().max(5000),
  gratitude: z.array(z.string().max(500)).max(50),
  lifeForcePhysical: z.string().max(2000),
  lifeForceHuman: z.string().max(2000),
  lifeForceSelf: z.string().max(2000),
  improve: z.string().max(2000),
  shareReflection: z.boolean(),
  shareGratitude: z.boolean(),
  shareLifeForce: z.boolean(),
  shareImprove: z.boolean(),
});

export type EntryInput = z.infer<typeof entrySchema>;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function saveEntry(input: EntryInput) {
  const userId = await requireUserId();
  const data = entrySchema.parse(input);

  const entry = await prisma.entry.upsert({
    where: { userId_date: { userId, date: data.date } },
    create: { ...data, userId },
    update: { ...data },
  });

  await awardAchievements(userId);

  return entry;
}

export async function getMyEntry(date: string) {
  const userId = await requireUserId();
  return prisma.entry.findUnique({ where: { userId_date: { userId, date } } });
}

export async function listMyDates(): Promise<string[]> {
  const userId = await requireUserId();
  const entries = await prisma.entry.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
    take: 30,
  });
  return entries.map((entry: (typeof entries)[number]) => entry.date);
}
