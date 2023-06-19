import React from "react";
import { db } from "../lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../config";
import PostFeed from "./PostFeed";
import { getAuthSession } from "../lib/auth";
export default async function CustomFeed() {
  const session = await getAuthSession();

  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      room: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      room: {
        name: {
          in: followedCommunities.map(({ room }) => room.id),
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    include: {
      votes: true,
      comments: true,
      author: true,
      room: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  return <PostFeed initialPost={posts} />;
}
