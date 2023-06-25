"use client";

import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "../config";
import { ExtendPost } from "../types/db";
import Post from "./Post";

interface Props {
  initialPost: ExtendPost[];
  roomName?: string;
}

export default function PostFeed({ initialPost, roomName }: Props) {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!roomName ? `&roomName=${roomName}` : "");

      const { data } = await axios.get(query);
      return data as ExtendPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPost], pageParams: [1] },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) fetchNextPage();
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPost;

  // Make Admin Post Be On Top
  const userPosts = posts.filter(post => post.author.id === "cljazdy0x0000l908s3xgksx5");
  const otherPosts = posts.filter(post => post.author.id !== "cljazdy0x0000l908s3xgksx5");
  const sortedPosts = [...userPosts, ...otherPosts];

  return (
    <ul className="col-span-2 flex flex-col space-y-6">
      {sortedPosts.map((post, index) => {
        const votesAmount = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;

          return acc;
        }, 0);

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                commentAmount={post.comments.length}
                post={post}
                roomName={post.room.name}
                votesAmount={votesAmount}
                currentVote={currentVote}
              />
            </li>
          );
        } else {
          return (
            <Post
              commentAmount={post.comments.length}
              post={post}
              roomName={post.room.name}
              key={post.id}
              votesAmount={votesAmount}
              currentVote={currentVote}
            />
          );
        }
      })}
    </ul>
  );
}
