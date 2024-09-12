"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import RoomHeader from "./RoomHeader";
import VotingArea from "./VotingArea";
import ResultsArea from "./ResultsArea";
import useRoomData from "../hooks/useRoomData";
import useRoomActions from "../hooks/useRoomActions";
import { api } from "~/trpc/react";
import { Separator } from "~/components/ui/separator";
import { usePusher } from "../contexts/PusherContext";
import { useRouter } from "next/navigation";
import { useToast } from "~/components/ui/use-toast";
import { join } from "path";

export default function RoomPage({ id }: { id: string }) {
  const utils = api.useUtils();
  const { data: session } = useSession();
  const { pusherClient } = usePusher();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const { room, error } = useRoomData(id);
  const {
    handleVote,
    handleResetVotes,
    handleToggleVotesVisible,
    leaveRoom,
    deleteRoom,
    joinRoom,
  } = useRoomActions(room, selectedValue, setSelectedValue);

  useEffect(() => {
    if (
      room &&
      session &&
      !joinRoom.isPending &&
      !joinRoom.isSuccess &&
      !room.participants.some((p: { id: string }) => p.id === session.user.id)
    ) {
      joinRoom.mutate({ slug: room.slug });
    }
  }, [room, session, joinRoom]);

  useEffect(() => {
    if (room && pusherClient) {
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
      channel.bind("room-closed", () => {
        utils.room.getRoom.invalidate();
        utils.room.getBySlug.invalidate();
        router.push("/");
        toast({
          title: "Room closed",
          description: "The room owner has closed this room.",
          variant: "destructive",
        });
      });

      return () => {
        pusherClient.unsubscribe(`room-${room.id}`);
      };
    }
  }, [
    room,
    utils.room.getRoom,
    utils.room.getBySlug,
    pusherClient,
    router,
    toast,
  ]);

  // Set the initial selected value based on the user's vote from the room data
  useEffect(() => {
    if (room && session?.user && !selectedValue) {
      const userVote = room.votes.find(
        (vote) => vote.userId === session.user.id,
      );
      setSelectedValue(userVote ? userVote.value : null);
    }
  }, [room, session?.user]);

  if (!room && !error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error == "Room not found") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-center">
          Oops! It looks like this room doesn't exist.
          <br />
          Why not try creating a new one or joining another?
        </p>
      </div>
    );
  }

  if (!!error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Error: {error}</p>
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

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <RoomHeader
        room={room}
        onLeaveRoom={() => leaveRoom.mutate({ roomId: room.id })}
        onDeleteRoom={() => deleteRoom.mutate({ roomId: room.id })}
      />
      <VotingArea selectedValue={selectedValue} onVote={handleVote} />
      <Separator />
      <ResultsArea
        room={room}
        onToggleVotesVisible={handleToggleVotesVisible}
        onResetVotes={handleResetVotes}
      />
    </div>
  );
}
