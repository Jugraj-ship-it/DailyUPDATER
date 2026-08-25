"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent-soft";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="rounded-xl border border-line bg-panel p-6 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
        <h1 className="mb-6 text-2xl font-medium">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" required className={input} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium">Password</label>
              <a href="/forgot-password" className="text-xs text-accent-dark underline">
                Forgot password?
              </a>
            </div>
            <input name="password" type="password" required className={input} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            Log in
          </button>
        </form>
        <p className="mt-4 text-sm text-muted">
          No account?{" "}
          <a href="/signup" className="text-accent-dark underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
