import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        room: true,
      },
    });

    followedCommunitiesIds = followedCommunities.map(({ room }) => room.id);
  }

  try {
    const { limit, page, roomName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        roomName: z.string().nullish().optional(),
      })
      .parse({
        roomName: url.searchParams.get("roomName"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    let whereClause = {};

    if (roomName) {
      whereClause = {
        room: {
          name: roomName,
        },
      };
    } else if (session) {
      whereClause = {
        room: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    }

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        created_at: "desc",
      },
      include: {
        room: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(posts));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }

    return new Response("Could not fetch more posts", { status: 500 });
  }
}
