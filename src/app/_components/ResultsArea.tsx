import { Button } from "~/components/ui/button";
import { RouterOutputs } from "~/trpc/react";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import VoteCard from "./VoteCard";

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
    vote: room.votes.find((v) => v.userId === participant.id)?.value ?? null,
  }));

  const hasVotes = room.votes.length > 0;

  const calculateVoteStatistics = () => {
    const validVotes = room.votes
      .filter((v) => v.value !== "?")
      .map((v) => Number(v.value));
    if (validVotes.length === 0) return null;

    const modeMap = new Map();
    let maxCount = 0;
    let mode = validVotes[0];

    validVotes.forEach((vote) => {
      const count = (modeMap.get(vote) || 0) + 1;
      modeMap.set(vote, count);
      if (count > maxCount) {
        maxCount = count;
        mode = vote;
      }
    });

    const average =
      validVotes.reduce((sum, vote) => sum + vote, 0) / validVotes.length;

    return { mode, average: average.toFixed(1) };
  };

  const voteStatistics = room.votesVisible ? calculateVoteStatistics() : null;

  return (
    <div className="my-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1">
          <Button
            onClick={onToggleVotesVisible}
            variant={"outline"}
            className="flex items-center gap-2"
            disabled={!hasVotes}
          >
            {room.votesVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {room.votesVisible ? "Hide" : "Reveal"}
          </Button>
        </div>
        <h2 className="text-lg font-semibold">Results</h2>
        <div className="flex flex-1 justify-end">
          {room.ownerId === room.participants[0]?.id && (
            <Button
              onClick={onResetVotes}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={!hasVotes}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {participantsWithVotes.map(({ id, name, vote }) => (
          <li key={id} className="flex flex-col items-center space-y-2">
            <VoteCard value={vote} isRevealed={room.votesVisible} />
            <span className="text-sm font-medium">{name}</span>
          </li>
        ))}
      </ul>
      {room.votesVisible && voteStatistics && (
        <div className="mt-6 hidden text-center sm:block">
          <div className="flex justify-center space-x-8">
            <div>
              <span className="text-sm text-muted-foreground">
                Most Common:
              </span>
              <span className="ml-2 font-semibold">{voteStatistics.mode}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Average:</span>
              <span className="ml-2 font-semibold">
                {voteStatistics.average}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
