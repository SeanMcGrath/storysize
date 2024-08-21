import { Button } from "~/components/ui/button";
import { RouterOutputs } from "~/trpc/react";

type Room = RouterOutputs["room"]["getRoom"];

export default function ResultsArea({
  room,
  onToggleVotesVisible,
  onResetVotes,
}: {
  room: Room;
  onToggleVotesVisible: () => void;
  onResetVotes: () => void;
}) {
  const participantsWithVotes = room.participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    vote: room.votes.find((v) => v.userId === participant.id),
  }));

  return (
    <div className="my-8 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1">
          <Button onClick={onToggleVotesVisible} variant={"outline"}>
            {room.votesVisible ? "Hide" : "Reveal"}
          </Button>
        </div>
        <h2 className="text-lg font-semibold">Results</h2>
        <div className="flex flex-1 justify-end">
          {room.ownerId === room.participants[0]?.id && (
            <Button onClick={onResetVotes} variant="secondary">
              Reset
            </Button>
          )}
        </div>
      </div>
      <ul className="space-y-4">
        {participantsWithVotes.map(({ id, name, vote }) => (
          <li
            key={id}
            className="flex min-h-16 items-center justify-between rounded-lg border bg-white px-4 py-2 shadow"
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
  );
}
