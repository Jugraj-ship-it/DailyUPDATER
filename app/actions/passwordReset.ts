"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const GENERIC_MESSAGE = "If an account exists for that email, a reset link has been sent.";

export type RequestResetState = { message?: string };

export async function requestPasswordReset(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();

  // Always the same response regardless of what happens below, so this
  // can't be used to check which emails have accounts (same principle as
  // the login/signup generic-error handling).
  if (!z.string().email().safeParse(email).success) {
    return { message: GENERIC_MESSAGE };
  }

  if (!checkRateLimit(`reset:${email}`, 3, 15 * 60_000)) {
    return { message: GENERIC_MESSAGE };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: GENERIC_MESSAGE };

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const resetUrl = `${protocol}://${host}/reset-password/${token}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (error) {
    // Don't leak send failures to the client - just log for our own debugging.
    console.error("Failed to send password reset email:", error);
  }

  return { message: GENERIC_MESSAGE };
}

export type ResetPasswordState = { error?: string; success?: boolean };

const newPasswordSchema = z.string().min(8, "Password must be at least 8 characters").max(200);

export async function resetPassword(
  token: string,
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = newPasswordSchema.safeParse(formData.get("password"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  if (!checkRateLimit(`reset-confirm:${token}`, 10, 15 * 60_000)) {
    return { error: "Too many attempts. Request a new reset link." };
  }

  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { success: true };
}
