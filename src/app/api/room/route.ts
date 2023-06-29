import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { roomValidator } from "@/lib/validators/room";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = roomValidator.parse(body);

    const roomExist = await db.room.findFirst({
      where: {
        name,
      },
    });

    if (roomExist) {
      return new Response("Room already exist", { status: 409 });
    }

    const room = await db.room.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    await db.subscription.create({
      data: {
        userId: session.user.id,
        roomId: room.id,
      },
    });

    return new Response(room.name);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }

    return new Response("Could not create the room", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);

    const roomId = url.searchParams.get("roomId");

    if (!roomId) return new Response("Invalid query", { status: 400 });

    const room = await db.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        subscribers: true,
      },
    });

    if (!room) return new Response("Cannot found this room", { status: 404 });

    if (room.creatorId !== session.user.id)
      return new Response("Unauthorized", { status: 401 });

    await db.subscription.deleteMany({
      where: {
        roomId,
      },
    });

    await db.post.deleteMany({
      where: {
        roomId
      }
    })

    await db.room.delete({
      where: {
        id: roomId,
      },
    });

    return new Response("Room deleted successfully");
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err);
      return new Response(err.message, { status: 400 });
    }
    console.log(err);
    return new Response("Could not delete the room", { status: 500 });
  }
}
