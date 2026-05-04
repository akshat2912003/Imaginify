import { auth } from "@clerk/nextjs";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Not logged in. Go to /sign-in first!" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if already exists
    const existingUser = await User.findOne({ clerkId: userId });
    if (existingUser) {
      return NextResponse.json({
        message: "User already exists!",
        user: existingUser,
      });
    }

    // Fetch from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    const userData = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      username:
        clerkUser.username ??
        clerkUser.emailAddresses[0].emailAddress.split("@")[0],
      firstName: clerkUser.firstName ?? "",
      lastName: clerkUser.lastName ?? "",
      photo: clerkUser.imageUrl,
      creditBalance: 20,
    };

    const newUser = await User.create(userData);

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { userId: newUser._id },
    });

    return NextResponse.json({
      message: "User created successfully!",
      user: newUser,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}