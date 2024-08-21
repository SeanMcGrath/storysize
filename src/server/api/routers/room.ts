import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { pusherServer } from "~/lib/pusher";

export const roomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        votesVisible: z.boolean().optional(), // Added votesVisible field
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // forbid generation if user already in 10 rooms
      const roomCount = await ctx.db.room.count({
        where: {
          deletedAt: null,
          participants: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
      });

      if (roomCount >= 10) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are in too many rooms already!",
        });
      }

      const slug = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: "-",
        length: 3,
      });
      return ctx.db.room.create({
        data: {
          name: input.name.trim(),
          slug,
          description: input.description?.trim(),
          ownerId: ctx.session.user.id,
          votesVisible: input.votesVisible ?? false, // Set votesVisible
          participants: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),

  join: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          participants: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      await pusherServer.trigger(`room-${input.roomId}`, "participant-joined", {
        userId: ctx.session.user.id,
      });

      return result;
    }),

  joinBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: {
          slug: input.slug,
          deletedAt: null,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Room not found",
        });
      }

      const result = await ctx.db.room.update({
        where: { id: room.id },
        data: {
          participants: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      await pusherServer.trigger(`room-${room.id}`, "participant-joined", {
        userId: ctx.session.user.id,
      });

      return result;
    }),

  leave: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          participants: true,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Room not found",
        });
      }

      if (room.ownerId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Owners must delete the room instead of leaving",
        });
      }

      if (room.participants.length === 1) {
        // If the user is the last participant, soft delete the room
        return ctx.db.room.update({
          where: { id: input.roomId },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      const result = await ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          participants: {
            disconnect: { id: ctx.session.user.id },
          },
        },
      });

      await pusherServer.trigger(`room-${input.roomId}`, "participant-left", {
        userId: ctx.session.user.id,
      });

      return result;
    }),

  getRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: {
          id: input.roomId,
          deletedAt: null,
          participants: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Room not found",
        });
      }

      return room;
    }),

  getBySlug: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: {
          slug: input.slug,
          deletedAt: null,
          participants: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
            },
            orderBy: {
              name: "asc",
            },
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Room not found",
        });
      }

      return room;
    }),

  listRooms: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.room.findMany({
      where: {
        deletedAt: null,
        participants: {
          some: {
            id: ctx.session.user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  toggleVotesVisible: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      });

      if (!room) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Room not found",
        });
      }

      const result = await ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          votesVisible: !room.votesVisible,
        },
      });

      // Trigger Pusher event
      await pusherServer.trigger(
        `room-${input.roomId}`,
        "vote-visibility-toggle",
        {},
      );

      return result;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      });

      if (!room) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Room not found",
        });
      }

      if (room.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the owner of this room",
        });
      }

      return ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          deletedAt: new Date(), // Set the deletedAt field to the current date
        },
      });
    }),
});
