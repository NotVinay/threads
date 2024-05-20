import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarded");

  const userId = userInfo?._id?.toString();

  return (
    <>
      <h1 className="head-text">Create Threads</h1>

      <PostThread userId={userId} />
    </>
  );
}

export default Page;
