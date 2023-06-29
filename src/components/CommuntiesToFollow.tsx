import { BadgePlus } from "lucide-react";
import Link from "next/link";
import { db } from "../lib/db";

export default async function CommuntiesToFollow() {
  const communities = await db.room.findMany({
    where: {
      posts: {
        some: {
          comments: {
            some: {},
          },
        },
      },
    },
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    take: 6
  });

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
      <div className="bg-emerald-100 px-6 py-4">
        <p className="flex items-center gap-1.5 py-3 font-semibold">
          <BadgePlus className="h-4 w-4" />
          recommended communities
        </p>
      </div>

      <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <p className="text-zinc-500">
            See the most talked about communities right now. You will find a lot
            of cool stuff.
          </p>
        </div>

        <div className="">
          <span className="gap-4 grid grid-cols-2">
            {communities.map((community) => {
              return <Link className="bg-gray-100 rounded-sm p-4" key={community.id} href={`c/${community.name}`}>{community.name}</Link>;
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
