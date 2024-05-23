"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { connectToDB } from "./mongoose";
import User from "../models/user.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    const createdThread = await Thread.create({
      text,
      author,
      communityId: null,
    });

    // Update user model.
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (err: any) {
    console.log(`Failed to create the thread: ${err.message}`);
  }
}

export async function fetchPosts(pageNum = 1, pageSize = 20) {
  connectToDB();

  const skipAmount = (pageNum - 1) * pageSize;

  try {
    // Fetch the posts that have no parents (top-level threads...).
    Thread.find;
    const postsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: "User" })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: "User",
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });
    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (err: any) {
    console.log(`Failed to fetch posts: ${err.message}`);
  }
}

export async function fetchThreadById(id: string) {
  connectToDB();

  try {
    // TODO: Populate communities.
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: "User",
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: "User",
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: "User",
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err: any) {
    console.log(`Failed to fetch thread by id: ${err.message}`);
  }
}

export async function addCommentToThread(
  parentThreadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the parent thread by Id.
    const parentThread = await Thread.findById(parentThreadId);

    if (!parentThread) {
      throw new Error("Thread not found");
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: parentThreadId,
    });

    // Save the new thread.
    const savedCommentThread = await commentThread.save();

    // Update the parent thread to include the new comment.
    parentThread.children.push(savedCommentThread._id);

    await parentThread.save();

    revalidatePath(path);
  } catch (err: any) {}
}
