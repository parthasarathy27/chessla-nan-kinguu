import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "Profile — ChessMaster Pro",
  description: "View and manage your chess profile",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  const user = session.user as any;
  return <ProfileClient user={user} />;
}
