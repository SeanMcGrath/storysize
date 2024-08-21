import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pusherServer } from "~/lib/pusher";

export const voteRouter = createTRPCRouter({
  castVote: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        value: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.value === null) {
        return ctx.db.vote.delete({
          where: {
            userId_roomId: {
              userId: ctx.session.user.id,
              roomId: input.roomId,
            },
          },
        });
      }
      const result = await ctx.db.vote.upsert({
        where: {
          userId_roomId: {
            userId: ctx.session.user.id,
            roomId: input.roomId,
          },
        },
        update: {
          value: input.value,
        },
        create: {
          userId: ctx.session.user.id,
          roomId: input.roomId,
          value: input.value,
        },
      });

      // Trigger Pusher event
      await pusherServer.trigger(`room-${input.roomId}`, "vote-update", {});

      return result;
    }),

  resetVotes: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if the user is the room owner
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      });

      if (room?.ownerId !== ctx.session.user.id) {
        throw new Error("Only the room owner can reset votes");
      }

      const result = await ctx.db.vote.deleteMany({
        where: { roomId: input.roomId },
      });

      // Trigger Pusher event
      await pusherServer.trigger(`room-${input.roomId}`, "vote-reset", {});

      return result;
    }),

  getVotes: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.vote.findMany({
        where: { roomId: input.roomId },
        include: { user: true },
      });
    }),
});
