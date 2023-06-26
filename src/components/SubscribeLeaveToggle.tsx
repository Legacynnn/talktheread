"use client";

import React, { startTransition } from "react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { SubscribePayload } from "../lib/validators/room";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "../hooks/use-custom-toast";
import { toast } from "../hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  roomId: string;
  roomName: string;
  isSubscribe: boolean;
}

export default function SubscribeLeaveToggle({
  roomId,
  roomName,
  isSubscribe,
}: Props) {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribePayload = {
        roomId: roomId,
      };

      const { data } = await axios.post("/api/room/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Erghh, we have a problem",
        description: "Something goes wrong, please try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Subscribed",
        description: `You are now subscribed to c/${roomName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribePayload = {
        roomId: roomId,
      };

      const { data } = await axios.post("/api/room/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Erghh, we have a problem",
        description: "Something goes wrong, please try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Unsubscribed",
        description: `You are now Unsubscribed from c/${roomName}`,
      });
    },
  });

  return isSubscribe ? (
    <Button
      className="mb-4 mt-1 w-auto"
      onClick={() => unsubscribe()}
      isLoading={isUnsubLoading}
    >
      Leave community
    </Button>
  ) : (
    <Button
      className="mb-4 mt-1 w-auto"
      onClick={() => subscribe()}
      isLoading={isSubLoading}
    >
      Join to post
    </Button>
  );
}
