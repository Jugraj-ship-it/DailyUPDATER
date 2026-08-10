"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { removeFriend } from "@/app/actions/friends";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function FriendCard({
  id,
  name,
  email,
  friendshipId,
  checkedInToday,
}: {
  id: string;
  name: string;
  email: string;
  friendshipId: string;
  checkedInToday: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      await removeFriend(friendshipId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-panel p-2">
      <a
        href={`/friends/${id}`}
        className="flex flex-1 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-panel-soft"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-dark">
          {initials(name)}
        </span>
        <span>
          <span className="block text-sm font-medium">{name}</span>
          <span className="block text-xs text-muted">{email}</span>
        </span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
            checkedInToday ? "bg-accent-soft text-accent-dark" : "bg-panel-soft text-muted"
          }`}
        >
          {checkedInToday ? "Checked in today" : "Not checked in yet"}
        </span>
      </a>
      <button
        type="button"
        disabled={isPending}
        onClick={handleRemove}
        aria-label={`Remove ${name}`}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel-soft hover:text-danger disabled:opacity-50"
      >
        <X size={16} />
      </button>
    </div>
  );
}
