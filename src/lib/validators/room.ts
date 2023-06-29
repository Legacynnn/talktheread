import { z } from "zod";

export const roomValidator = z.object({
  name: z.string().min(3).max(21),
});

export const roomSubscrition = z.object({
  roomId: z.string(),
});

export const roomDelete = z.object({
  roomId: z.string(),
});

export type CreateRoomPayload = z.infer<typeof roomValidator>;
export type SubscribePayload = z.infer<typeof roomSubscrition>;
export type DeleteRoomPayload = z.infer<typeof roomDelete>;

