import React from "react";
import { db } from "../lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../config";
import PostFeed from "./PostFeed";

export default async function GenericFeed() {
  const posts = await db.post.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      room: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  return <PostFeed initialPost={posts} />;
}
