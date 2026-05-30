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

// Default demo users
const INITIAL_USERS: User[] = [
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

// Cache the in-memory array on globalThis to prevent Next.js from resetting it on hot-reloading
const globalUsers = globalThis as unknown as { users?: User[] };
if (!globalUsers.users) {
  globalUsers.users = INITIAL_USERS;
}

export function getUsers(): User[] {
  return globalUsers.users!;
}

export function addUser(user: Omit<User, "id" | "rating" | "gamesPlayed" | "wins" | "losses" | "draws">): User {
  const list = getUsers();
  const newUser: User = {
    ...user,
    id: String(list.length + 1),
    rating: 1200,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  };
  list.push(newUser);
  return newUser;
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}
