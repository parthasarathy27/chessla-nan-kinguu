import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PlayClient from "./PlayClient";

export const metadata = {
  title: "Play Chess — ChessMaster Pro",
  description: "Play chess against AI or a friend on ChessMaster Pro",
};

export default async function PlayPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;
  return (
    <PlayClient
      userName={user.name || "Player"}
      userRating={user.rating || 1200}
      userAvatar={user.avatar || user.name?.[0] || "P"}
    />
  );
}
