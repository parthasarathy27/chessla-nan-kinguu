import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Demo users — no database needed, works instantly on Vercel
const DEMO_USERS = [
  {
    id: "1",
    name: "Grand Master",
    email: "admin@chessgame.com",
    password: "chess123",
    username: "grandmaster",
    avatar: "GM",
    rating: 2800,
    gamesPlayed: 142,
    wins: 98,
    losses: 32,
    draws: 12,
  },
  {
    id: "2",
    name: "Chess Player",
    email: "player@chessgame.com",
    password: "play123",
    username: "chessplayer",
    avatar: "CP",
    rating: 1450,
    gamesPlayed: 55,
    wins: 28,
    losses: 20,
    draws: 7,
  },
  {
    id: "3",
    name: "Knight Rider",
    email: "knight@chessgame.com",
    password: "knight123",
    username: "knightrider",
    avatar: "KR",
    rating: 1900,
    gamesPlayed: 89,
    wins: 55,
    losses: 25,
    draws: 9,
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = DEMO_USERS.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );

        if (!user) return null;

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
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});

export { DEMO_USERS };
