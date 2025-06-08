import NextAuth, { Session } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from '../../../prisma/generated/prisma-client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Resend } from "resend";

const prisma = new PrismaClient().$extends(withAccelerate());
const resend = new Resend(process.env.RESEND_API_KEY);

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    };
  }
}

export default NextAuth({
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);
        const emailContent = `
          <p>Hallo,</p>
          <p>Bitte klicken Sie auf den folgenden Link, um sich anzumelden:</p>
          <p><a href="${url}">Anmeldelink</a></p>
          <p>Dieser Link ist nur für ${host} gültig.</p>
        `;

        try {
          await resend.emails.send({
            from: provider.from,
            to: identifier,
            subject: `Anmeldung bei ${host}`,
            html: emailContent,
          });
        } catch (error) {
          console.error("Error sending email with Resend:", error);
          throw new Error("Fehler beim Senden der E-Mail.");
        }
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Ensure this is set to "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback invoked. Token before:", token, "User:", user); // Debugging
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      console.log("JWT callback invoked. Token after:", token); // Debugging
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback invoked. Token:", token); // Debugging
      session.user = {
        ...session.user,
        id: token?.sub,
        email: token?.email,
      };
      return session;
    },
  },
});


