import { NextResponse } from "next/server";
import { addUser, findUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, password)" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email address already registered" },
        { status: 400 }
      );
    }

    // Generate initials for avatar and username
    const username = name.toLowerCase().replace(/\s+/g, "");
    const avatar = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";

    const newUser = addUser({
      name,
      email,
      password,
      username,
      avatar,
    });

    return NextResponse.json(
      { message: "Registration successful", user: { email: newUser.email, name: newUser.name } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration endpoint error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
