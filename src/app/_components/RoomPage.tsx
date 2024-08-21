"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import Spinner from "./Spinner";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { pusherClient } from "~/lib/pusher";

const pointValues = ["0.5", "1", "2", "3", "5", "8", "13", "?"];

export default function RoomPage({ id }: { id: string }) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const { data: roomById, error: roomError } = api.room.getRoom.useQuery(
    { roomId: id },
    {
      // only enable if no hyphen in id
      enabled: !id.includes("-") && !hasError,
    },
  );

  // look up by slug if hyphen in id
  const { data: roomBySlug, error: roomBySlugError } =
    api.room.getBySlug.useQuery(
      { slug: id },
      {
        enabled: id.includes("-") && !hasError,
      },
    );

  const room = roomById ?? roomBySlug;

  useEffect(() => {
    if (room) {
      const channel = pusherClient.subscribe(`room-${room.id}`);
      channel.bind("vote-update", () => {
        utils.room.getRoom.invalidate();
        utils.room.getBySlug.invalidate();
      });
      channel.bind("vote-reset", () => {
        setSelectedValue(null);
        utils.room.getRoom.invalidate();
        utils.room.getBySlug.invalidate();
      });
      channel.bind("vote-visibility-toggle", () => {
        utils.room.getRoom.invalidate();
        utils.room.getBySlug.invalidate();
      });
      channel.bind("participant-joined", () => {
        utils.room.getRoom.invalidate();
        utils.room.getBySlug.invalidate();
      });
      channel.bind("participant-left", () => {
        utils.room.getRoom.invalidate();
        utils.room.getBySlug.invalidate();
      });

      return () => {
        pusherClient.unsubscribe(`room-${room.id}`);
      };
    }
  }, [room, utils.room.getRoom, utils.room.getBySlug]);

  const leaveRoom = api.room.leave.useMutation({
    onSuccess: () => {
      router.push("/");
      toast({
        title: "Left room",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRoom = api.room.delete.useMutation({
    onSuccess: () => {
      router.push("/");
      toast({
        title: "Room deleted",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (roomError || roomBySlugError) {
      setHasError(true);
    }
  }, [roomError, roomBySlugError]);

  const castVote = api.vote.castVote.useMutation({
    onMutate: async ({ roomId, value }) => {
      if (!room) return;

      // Cancel any outgoing refetches
      await utils.room.getRoom.cancel({ roomId: id });
      await utils.room.getBySlug.cancel({ slug: room.slug });

      // Snapshot the previous value
      const previousRoom =
        utils.room.getRoom.getData({ roomId: id }) ??
        utils.room.getBySlug.getData({ slug: room.slug });

      // Optimistically update to the new value
      if (previousRoom && session?.user) {
        const updateData = (old: typeof previousRoom | undefined) => {
          if (!old) return old;
          const updatedVotes = old.votes.filter(
            (v) => v.userId !== session.user!.id,
          );
          if (value !== null) {
            updatedVotes.push({
              id: `temp-${Date.now()}`,
              userId: session.user!.id,
              value,
              createdAt: new Date(),
              updatedAt: new Date(),
              roomId: old.id,
              user: { id: session.user!.id },
            });
          }
          return { ...old, votes: updatedVotes };
        };

        utils.room.getRoom.setData({ roomId: id }, updateData);
        utils.room.getBySlug.setData({ slug: room.slug }, updateData);
      }

      return { previousRoom };
    },
    onError: (err, newVote, context) => {
      if (context?.previousRoom && room) {
        utils.room.getRoom.setData({ roomId: id }, context.previousRoom);
        utils.room.getBySlug.setData({ slug: room.slug }, context.previousRoom);
      }
    },
    onSettled: () => {
      utils.room.getRoom.invalidate({ roomId: id });
      utils.room.getBySlug.invalidate({ slug: room?.slug || "" });
    },
  });

  const resetVotes = api.vote.resetVotes.useMutation({
    onMutate: async () => {
      if (!room) return;

      await utils.room.getRoom.cancel({ roomId: id });
      await utils.room.getBySlug.cancel({ slug: room.slug });

      // Optimistically reset the current user's vote in the cache
      const previousRoom =
        utils.room.getRoom.getData({ roomId: id }) ??
        utils.room.getBySlug.getData({ slug: room.slug });

      if (previousRoom && session?.user) {
        const updateData = (old: typeof previousRoom | undefined) => {
          if (!old) return old;
          return {
            ...old,
            votes: old.votes.filter((v) => v.userId !== session.user!.id),
          };
        };

        utils.room.getRoom.setData({ roomId: id }, updateData);
        utils.room.getBySlug.setData({ slug: room.slug }, updateData);
      }

      return { previousRoom };
    },
  });

  const toggleVotesVisible = api.room.toggleVotesVisible.useMutation({
    onMutate: async () => {
      if (!room) return;

      await utils.room.getRoom.cancel({ roomId: id });
      await utils.room.getBySlug.cancel({ slug: room.slug });

      // Optimistically update the votes visibility in the cache
      const previousRoom =
        utils.room.getRoom.getData({ roomId: id }) ??
        utils.room.getBySlug.getData({ slug: room.slug });

      if (previousRoom) {
        const updateData = (old: typeof previousRoom | undefined) => {
          if (!old) return old;
          return {
            ...old,
            votesVisible: !old.votesVisible,
          };
        };

        utils.room.getRoom.setData({ roomId: id }, updateData);
        utils.room.getBySlug.setData({ slug: room.slug }, updateData);
      }

      return { previousRoom };
    },
  });

  const handleVote = (value: string) => {
    if (!room) return;
    if (selectedValue === value) {
      setSelectedValue(null);
      castVote.mutate({ roomId: room.id, value: null });
      return;
    }
    setSelectedValue(value);
    castVote.mutate({ roomId: room.id, value });
  };

  const handleResetVotes = () => {
    if (!room) return;
    setSelectedValue(null);
    resetVotes.mutate({ roomId: room.id });
  };

  const handleToggleVotesVisible = () => {
    if (!room) return;
    toggleVotesVisible.mutate({ roomId: room.id });
  };

  // Set the initial selected value based on the user's vote from the room data
  useEffect(() => {
    if (room && session?.user && !selectedValue) {
      const userVote = room.votes.find(
        (vote) => vote.userId === session.user.id,
      );
      setSelectedValue(userVote ? userVote.value : null);
    }
  }, [room, session?.user]);

  const participantsWithVotes = useMemo(
    () =>
      room?.participants.map((participant) => ({
        id: participant.id,
        name: participant.name,
        vote: room.votes.find((v) => v.userId === participant.id),
      })),
    [room?.participants, room?.votes],
  );

  if (!room && !roomError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!!roomError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Error: {roomError.message}</p>
      </div>
    );
  }

  if (!room) {
    // should not happen
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Room not found</p>
      </div>
    );
  }

  const isCurrentUserOwner = room.ownerId === session?.user?.id;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-center">
        <h1 className="mb-6 text-3xl font-bold">{room.name}</h1>
      </div>
      <div className="mb-6 flex justify-between gap-2">
        <Button
          className="flex text-xs"
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/join/${room.slug}`,
            );

            toast({
              title: "Link copied",
              description: "Room link copied to clipboard",
            });
          }}
          variant={"outline"}
        >
          Copy Link
        </Button>
        {isCurrentUserOwner ? (
          <Button
            onClick={() => deleteRoom.mutate({ roomId: room.id })}
            variant={"destructive"}
          >
            Delete Room
          </Button>
        ) : (
          <Button
            onClick={() => leaveRoom.mutate({ roomId: room.id })}
            variant={"secondary"}
          >
            Leave Room
          </Button>
        )}
      </div>
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 md:grid-cols-8">
          {pointValues.map((value) => (
            <Button
              key={value}
              onClick={() => handleVote(value)}
              className={`rounded-md border px-2 py-8 text-lg shadow ${
                selectedValue === value
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
      <hr />
      <div className="my-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1">
            <Button onClick={handleToggleVotesVisible} variant={"outline"}>
              {room.votesVisible ? "Hide" : "Reveal"}
            </Button>
          </div>
          <h2 className="text-lg font-semibold">Results</h2>
          <div className="flex flex-1 justify-end">
            {room.ownerId === room.participants[0]?.id && (
              <Button onClick={handleResetVotes} variant="secondary">
                Reset
              </Button>
            )}
          </div>
        </div>
        <ul className="space-y-4">
          {participantsWithVotes?.map(({ id, name, vote }) => (
            <li
              key={id}
              className="flex min-h-16 items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 shadow"
            >
              <span>{name}</span>
              <span className="text-xl">
                {!!vote?.value ? (
                  <div className="rounded-md bg-gray-100 p-2 shadow-inner">
                    {room.votesVisible ? (vote?.value ?? "?") : "?"}
                  </div>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
