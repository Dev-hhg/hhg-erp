import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { logUser } from "@/serverComponents/dbFunctions";

async function login(credentials) {
  console.log("credentials", credentials);
  const { username, password } = credentials;
  const res = await logUser({ username: username });
  if (res.length > 0) {
    const user = res[0];
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return null;
    } else {
      console.log("User found");
    }
    return { username: user.username, role: user.role };
  } else {
    return null;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const user = await login(credentials);

        if (!user) {
          throw new Error("User not found");
        }
        // console.log("user123", user);
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("user", user);
      if (user) {
        console.log("user", user);
        token.username = user.username;
        token.role = user.role;
      }
      console.log("token", token);
      return token;
    },
    async session({ session, token }) {
      if (token?.username) {
        session.user.username = token.username;
        session.user.role = token.role;
        session.accesstoken = token.jti;
      }
      console.log("session", session);
      return session;
    },
  },
};

export const config = authOptions;

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
