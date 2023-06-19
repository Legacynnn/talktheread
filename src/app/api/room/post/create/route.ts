import { db } from "@/lib/db";
import { roomSubscrition } from "@/lib/validators/room";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";
import { PostValidator } from "@/lib/validators/post";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { roomId, title, content } = PostValidator.parse(body);

    const subscritionExist = await db.subscription.findFirst({
      where: {
        roomId,
        userId: session.user.id,
      },
    });

    if (!subscritionExist)
      return new Response("Subscribe to post.", {
        status: 400,
      });

    await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        roomsId: roomId,
      },
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }

    return new Response("Could not post", { status: 500 });
  }
}
