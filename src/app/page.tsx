import { HomeIcon } from "lucide-react";
import Link from "next/link";
import CustomFeed from "../components/CustomFeed";
import GenericFeed from "../components/GenericFeed";
import { buttonVariants } from "../components/ui/button";
import { getAuthSession } from "../lib/auth";
import CommuntiesToFollow from "../components/CommuntiesToFollow";

export default async function Home() {
  const session = await getAuthSession();

  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
        <div className="flex flex-col md:col-span-2">
          {/* @ts-expect-error server component */}
          {session ? <CustomFeed /> : <GenericFeed />}
        </div>
        <div className="flex flex-col">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="bg-emerald-100 px-6 py-4">
              <p className="flex items-center gap-1.5 py-3 font-semibold">
                <HomeIcon className="h-4 w-4" />
                Home
              </p>
            </div>

            <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <p className="text-zinc-500">
                  Your personal homepage. Come here to check in with your
                  favorite communities
                </p>
              </div>

              <Link
                className={buttonVariants({
                  className: "mb-6 mt-4 w-full",
                })}
                href="/c/create"
              >
                Create Community
              </Link>
            </div>
          </div>

          <CommuntiesToFollow />
        </div>
      </div>
    </>
  );
}
