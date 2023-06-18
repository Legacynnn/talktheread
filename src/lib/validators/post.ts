import { z } from "zod";

export const PostValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer then 3 characters" })
    .max(100, { message: "Title must be smaller then 100 characters" }),
  roomId: z.string(),
  content: z.any(),
});

export type PostCreate = z.infer<typeof PostValidator>;
