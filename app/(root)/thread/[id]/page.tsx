import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface PageParams {
  id: string;
}

const ThreadPage = async ({ params }: { params: PageParams }) => {
  if (!params.id) return null;
  // TODO: Investigate why threads/styles.css.map is getting called everytime this page is visited.
  if (params.id === "styles.css.map") return null;
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);

  if (!thread) {
    return (
      <section>
        <div className="mt-4 text-red-500 text-base-semibold">
          Thread not found
        </div>
      </section>
    );
  }
  return (
    <section className="relative">
      <div>
        <ThreadCard
          id={thread._id}
          currentUserId={user?.id || ""}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          comments={thread.children}
          createdAt={thread.createdAt}
        />
      </div>
      <div className="mt-7">
        <Comment
          threadId={thread.id}
          currentUserImage={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        {thread.children.map((childItem: any) => (
          <ThreadCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user?.id || ""}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            comments={childItem.children}
            createdAt={childItem.createdAt}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default ThreadPage;
