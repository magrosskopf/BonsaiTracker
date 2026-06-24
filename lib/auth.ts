import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Resend } from "resend";
import { prisma } from "./prisma";
import { logError, logInfo, logWarn } from "./observability";
import {
  evaluateSignupEligibility,
  isExistingUser,
  isSlotReservedForEmail,
  normalizeEmail,
  releaseExpiredSignupSlots,
  releaseSignupSlot,
  reserveSignupSlot,
} from "./signup-gating";

const resend = new Resend(process.env.RESEND_API_KEY);

function isEmailLoginEnabled(): boolean {
  return process.env.AUTH_EMAIL_LOGIN_ENABLED !== "false";
}

function getGoogleCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return null;
  }
  return { clientId, clientSecret };
}

async function authorizeFirstTimeSignin(candidateEmail: string, source: "email" | "google"): Promise<boolean> {
  const normalizedEmail = normalizeEmail(candidateEmail);

  try {
    await releaseExpiredSignupSlots();

    if (await isExistingUser(normalizedEmail)) {
      return true;
    }

    const eligibility = await evaluateSignupEligibility(normalizedEmail);
    if (!eligibility.allowed) {
      logInfo("auth.signup_denied", { provider: source, reason: eligibility.reason });
      return false;
    }

    const alreadyReserved = await isSlotReservedForEmail(normalizedEmail);
    if (alreadyReserved) {
      return true;
    }

    const reserved = await reserveSignupSlot(normalizedEmail);
    if (!reserved.reserved) {
      logInfo("auth.signup_denied", { provider: source, reason: reserved.reason });
      return false;
    }

    return true;
  } catch (error) {
    logError("auth.signin_guard_failed", error, { provider: source });
    return false;
  }
}

function buildAuthProviders(): NextAuthOptions["providers"] {
  const providers: NextAuthOptions["providers"] = [];
  const googleCredentials = getGoogleCredentials();

  if (googleCredentials) {
    providers.push(
      GoogleProvider({
        clientId: googleCredentials.clientId,
        clientSecret: googleCredentials.clientSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  } else {
    logWarn("auth.google_provider_disabled", { reason: "missing_credentials" });
  }

  if (isEmailLoginEnabled()) {
    providers.push(
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
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: buildAuthProviders(),
  pages: {
    signIn: "/",
    verifyRequest: "/?status=link-sent",
  },
  callbacks: {
    async signIn({ user, account, email }) {
      const emailPayload = email as { email?: string; verificationRequest?: boolean } | undefined;
      const candidateEmail = user?.email ?? emailPayload?.email;
      if (!candidateEmail) {
        return false;
      }

      const normalizedEmail = normalizeEmail(candidateEmail);

      if (account?.provider === "email" && !email?.verificationRequest) {
        try {
          await releaseSignupSlot(normalizedEmail);
        } catch (error) {
          logError("auth.signin_slot_release_failed", error);
        }
        return true;
      }

      if (account?.provider === "email" && email?.verificationRequest) {
        return authorizeFirstTimeSignin(normalizedEmail, "email");
      }

      if (account?.provider === "google") {
        return authorizeFirstTimeSignin(normalizedEmail, "google");
      }

      logWarn("auth.unsupported_provider", { provider: account?.provider });
      return false;
    },
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
  events: {
    async createUser({ user }) {
      if (!user.email) {
        return;
      }

      try {
        await releaseSignupSlot(user.email);
      } catch (error) {
        logError("auth.signup_slot_release_after_create_failed", error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getServerAuthSession(req: NextApiRequest, res: NextApiResponse) {
  return getServerSession(req, res, authOptions);
}
