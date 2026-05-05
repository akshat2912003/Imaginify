"use server";

import { clerkClient } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) { handleError(error); }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // Fallback: If user is not in MongoDB (common on localhost), sync from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);

      if (!clerkUser) throw new Error("User not found in Clerk");

      const email = clerkUser.emailAddresses[0].emailAddress;

      // Check if user exists by email to avoid E11000 duplicate key error
      user = await User.findOne({ email });

      if (user) {
        // Update existing user with current clerkId
        user.clerkId = userId;
        await user.save();
      } else {
        // Create new user if neither clerkId nor email exists
        user = await User.create({
          clerkId: clerkUser.id,
          email: email,
          username: clerkUser.username ?? email.split("@")[0],
          firstName: clerkUser.firstName ?? "",
          lastName: clerkUser.lastName ?? "",
          photo: clerkUser.imageUrl,
        });
      }
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });
    if (!updatedUser) throw new Error("User update failed");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) { handleError(error); }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();
    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) throw new Error("User not found");
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) { handleError(error); }
}

export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();
    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );
    if (!updatedUserCredits) throw new Error("User credits update failed");
    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) { handleError(error); }
}
