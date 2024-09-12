"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

export default function useRoomData(idOrSlug: string) {
  const [error, setError] = useState<string | null>(null);

  const { data: roomById, error: roomError } = api.room.getRoom.useQuery(
    { roomId: idOrSlug },
    {
      enabled: !idOrSlug.includes("-") && !error,
    },
  );

  const { data: roomBySlug, error: roomBySlugError } =
    api.room.getBySlug.useQuery(
      { slug: idOrSlug },
      {
        enabled: idOrSlug.includes("-") && !error,
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
