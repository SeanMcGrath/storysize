import { Button } from "~/components/ui/button";

const pointValues = ["0.5", "1", "2", "3", "5", "8", "13", "?"];

export default function VotingArea({
  selectedValue,
  onVote,
}: {
  selectedValue: string | null;
  onVote: (value: string) => void;
}) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 md:grid-cols-8">
        {pointValues.map((value) => (
          <Button
            key={value}
            onClick={() => onVote(value)}
            className={`rounded-md border px-2 py-8 text-lg shadow ${
              selectedValue === value
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {value}
          </Button>
        ))}
      </div>
    </div>
  );
}
