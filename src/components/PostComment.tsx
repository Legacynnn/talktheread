"use client";

import { Comment, CommentVote, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatTimeToNow } from "../lib/utils";
import { CommentRequest } from "../lib/validators/comment";
import CommentVotes from "./CommentVotes";
import UserAvatar from "./UserAvatar";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface Props {
  comment: ExtendedComment;
  votesAmount: number;
  currentVote: CommentVote | undefined;
  postId: string;
}

export default function PostComment({
  comment,
  currentVote,
  postId,
  votesAmount,
}: Props) {
  const [input, setInput] = useState<string>("");
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ replyToId, postId, text }: CommentRequest) => {
      const payload: CommentRequest = { replyToId, postId, text };

      const { data } = await axios.patch(`/api/room/post/comment`, payload);
    },
    onError: (error) => {
      return toast({
        title: 'Erghh, something goes wrong',
        description: 'Comment wasnt created on db, please try again.',
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      router.refresh()
      setIsReplying(false);
    },
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="truncante max-h-40 text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.created_at))}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-zinc-900">{comment.text}</p>

      <div className="flex flex-wrap items-center gap-2">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmount}
          initialVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
            setIsReplying(true);
          }}
          variant="ghost"
          size="xs"
        >
          <MessageSquare className="mr-1.5 h-4 w-4" />
          Reply
        </Button>

        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="What are your comment?"
              />

              <div className="mt-2 flex justify-end">
                <Button variant="subtle" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button
                  isLoading={isLoading}
                  disabled={input.length === 0}
                  onClick={() => {
                    if (!input) return;
                    postComment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
