import type { NextAuthConfig } from "next-auth";

// Edge-compatible NextAuth config: no Prisma, no bcrypt. This is what
// middleware/proxy uses to check a session token. The Credentials provider
// (which needs the database) lives only in auth.ts, which runs in the
// Node runtime, not the Edge runtime.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
