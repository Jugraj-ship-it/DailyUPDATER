"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { sendFriendRequest } from "@/app/actions/friends";

export default function AddFriendForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      try {
        await sendFriendRequest(email);
        setMessage("Request sent");
        setEmail("");
        router.refresh();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Could not send request");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="email"
        required
        placeholder="Friend's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-[200px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
      >
        <UserPlus size={15} />
        Send request
      </button>
      {message && <span className="text-sm text-muted">{message}</span>}
    </form>
  );
}
