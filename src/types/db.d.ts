import { Comment, Post, Room, User, Vote } from "@prisma/client";

export type ExtendPost = Post & {
  room: Room;
  votes: Vote[];
  author: User;
  comments: Comment[];
};
