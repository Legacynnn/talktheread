"use client";

import { VoteType } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { Button } from "../ui/button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "../../lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "../../hooks/use-toast";

interface Props {
  postId: string;
  initialVotesAmount: number;
  initialVote?: VoteType | null;
}

export default function PostVoteClient({
  initialVotesAmount,
  postId,
  initialVote,
}: Props) {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState<number>(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  useEffect(() => {
    setCurrentVote(initialVote);
  }, []);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };

      await axios.patch("/api/room/post/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setVotesAmount((prev) => prev - 1);
      else setVotesAmount((prev) => prev + 1);

      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Erghh, something goes wrong",
        description: "Your vote was not been inserted on database",
        variant: "destructive",
      });
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        setCurrentVote(undefined);
        if (type === "UP") setVotesAmount((prev) => prev - 1);
        else if (type === "DOWN") setVotesAmount((prev) => prev + 1);
      } else {
        setCurrentVote(type);
        if (type === "UP")
          setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex gap-4 pb-4 pr-6 sm:w-20 sm:flex-col sm:gap-0 sm:pb-0">
      <Button onClick={() => vote("UP")} size="sm" variant="ghost">
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "fill-emerald-500 text-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      <p className="py-2 text-center text-sm font-medium text-zinc-900 ">
        {votesAmount}
      </p>

      <Button onClick={() => vote("DOWN")} size="sm" variant="ghost">
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "fill-red-500 text-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
}
