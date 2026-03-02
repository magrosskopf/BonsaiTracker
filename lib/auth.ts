import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM ?? "Bonsai Tracker <noreply@example.com>",
      async sendVerificationRequest({ identifier, url, provider }) {
        const host = new URL(url).host;
        const subject = `Dein Login-Link für ${host}`;
        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
            <h1 style="font-size: 20px; margin-bottom: 16px;">Bonsai Tracker</h1>
            <p>Hallo,</p>
            <p>klicke auf den folgenden Link, um dich anzumelden:</p>
            <p><a href="${url}">Zum Login</a></p>
            <p>Falls du den Login nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>
          </div>
        `;
        const text = `Bonsai Tracker\n\nÖffne diesen Link zum Login:\n${url}\n\nFalls du den Login nicht angefordert hast, kannst du diese E-Mail ignorieren.`;

        await resend.emails.send({
          from: provider.from,
          to: identifier,
          subject,
          html,
          text,
        });
      },
    }),
  ],
  pages: {
    signIn: "/",
    verifyRequest: "/?status=link-sent",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = String(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getServerAuthSession(req: NextApiRequest, res: NextApiResponse) {
  return getServerSession(req, res, authOptions);
}
