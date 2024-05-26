import ProfileHeader from "@/components/shared/ProfileHeader";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import { fetchUserPosts } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

interface ProfileParams {
  id: string;
}

const Page = async ({ params }: { params: ProfileParams }) => {
  const user = await currentUser();
  if (!user) return null;

  // Fetch the user profile through the id from params.
  const userInfoWithThreads = await fetchUserPosts(params.id);

  if (!userInfoWithThreads?.onboarded) redirect("/onboarded");

  const userId = userInfoWithThreads?._id?.toString();

  return (
    <section>
      <ProfileHeader
        accountId={userInfoWithThreads.id}
        authUserId={user.id}
        name={userInfoWithThreads.name}
        username={userInfoWithThreads.username}
        imgUrl={userInfoWithThreads.image}
        bio={userInfoWithThreads.bio}
      />
      <div className="mt-9">
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <p className="max-sm:hidden">{tab.label}</p>
                {tab.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {userInfoWithThreads?.threads?.length ?? 0}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              <ThreadsTab
                currentUserId={user.id}
                accountId={userInfoWithThreads.id}
                accountType="User"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default Page;
