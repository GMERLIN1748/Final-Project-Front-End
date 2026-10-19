import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import prisma from "@/app/lib/prisma";

const providers: any[] = [
  // Login ด้วย Email / Password
  Credentials({
    credentials: {
      email: {},
      password: {},
    },

    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const email = (credentials.email as string).trim().toLowerCase();
      const password = credentials.password as string;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return null;
      }

      const passwordValid = await bcrypt.compare(password, user.passwordHash);

      if (!passwordValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
  }),
];

// เปิดปุ่ม GitHub เฉพาะเมื่อตั้งค่าครบ
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // ผู้ใช้ GitHub ไม่มี role จากฐานข้อมูล ให้เป็น USER
        token.role = user.role ?? "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "USER";
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },
});