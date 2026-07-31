import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_ALLOWED_EMAIL || "joisrosafer@gmail.com";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 Hours
  },
  callbacks: {
    async signIn({ user }) {
      // Strict Email Guard: Block authentication immediately if email does not match allowed admin
      if (!user.email || user.email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
        console.warn(`[AUTH GUARD REJECTED] Unauthorized sign-in attempt by: ${user.email}`);
        return false; // Triggers AccessDenied error
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = "ADMIN";
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Server-side helper to verify if the current request is from an authenticated Admin session.
 */
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.email?.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    return null;
  }
  return session;
}
