import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Editor from "@/components/Editor";

interface Props {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: Props) {
  const room = await db.room.findFirst({
    where: {
      name: params.slug,
    },
  });

  if (!room) return notFound();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-m2-2 -ml-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in c/{room.name}
          </p>
        </div>
      </div>

      <Editor roomId={room.id} />

      <div className="flex w-full justify-end">
        <Button form="room-post-form" type="submit" className="w-full">
          Post
        </Button>
      </div>
    </div>
  );
}
