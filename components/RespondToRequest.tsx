"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondToRequest } from "@/app/actions/friends";

export default function RespondToRequest({ friendshipId }: { friendshipId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      await respondToRequest(friendshipId, accept);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => respond(true)}
        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
      >
        Accept
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => respond(false)}
        className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs text-ink transition-colors hover:border-line-strong disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  );
}
