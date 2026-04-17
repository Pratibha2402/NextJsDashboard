import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateWithAD } from "./ldap";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/Login",
  },
  providers: [
    Credentials({
      name: "Active Directory",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;

        if (typeof username !== "string" || typeof password !== "string") {
          console.error("[AUTH] Missing username or password in credentials provider");
          return null;
        }

        try {
          console.info("[AUTH] Starting AD login", {
            username: username.trim(),
          });

          const user = await authenticateWithAD(username, password);

          return {
            id: user.id,
            name: user.name,
            email: `${user.username}@${process.env.AD_DOMAIN?.toLowerCase() ?? "ioc"}`,
          };
        } catch (error) {
          console.error("[AUTH] AD authentication failed", {
            username: username.trim(),
            error,
          });
          return null;
        }
      },
    }),
  ],
});
