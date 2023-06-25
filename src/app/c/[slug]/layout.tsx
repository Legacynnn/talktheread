import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import "server-only";
import ToFeedButton from "@/components/ToFeedButton";

export default async function Layout({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getAuthSession();

  const room = await db.room.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          room: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      });

  const isSubscribed = !!subscription;

  if (!room) return notFound();

  const memberCount = await db.subscription.count({
    where: {
      room: {
        name: slug,
      },
    },
  });

  return (
    <div className="mx-w-7xl mx-auto h-full pt-12 sm:container">
      <div>
        <ToFeedButton />
        <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-3">
          <div className="col-span-2 flex flex-col space-y-6">{children}</div>

          <div className="order-first hidden h-fit overflow-hidden rounded-lg border border-gray-200 md:order-last md:block">
            <div className="px-6 py-4">
              <p className="py-3 font-semibold">About c/{room.name}</p>
            </div>

            <dl className="divide-y divide-gray-100 bg-white px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Created</dt>
                <dt className="text-gray-700">
                  <time>{format(room.created_at, "MMMM d, yyyy")}</time>
                </dt>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Members</dt>
                <dt className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dt>
              </div>

              {room.creatorId === session?.user.id ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <p className="text-gray-500">You created this community</p>
                </div>
              ) : null}

              {room.creatorId !== session?.user.id ? (
                <SubscribeLeaveToggle
                  roomId={room.id}
                  roomName={room.name}
                  isSubscribe={isSubscribed}
                />
              ) : null}

              <Link
                className={buttonVariants({
                  variant: "outline",
                  className: "mb-6 w-full",
                })}
                href={`c/${slug}/submit`}
              >
                Create post
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
