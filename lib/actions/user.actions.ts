"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "./mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name: name,
        bio: bio,
        image: image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "profile/edit") {
      revalidatePath(path);
    }
  } catch (err: any) {
    console.log(`Failed to create/update the user: ${err.message}`);
  }
}

export async function fetchUser(userId: string): Promise<User> {
  try {
    connectToDB();

    return await User.findOne({ userId: userId });
    // .populate({
    //   path: "communities",
    //   model: Community,
    // });
  } catch (err) {
    throw new Error(`Failt to fetch user: ${err.message}`);
  }
}
