import { db } from "@/lib/db";
import { roomSubscrition } from "@/lib/validators/room";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { roomId } = roomSubscrition.parse(body);

    const subscritionExist = await db.subscription.findFirst({
      where: {
        roomId,
        userId: session.user.id,
      },
    });

    if (!subscritionExist)
      return new Response("You are not subscribed to this room.", {
        status: 400,
      });

    const room = await db.room.findFirst({
      where: {
        id: roomId,
        creatorId: session.user.id,
      },
    });

    if (room) {
      return new Response("You cant unsubscribe to your own room", {
        status: 400,
      });
    }

    await db.subscription.delete({
      where: {
        userId_roomId: {
          roomId,
          userId: session.user.id,
        },
      },
    });

    return new Response(roomId);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }

    return new Response("Could not unsubscribe", { status: 500 });
  }
}
