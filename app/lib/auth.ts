import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateWithAD } from "@/app/lib/ldap";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Active Directory",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await authenticateWithAD(
            credentials.username as string,
            credentials.password as string,
          );

          return {
            id: user.username,
            name: user.name,
            email: `${user.username}@ioc.local`,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/Login",
  },
});
