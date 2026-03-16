import NextAuth from "next-auth";
import authConfig from "./auth.config";

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.userType = user.userType;
        token.accessToken = user.accessToken || "";
      }
      return token;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.userType = token.userType as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  ...authConfig,
});
