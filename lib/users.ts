import { cookies } from "next/headers";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  username: string;
  avatar: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

// Default static demo users
export const INITIAL_USERS: User[] = [
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

// Helper to fetch merged users list from static list and cookie store
export async function getUsers(): Promise<User[]> {
  const list = [...INITIAL_USERS];
  try {
    const cookieStore = await cookies();
    const customUsersCookie = cookieStore.get("chess_registered_users")?.value;
    if (customUsersCookie) {
      const parsed = JSON.parse(decodeURIComponent(customUsersCookie));
      if (Array.isArray(parsed)) {
        list.push(...parsed);
      }
    }
  } catch (e) {
    // cookies() might throw if called outside request context (e.g. build time)
  }
  return list;
}

export async function addUser(user: Omit<User, "id" | "rating" | "gamesPlayed" | "wins" | "losses" | "draws">): Promise<User> {
  const list = await getUsers();
  // Filter out static initial users to get only registered users
  const customUsers = list.filter(u => !INITIAL_USERS.some(initial => initial.email.toLowerCase() === u.email.toLowerCase()));
  
  const newUser: User = {
    ...user,
    id: String(list.length + 1),
    rating: 1200,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  };
  
  customUsers.push(newUser);
  
  try {
    const cookieStore = await cookies();
    cookieStore.set("chess_registered_users", encodeURIComponent(JSON.stringify(customUsers)), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
  } catch (e) {
    console.error("Failed to set cookies:", e);
  }
  
  return newUser;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const list = await getUsers();
  return list.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
