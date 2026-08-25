"use client";

import { useActionState } from "react";
import { requestPasswordReset, type RequestResetState } from "@/app/actions/passwordReset";

const initialState: RequestResetState = {};

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent-soft";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="rounded-xl border border-line bg-panel p-6 shadow-[0_18px_50px_rgba(28,38,35,0.08)]">
        <h1 className="mb-2 text-2xl font-medium">Reset your password</h1>

        {state.message ? (
          <p className="text-sm text-ink">{state.message}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted">Enter your email and we&rsquo;ll send you a reset link.</p>
            <form action={formAction} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input name="email" type="email" required className={input} />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
              >
                Send reset link
              </button>
            </form>
          </>
        )}

        <p className="mt-4 text-sm text-muted">
          <a href="/login" className="text-accent-dark underline">
            Back to log in
          </a>
        </p>
      </div>
    </main>
  );
}
