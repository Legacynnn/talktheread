"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import UserAvatar from "./UserAvatar";
import { Input } from "./ui/Input";
import { Button } from "./ui/button";
import { ImageIcon, Link } from "lucide-react";

interface MiniCreatePostProps {
  session: Session | null;
}

export default function MiniCreatePost({ session }: MiniCreatePostProps) {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <li className="overflow-hidden rounded-md bg-white shadow">
      <div className="flex h-full justify-between gap-6 px-6 py-4">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />

          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 outline outline-2 outline-white" />
        </div>

        <Input
          readOnly
          onClick={() => router.push(pathName + "/submit")}
          placeholder="Create post"
        />

        <Button
          variant="ghost"
          onClick={() => router.push(pathName + "/submit")}
        >
          <ImageIcon className="text-zinc-600" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push(pathName + "/submit")}
        >
          <Link className="text-zinc-600" />
        </Button>
      </div>
    </li>
  );
}
