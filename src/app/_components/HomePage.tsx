"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";
import RoomCard from "./RoomCard";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const createRoom = api.room.create.useMutation();

  const {
    data: rooms,
    isLoading: roomsLoading,
    refetch,
  } = api.room.listRooms.useQuery();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName) {
      setIsLoading(true);
      createRoom.mutate(
        { name: roomName.trim() },
        {
          onSuccess: (data) => {
            refetch();
            setRoomName("");
            setIsLoading(false);
            setIsCreating(false);
            router.push(`/rooms/${data.slug}`);
          },
          onError: (error) => {
            console.error(error);
            setIsLoading(false);
          },
        },
      );
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Scrum Poker</h1>
        <p className="mb-4">Please sign in to create or join rooms.</p>
      </div>
    );
  }

  if (roomsLoading || !rooms) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-1 max-w-2xl flex-col items-center justify-center space-y-2">
      <ul className="w-full space-y-2">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            id={room.id}
            name={room.name}
            slug={room.slug}
            createdAt={room.createdAt}
            isCurrentUserOwner={room.ownerId === session.user.id}
          />
        ))}
      </ul>

      <Button
        className="flex h-20 w-full flex-col justify-center rounded-md border-2 border-dashed border-gray-300 p-4 hover:bg-gray-200"
        variant={"ghost"}
        onClick={() => !isCreating && setIsCreating(true)}
      >
        {isCreating ? (
          <form
            onSubmit={handleCreateRoom}
            className="flex w-full items-center"
          >
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="flex-grow rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="ml-2 rounded-md px-4 py-2"
              disabled={isLoading || !roomName}
            >
              {isLoading ? <Spinner color="white" /> : "Create"}
            </Button>
          </form>
        ) : (
          <div>+ Create Room</div>
        )}
      </Button>
    </div>
  );
}
