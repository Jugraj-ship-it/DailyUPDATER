import { prisma } from "@/lib/prisma";

// Shared by app/actions/friends.ts and app/actions/gamification.ts - kept
// out of either "use server" action file to avoid a circular import between
// them.
export async function assertFriendsWith(userId: string, otherUserId: string) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: userId, addresseeId: otherUserId },
        { requesterId: otherUserId, addresseeId: userId },
      ],
    },
  });
  if (!friendship) throw new Error("You are not friends with this user");
}
