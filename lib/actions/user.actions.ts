"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "./mongoose";
import Thread from "../models/thread.model";

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

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // TODO: Populate communitiny information when communities are implemented.
    // Find all posts associated with the user with the given userId.
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "id name image",
        },
      },
    });

    return threads;
  } catch (err: any) {
    throw new Error(`Failed to fetch user posts: ${err.message}`);
  }
}
