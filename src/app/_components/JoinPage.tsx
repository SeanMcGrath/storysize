"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import Spinner from "./Spinner";

const JoinPage: React.FC<{ roomSlug: string }> = ({ roomSlug }) => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const joinRoom = api.room.joinBySlug.useMutation({
    onError: () => {
      // redirect to home page if error
      router.push("/");
    },
    onSuccess: (data) => {
      router.push(`/rooms/${data.slug}`);
    },
  });

  useEffect(() => {
    if (
      !!session &&
      sessionStatus === "authenticated" &&
      !joinRoom.isPending &&
      !joinRoom.isError
    ) {
      joinRoom.mutate({ slug: roomSlug });
    }
  }, [sessionStatus, roomSlug, joinRoom, router]);

  if (sessionStatus === "loading" || joinRoom.isPending) {
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

  return null;
};

export default JoinPage;
