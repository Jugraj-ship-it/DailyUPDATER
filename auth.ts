import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { checkRateLimit } from "@/lib/rateLimit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        // 5 attempts per email per minute - stops brute-forcing one account's
        // password without needing an external service.
        if (!checkRateLimit(`login:${email}`, 5, 60_000)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        // Always compare against a hash, even on a missing user, so a
        // "no such account" response doesn't return measurably faster than
        // a "wrong password" response (timing-based user enumeration).
        const hash = user?.passwordHash ?? "$2a$12$invalidsaltinvalidsaltinvalidsalt.invalidhashvalue";
        const valid = await bcrypt.compare(password, hash);
        if (!user || !valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
