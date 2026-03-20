import NextAuth from "next-auth";
import authConfig from "./auth.config";
import db from "@/lib/prisma";

type CanonicalIdentityRow = {
  user_id: string;
  user_type: string | null;
  first_name: string | null;
  last_name: string | null;
  access_token: string | null;
};

let identityTableEnsured = false;

async function ensureCanonicalIdentityTable() {
  if (identityTableEnsured) return;

  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CanonicalIdentity" (
      "email" TEXT PRIMARY KEY,
      "user_id" TEXT NOT NULL,
      "user_type" TEXT,
      "first_name" TEXT,
      "last_name" TEXT,
      "access_token" TEXT,
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  identityTableEnsured = true;
}

async function upsertCanonicalIdentity(input: {
  email?: string | null;
  userId?: string | null;
  userType?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  accessToken?: string | null;
}) {
  if (!input.email || !input.userId) return;

  await ensureCanonicalIdentityTable();

  await db.$executeRaw`
    INSERT INTO "CanonicalIdentity"
      ("email", "user_id", "user_type", "first_name", "last_name", "access_token", "updated_at")
    VALUES
      (${input.email}, ${input.userId}, ${input.userType ?? "USER"}, ${input.firstName ?? "User"}, ${input.lastName ?? ""}, ${input.accessToken ?? ""}, NOW())
    ON CONFLICT ("email")
    DO UPDATE SET
      "user_id" = EXCLUDED."user_id",
      "user_type" = EXCLUDED."user_type",
      "first_name" = EXCLUDED."first_name",
      "last_name" = EXCLUDED."last_name",
      "access_token" = EXCLUDED."access_token",
      "updated_at" = NOW()
  `;
}

async function getCanonicalIdentityByEmail(email?: string | null) {
  if (!email) return null;

  await ensureCanonicalIdentityTable();

  const rows = await db.$queryRaw<CanonicalIdentityRow[]>`
    SELECT "user_id", "user_type", "first_name", "last_name", "access_token"
    FROM "CanonicalIdentity"
    WHERE "email" = ${email}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
  handlers: { GET, POST },
} = NextAuth({
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const emailVerified = (
        profile as { email_verified?: boolean } | undefined
      )?.email_verified;

      if (emailVerified === false) {
        return false;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id || token.id;
        token.email = user.email || token.email;
        token.firstName = user.firstName || token.firstName || "User";
        token.lastName = user.lastName || token.lastName || "";
        token.userType = user.userType || token.userType || "USER";
        token.accessToken = user.accessToken || "";

        if (account?.provider === "credentials") {
          try {
            await upsertCanonicalIdentity({
              email: user.email,
              userId: user.id,
              userType: user.userType,
              firstName: user.firstName,
              lastName: user.lastName,
              accessToken: user.accessToken,
            });
          } catch (error) {
            console.error("Failed to persist canonical identity:", error);
          }
        }

        if (account?.provider === "google") {
          try {
            const canonicalIdentity = await getCanonicalIdentityByEmail(
              user.email,
            );

            if (canonicalIdentity) {
              token.id = canonicalIdentity.user_id;
              token.userType = canonicalIdentity.user_type || "USER";
              token.firstName = canonicalIdentity.first_name || token.firstName;
              token.lastName = canonicalIdentity.last_name || token.lastName;
              token.accessToken =
                canonicalIdentity.access_token || token.accessToken || "";
            }
          } catch (error) {
            console.error("Failed to restore canonical identity:", error);
          }
        }
      }
      return token;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = (token.id as string) || token.sub;
        session.user.email = (token.email as string) || "";
        session.user.firstName = (token.firstName as string) || "User";
        session.user.lastName = (token.lastName as string) || "";
        session.user.userType = (token.userType as string) || "USER";
        session.user.accessToken = (token.accessToken as string) || "";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  ...authConfig,
});
