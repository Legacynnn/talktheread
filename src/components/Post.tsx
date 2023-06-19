import { Post, User, Vote } from "@prisma/client";
import React from "react";

interface Props {
  roomName: string;
  post: Post & {
    author: User;
    votes: Vote[];
  };
}

export default function Post({ roomName, post }: Props) {
  return (
    <div className="rounded-md bg-white shadow">
      <div className="flex justify-between px-6 py-4">
        <div className="w-0 flex-1">
          <div className="mt-1 max-h-40 text-xs text-gray-500">
            {roomName ? (
              <>
                <a
                  className="text-sm text-zinc-900 underline underline-offset-2"
                  href={`/c/${roomName}`}
                >
                  c/{roomName}
                </a>
                <span className="px-1">-</span>
              </>
            ) : null}
            <span>Posted By {post.author.name}</span>
            {formatTimeToNow()}
          </div>
        </div>
      </div>
    </div>
  );
}
