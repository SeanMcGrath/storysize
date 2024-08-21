"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export default function useRoomData(id: string) {
  const [error, setError] = useState<string | null>(null);

  const { data: roomById, error: roomError } = api.room.getRoom.useQuery(
    { roomId: id },
    {
      enabled: !id.includes("-") && !error,
    },
  );

  const { data: roomBySlug, error: roomBySlugError } =
    api.room.getBySlug.useQuery(
      { slug: id },
      {
        enabled: id.includes("-") && !error,
      },
    );

  const room = roomById ?? roomBySlug;

  useEffect(() => {
    if (roomError) {
      setError(roomError.message);
    } else if (roomBySlugError) {
      setError(roomBySlugError.message);
    }
  }, [roomError, roomBySlugError]);

  return {
    room,
    error,
    isLoading: !room && !error,
  };
}
