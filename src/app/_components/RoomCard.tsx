import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import Spinner from "./Spinner";
import { useToast } from "~/components/ui/use-toast";

interface RoomCardProps {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  isCurrentUserOwner?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  id,
  name,
  slug,
  createdAt,
  isCurrentUserOwner,
}) => {
  const utils = api.useUtils();
  const { toast } = useToast();

  const deleteRoom = api.room.delete.useMutation({
    onSuccess: () => {
      utils.room.listRooms.invalidate();
      toast({
        title: "Room deleted",
        variant: "destructive",
      });
    },
  });

  const leaveRoom = api.room.leave.useMutation({
    onSuccess: () => {
      utils.room.invalidate();
      toast({
        title: "Left room",
        variant: "destructive",
      });
    },
  });

  const deleting = deleteRoom.isPending || deleteRoom.isSuccess;
  const leaving = leaveRoom.isPending || leaveRoom.isSuccess;

  return (
    <li className="overflow-hidden bg-white shadow hover:bg-gray-50 sm:rounded-md">
      <Link
        href={`/rooms/${slug}`}
        className="group flex items-center justify-between"
      >
        <div className="px-4 py-4 sm:px-6">
          <p className="truncate text-sm font-medium text-primary">{name}</p>
          <p className="mt-1 text-sm text-gray-500">
            Created at: {new Date(createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-1"></div>
        <div className="flex-0 mr-6 flex items-center gap-2">
          <Button
            className="flex text-xs"
            onClick={(event) => {
              navigator.clipboard.writeText(
                `${window.location.origin}/join/${slug}`,
              );
              toast({
                title: "Link copied",
                description: "Room link copied to clipboard",
              });
              event.preventDefault();
              event.stopPropagation();
            }}
            variant={"secondary"}
          >
            Copy Link
          </Button>
          {isCurrentUserOwner ? (
            <Button
              className="flex text-xs"
              onClick={(event) => {
                deleteRoom.mutate({ roomId: id });
                event.preventDefault();
                event.stopPropagation();
              }}
              disabled={deleting}
              variant={"destructive"}
            >
              {deleting ? <Spinner /> : "Delete"}
            </Button>
          ) : (
            <Button
              className="flex text-xs"
              onClick={(event) => {
                leaveRoom.mutate({ roomId: id });
                event.preventDefault();
                event.stopPropagation();
              }}
              disabled={leaving}
              variant={"destructive"}
            >
              {leaving ? <Spinner /> : "Leave"}
            </Button>
          )}
        </div>
      </Link>
    </li>
  );
};

export default RoomCard;
