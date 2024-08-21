"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import Spinner from "./Spinner";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";

const pointValues = ["0.5", "1", "2", "3", "5", "8", "13", "?"];

export default function RoomPage({ id }: { id: string }) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [hasRoom, setHasRoom] = useState(false);

  const { data: roomById, error: roomError } = api.room.getRoom.useQuery(
    { roomId: id },
    {
      refetchInterval: !!hasRoom ? 1000 : false, // Refetch every 1 seconds
      // only enable if no hyphen in id
      enabled: !id.includes("-") && !hasError,
    },
  );

  // look up by slug if hyphen in id
  const { data: roomBySlug, error: roomBySlugError } =
    api.room.getBySlug.useQuery(
      { slug: id },
      {
        refetchInterval: !!hasRoom ? 1000 : false, // Refetch every 1 seconds
        enabled: id.includes("-") && !hasError,
      },
    );

  const room = roomById ?? roomBySlug;

  const leaveRoom = api.room.leave.useMutation({
    onSuccess: () => {
      utils.room.invalidate();
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
      utils.room.invalidate();
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

  useEffect(() => {
    if (room) {
      setHasRoom(true);
    }
  }, [room]);

  const castVote = api.vote.castVote.useMutation({
    onSuccess: () => utils.room.invalidate(),
  });

  const resetVotes = api.vote.resetVotes.useMutation({
    onSuccess: () => utils.room.invalidate(),
  });

  const toggleVotesVisible = api.room.toggleVotesVisible.useMutation({
    onSuccess: () => utils.room.invalidate(),
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
    resetVotes.mutate({ roomId: room.id });
    setSelectedValue(null);
  };

  const handleToggleVotesVisible = () => {
    if (!room) return;
    toggleVotesVisible.mutate({ roomId: room.id });
  };

  // Set the initial selected value based on the user's vote from the room data
  useEffect(() => {
    if (room && session?.user && selectedValue === null) {
      const userVote = room.votes.find(
        (vote) => vote.userId === session.user.id,
      );
      setSelectedValue(userVote ? userVote.value : null);
    }
  }, [room, session?.user]);

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
          <Button onClick={handleToggleVotesVisible} variant={"outline"}>
            {room.votesVisible ? "Hide" : "Reveal"}
          </Button>
          <h2 className="text-lg font-semibold">Results</h2>
          {room.ownerId === room.participants[0]?.id && (
            <Button onClick={handleResetVotes} variant="secondary">
              Reset
            </Button>
          )}
        </div>
        <ul className="space-y-4">
          {room.participants.map((participant) => {
            const vote = room.votes.find((v) => v.userId === participant.id);
            return (
              <li
                key={participant.id}
                className="flex min-h-16 items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 shadow"
              >
                <span>{participant.name}</span>
                <span className="text-2xl">
                  {!!vote?.value ? (
                    <div className="rounded-md bg-gray-100 p-2 shadow-inner">
                      {room.votesVisible ? (vote?.value ?? "?") : "?"}
                    </div>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
