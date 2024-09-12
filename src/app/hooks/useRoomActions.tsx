import { api, RouterOutputs } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Room = RouterOutputs["room"]["getRoom"];
type SetSelectedValueFunction = React.Dispatch<
  React.SetStateAction<string | null>
>;

export default function useRoomActions(
  room: Room | null | undefined,
  selectedValue: string | null,
  setSelectedValue: SetSelectedValueFunction,
) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = useSession();
  const { toast } = useToast();

  const castVote = api.vote.castVote.useMutation({
    onMutate: async ({ roomId, value }) => {
      if (!room || !session) return;
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await utils.room.getRoom.cancel({ roomId });
      await utils.room.getBySlug.cancel({ slug: room.slug });

      // Snapshot the previous values
      const previousRoom =
        utils.room.getRoom.getData({ roomId }) ??
        utils.room.getBySlug.getData({ slug: room.slug });

      // Optimistically update to the new value
      if (previousRoom && session?.user) {
        const updateData = (old: typeof previousRoom | undefined) => {
          if (!old) return old;
          const updatedVotes = old.votes.filter(
            (v) => v.userId !== session.user.id,
          );
          if (value !== null) {
            updatedVotes.push({
              id: `temp-${session.user.id}`,
              user: { id: session.user.id },
              value,
              userId: session.user.id,
              roomId: roomId,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          return { ...old, votes: updatedVotes };
        };

        utils.room.getRoom.setData({ roomId: room.id }, updateData);
        utils.room.getBySlug.setData({ slug: room.slug }, updateData);
      }

      // Return a context object with the snapshotted values
      return { previousRoom };
    },
    onError: (err, newVote, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRoom) {
        utils.room.getRoom.setData(
          { roomId: context.previousRoom.id },
          context.previousRoom,
        );
        utils.room.getBySlug.setData(
          { slug: context.previousRoom.slug },
          context.previousRoom,
        );
      }
    },
    onSettled: () => {
      // Sync with the server once mutation has settled
      utils.room.getRoom.invalidate({ roomId: room?.id || "" });
      utils.room.getBySlug.invalidate({ slug: room?.slug || "" });
    },
  });

  const resetVotes = api.vote.resetVotes.useMutation({
    onMutate: async ({ roomId }) => {
      if (!room || !session) return;
      // Cancel any outgoing refetches
      await utils.room.getRoom.cancel({ roomId: room.id });
      await utils.room.getBySlug.cancel({ slug: room.slug });

      // Snapshot the previous values
      const previousRoom =
        utils.room.getRoom.getData({ roomId: room.id }) ??
        utils.room.getBySlug.getData({ slug: room.slug });

      // Optimistically update to reset votes
      const updateData = (old: typeof previousRoom) => {
        if (!old) return old;
        return { ...old, votesVisible: false, votes: [] };
      };

      utils.room.getRoom.setData({ roomId: room.id }, updateData);
      utils.room.getBySlug.setData({ slug: room.slug }, updateData);

      // Return a context object with the snapshotted values
      return { previousRoom };
    },
    onError: (err, newVote, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousRoom) {
        utils.room.getRoom.setData(
          { roomId: context.previousRoom.id },
          context.previousRoom,
        );
        utils.room.getBySlug.setData(
          { slug: context.previousRoom.slug },
          context.previousRoom,
        );
      }
    },
    onSuccess: () => {
      utils.room.getRoom.invalidate();
      utils.room.getBySlug.invalidate();
    },
  });

  const toggleVotesVisible = api.room.toggleVotesVisible.useMutation({
    onMutate: async ({ roomId }) => {
      if (!room || !session) return;
      // Cancel any outgoing refetches
      await utils.room.getRoom.cancel({ roomId: room.id });
      await utils.room.getBySlug.cancel({ slug: room.slug });

      // Snapshot the previous values
      const previousRoom =
        utils.room.getRoom.getData({ roomId: room.id }) ??
        utils.room.getBySlug.getData({ slug: room.slug });

      // Optimistically update to toggle votesVisible
      const updateData = (old: typeof previousRoom) => {
        if (!old) return old;
        return { ...old, votesVisible: !old.votesVisible };
      };

      utils.room.getRoom.setData({ roomId: room.id }, updateData);
      utils.room.getBySlug.setData({ slug: room.slug }, updateData);

      // Return a context object with the snapshotted values
      return { previousRoom };
    },
    onError: (err, newVote, context) => {
      // If the mutation fails, roll back to the previous state
      if (context?.previousRoom) {
        utils.room.getRoom.setData(
          { roomId: context.previousRoom.id },
          context.previousRoom,
        );
        utils.room.getBySlug.setData(
          { slug: context.previousRoom.slug },
          context.previousRoom,
        );
      }
    },
    onSuccess: () => {
      utils.room.getRoom.invalidate();
      utils.room.getBySlug.invalidate();
    },
  });

  const leaveRoom = api.room.leave.useMutation({
    onSuccess: () => {
      router.push("/");
      toast({
        title: "Left room",
        description: "You have successfully left the room",
      });
    },
  });

  const deleteRoom = api.room.delete.useMutation({
    onSuccess: () => {
      router.push("/");
      toast({
        title: "Room deleted",
        description: "The room has been successfully deleted",
      });
      utils.room.getRoom.invalidate();
      utils.room.getBySlug.invalidate();
      utils.room.listRooms.invalidate();
    },
  });

  const joinRoom = api.room.joinBySlug.useMutation({
    onSuccess: () => {
      utils.room.getRoom.invalidate();
      utils.room.getBySlug.invalidate();
      utils.room.listRooms.invalidate();
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

  return {
    handleVote,
    handleResetVotes,
    handleToggleVotesVisible,
    leaveRoom,
    deleteRoom,
    joinRoom,
  };
}
