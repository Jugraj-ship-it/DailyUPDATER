"use client";

import { useActionState } from "react";
import { signup, type SignupState } from "@/app/actions/auth";

const initialState: SignupState = {};

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent-soft";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  if (state.success) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-8">
        <div className="rounded-xl border border-line bg-panel p-6 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
          <h1 className="mb-2 text-2xl font-medium">Account created</h1>
          <p className="text-sm text-muted">
            You can now{" "}
            <a href="/login" className="text-accent-dark underline">
              log in
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="rounded-xl border border-line bg-panel p-6 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
        <h1 className="mb-6 text-2xl font-medium">Sign up</h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input name="name" required className={input} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input name="email" type="email" required className={input} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input name="password" type="password" required minLength={8} className={input} />
            <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
          </div>
          {state.error && <p className="text-sm text-danger">{state.error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            Sign up
          </button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <a href="/login" className="text-accent-dark underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
