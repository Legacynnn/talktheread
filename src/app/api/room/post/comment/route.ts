import { z } from "zod";
import { getAuthSession } from "../../../../../lib/auth";
import { db } from "../../../../../lib/db";
import { commentValidator } from "../../../../../lib/validators/comment";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, text, replyToId } = commentValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) return new Response("Unauthorized", { status: 401 });

    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    });

    return new Response("OK");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }

    return new Response("could not create comment", { status: 500 });
  }
}
