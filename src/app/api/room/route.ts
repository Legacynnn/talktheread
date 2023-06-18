import { getAuthSession } from "@/lib/auth";
import { roomValidator } from "@/lib/validators/room";
import { db } from "@/lib/db";
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
