"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildFriendVisibleEntry, type FriendVisibleEntry } from "@/lib/privacy";
import { assertFriendsWith } from "@/lib/friendship";
import { awardAchievements } from "@/app/actions/gamification";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

const emailSchema = z.string().trim().toLowerCase().email();

type FriendSummary = {
  id: string;
  name: string;
  email: string;
  friendshipId: string;
  checkedInToday: boolean;
  hasReadMyEntryToday: boolean;
};
type PendingRequest = { friendshipId: string; from: { id: string; name: string; email: string } };

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function sendFriendRequest(rawEmail: string) {
  const userId = await requireUserId();
  const email = emailSchema.parse(rawEmail);

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) throw new Error("No account with that email");
  if (target.id === userId) throw new Error("You can't add yourself");

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: userId },
      ],
    },
  });
  if (existing) throw new Error("A friend request already exists with this person");

  await prisma.friendship.create({
    data: { requesterId: userId, addresseeId: target.id, status: "pending" },
  });
}

export async function respondToRequest(friendshipId: string, accept: boolean) {
  const userId = await requireUserId();

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  // Only the addressee may accept/decline - not the requester, not a stranger.
  if (!friendship || friendship.addresseeId !== userId) {
    throw new Error("Not authorized to respond to this request");
  }

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: accept ? "accepted" : "declined" },
  });

  if (accept) {
    // Both sides just gained a friend - check both for friend-count badges.
    await Promise.all([awardAchievements(userId), awardAchievements(friendship.requesterId)]);
  }
}

export async function listPendingRequests(): Promise<PendingRequest[]> {
  const userId = await requireUserId();
  const requests = await prisma.friendship.findMany({
    where: { addresseeId: userId, status: "pending" },
    include: { requester: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  const result: PendingRequest[] = [];
  for (const request of requests) {
    result.push({ friendshipId: request.id, from: request.requester });
  }
  return result;
}

export async function listFriends(): Promise<FriendSummary[]> {
  const userId = await requireUserId();
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      addressee: { select: { id: true, name: true, email: true } },
    },
  });

  const friendIds = friendships.map((f: (typeof friendships)[number]) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId
  );

  const today = todayDate();

  const [todayEntries, todayReceipts] = await Promise.all([
    friendIds.length
      ? prisma.entry.findMany({ where: { userId: { in: friendIds }, date: today }, select: { userId: true } })
      : Promise.resolve([]),
    friendIds.length
      ? prisma.readReceipt.findMany({
          where: { ownerId: userId, date: today, viewerId: { in: friendIds } },
          select: { viewerId: true },
        })
      : Promise.resolve([]),
  ]);
  const checkedInIds = new Set(todayEntries.map((e: (typeof todayEntries)[number]) => e.userId));
  const readIds = new Set(todayReceipts.map((r: (typeof todayReceipts)[number]) => r.viewerId));

  const result: FriendSummary[] = [];
  for (const friendship of friendships) {
    const friend = friendship.requesterId === userId ? friendship.addressee : friendship.requester;
    result.push({
      ...friend,
      friendshipId: friendship.id,
      checkedInToday: checkedInIds.has(friend.id),
      hasReadMyEntryToday: readIds.has(friend.id),
    });
  }
  return result;
}

export async function removeFriend(friendshipId: string) {
  const userId = await requireUserId();
  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || (friendship.requesterId !== userId && friendship.addresseeId !== userId)) {
    throw new Error("Not authorized to remove this friendship");
  }
  await prisma.friendship.delete({ where: { id: friendshipId } });
}

export async function getFriendProfile(
  friendUserId: string
): Promise<{ id: string; name: string; email: string } | null> {
  const userId = await requireUserId();
  await assertFriendsWith(userId, friendUserId);
  return prisma.user.findUnique({
    where: { id: friendUserId },
    select: { id: true, name: true, email: true },
  });
}

// Self-reported: records that the current user viewed friendUserId's entry
// for that day. Only called when there's actually something to view - see
// the friend check-in page.
export async function recordView(friendUserId: string, date: string) {
  const userId = await requireUserId();
  if (userId === friendUserId) return;
  await assertFriendsWith(userId, friendUserId);

  await prisma.readReceipt.upsert({
    where: { viewerId_ownerId_date: { viewerId: userId, ownerId: friendUserId, date } },
    create: { viewerId: userId, ownerId: friendUserId, date },
    update: { viewedAt: new Date() },
  });
}

// The only function allowed to hand a friend's entry data to the client.
// It verifies the friendship server-side, then returns *only* the output
// of buildFriendVisibleEntry - the raw Entry row never leaves this function.
export async function getFriendEntry(
  friendUserId: string,
  date: string
): Promise<FriendVisibleEntry | null> {
  const userId = await requireUserId();
  await assertFriendsWith(userId, friendUserId);

  const entry = await prisma.entry.findUnique({
    where: { userId_date: { userId: friendUserId, date } },
  });
  if (!entry) return null;

  return buildFriendVisibleEntry(entry);
}
