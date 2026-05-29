import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Dashboard — ChessMaster Pro",
  description: "View your chess stats, recent games, and leaderboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const user = session.user as any;
  return <DashboardClient user={user} />;
}
