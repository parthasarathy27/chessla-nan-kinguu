import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail, INITIAL_USERS } from "./users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await findUserByEmail(credentials.email as string);

        if (!user || user.password !== credentials.password) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          rating: user.rating,
          gamesPlayed: user.gamesPlayed,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.avatar = (user as any).avatar;
        token.rating = (user as any).rating;
        token.gamesPlayed = (user as any).gamesPlayed;
        token.wins = (user as any).wins;
        token.losses = (user as any).losses;
        token.draws = (user as any).draws;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).avatar = token.avatar;
        (session.user as any).rating = token.rating;
        (session.user as any).gamesPlayed = token.gamesPlayed;
        (session.user as any).wins = token.wins;
        (session.user as any).losses = token.losses;
        (session.user as any).draws = token.draws;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "chess-game-super-secret-key-gaming-company-2024",
});

export const DEMO_USERS = INITIAL_USERS;
