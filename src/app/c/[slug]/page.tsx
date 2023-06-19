import React from "react";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { notFound } from "next/navigation";
import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";

interface Props {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: Props) {
  const { slug } = params;

  const session = await getAuthSession();

  const room = await db.room.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          room: true,
        },
        orderBy: {
          created_at: "desc",
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!room) return notFound();

  return (
    <>
      <h1 className="h-14 text-3xl font-bold md:text-4xl">c/{room.name}</h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPost={room.posts} roomName={room.name} />
    </>
  );
}
