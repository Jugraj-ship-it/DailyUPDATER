import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listFriends, listPendingRequests } from "@/app/actions/friends";
import AddFriendForm from "@/components/AddFriendForm";
import RespondToRequest from "@/components/RespondToRequest";
import FriendCard from "@/components/FriendCard";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [friends, pending] = await Promise.all([listFriends(), listPendingRequests()]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-medium">Friends</h1>
          <a href="/" className="text-sm text-accent-dark underline">
            Back to Entry
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-6">
        <section className="rounded-xl border border-line bg-panel p-5 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
          <h2 className="mb-3 font-medium">Add a friend</h2>
          <AddFriendForm />
        </section>

        {pending.length > 0 && (
          <section className="rounded-xl border border-line bg-panel p-5 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
            <h2 className="mb-3 font-medium">Pending requests</h2>
            <div className="space-y-2">
              {pending.map((req) => (
                <div
                  key={req.friendshipId}
                  className="flex items-center justify-between rounded-lg border border-line p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{req.from.name}</p>
                    <p className="text-xs text-muted">{req.from.email}</p>
                  </div>
                  <RespondToRequest friendshipId={req.friendshipId} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-line bg-panel p-5 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
          <h2 className="mb-3 font-medium">Your accountability circle</h2>
          {friends.length === 0 ? (
            <p className="text-sm text-muted">No friends yet — add one above.</p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <FriendCard key={friend.id} {...friend} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
