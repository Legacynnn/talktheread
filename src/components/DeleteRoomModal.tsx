"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useCustomToast } from "../hooks/use-custom-toast";
import { toast } from "../hooks/use-toast";
import { DeleteRoomPayload } from "../lib/validators/room";
import { Button, buttonVariants } from "./ui/button";

interface Props {
  roomId: string;
}

export default function DeleteRoomModal({ roomId }: Props) {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: room, isLoading } = useMutation({
    mutationFn: async ({ roomId }: DeleteRoomPayload) => {
      await axios.delete(`/api/room?roomId=${roomId}`);
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
      router.push("/");
      return toast({
        title: "Community has been deleted",
        description: "You can create a new community :)",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <span
          className={buttonVariants({
            variant: "destructive",
            className: "mb-6 w-full bg-red-500",
          })}
        >
          Delete Community
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your room
            and remove all the posts and comments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={() => room({ roomId })} isLoading={isLoading}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
