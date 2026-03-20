import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authApiClient } from "./lib/api-client";
import { URLS } from "./lib/const";
import { loginFormSchema } from "./lib/schemas";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    async authorize(credentials) {
      const validatedFields = loginFormSchema.safeParse(credentials);

      if (!validatedFields.success) {
        console.error("Validation failed:", validatedFields.error);
        return null;
      }

      const { email, password } = validatedFields.data;

      try {
        const res = await authApiClient.post(URLS.auth.sign_in, {
          email,
          password,
        });

        console.log("Sign-in response:", res.data);

        const responseData = res.data as Record<string, unknown>;
        const userData =
          (responseData.data as Record<string, unknown>) ||
          (responseData.user as Record<string, unknown>);
        const accessToken =
          (userData?.accessToken as string) ||
          (responseData.accessToken as string);

        if (userData && userData.id && userData.email) {
          return {
            id: userData.id as string,
            email: userData.email as string,
            firstName: userData.firstName as string,
            lastName: userData.lastName as string,
            userType: (userData.userType as string) || "USER",
            accessToken: accessToken || null,
          };
        }

        console.error("No valid user data in response:", res.data);
        return null;
      } catch (error) {
        console.error("Authorize error:", error);
        return null;
      }
    },
  }),
];

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      profile(profile) {
        const [firstNamePart, ...lastNameParts] = (profile.name || "")
          .trim()
          .split(" ");
        const firstName = firstNamePart || profile.given_name || "User";
        const lastName = lastNameParts.join(" ") || profile.family_name || "";

        return {
          id: profile.sub,
          email: profile.email,
          firstName,
          lastName,
          userType: "USER",
          accessToken: null,
          image: profile.picture,
        };
      },
    }),
  );
}

export default {
  providers,
} satisfies NextAuthConfig;
