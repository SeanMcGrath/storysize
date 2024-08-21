import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { RouterOutputs } from "~/trpc/react";
import { Copy, Trash2, LogOut } from "lucide-react";

type Room = RouterOutputs["room"]["getRoom"];

export default function RoomHeader({
  room,
  onLeaveRoom,
  onDeleteRoom,
}: {
  room: Room;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();

  const isCurrentUserOwner = room.ownerId === session?.user?.id;
  return (
    <>
      <div className="flex items-center justify-center">
        <h1 className="mb-6 text-3xl font-bold">{room.name}</h1>
      </div>
      <div className="mb-6 flex justify-between gap-2">
        <Button
          className="flex items-center gap-2"
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
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
        {isCurrentUserOwner ? (
          <Button onClick={onDeleteRoom} variant={"destructive"} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Room
          </Button>
        ) : (
          <Button onClick={onLeaveRoom} variant={"secondary"} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Leave Room
          </Button>
        )}
      </div>
    </>
  );
}
