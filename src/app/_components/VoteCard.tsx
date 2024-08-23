interface VoteCardProps {
  value: string | null;
  isRevealed: boolean;
}

const VoteCard: React.FC<VoteCardProps> = ({ value, isRevealed }) => {
  if (value === null) {
    return (
      <div className="flex h-24 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
        <span className="text-xs text-gray-400">No vote</span>
      </div>
    );
  }

  return (
    <div className="perspective-1000 h-24 w-16">
      <div
        className={`duration-600 relative h-full w-full transition-transform ${
          isRevealed ? "[transform:rotateY(180deg)]" : ""
        } preserve-3d`}
      >
        {/* Card back */}
        <div className="backface-hidden absolute h-full w-full rounded-lg bg-white p-0.5 shadow-md">
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-500">
            <div className="h-20 w-12 rounded-md border-4 border-white bg-gray-600">
              <div className="flex h-full w-full items-center justify-center bg-gray-500 bg-opacity-50">
                <div className="h-3 w-3 rotate-45 transform bg-white"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Card front */}
        <div className="backface-hidden absolute h-full w-full rounded-lg bg-white p-0.5 shadow-md [transform:rotateY(180deg)]">
          <div className="relative flex h-full w-full items-center justify-center rounded-md border border-gray-200 bg-white">
            {/* Top-left corner */}
            <div className="absolute left-1 top-1 text-xs font-bold text-gray-500">
              {value}
            </div>
            {/* Bottom-right corner */}
            <div className="absolute bottom-1 right-1 rotate-180 text-xs font-bold text-gray-500">
              {value}
            </div>
            {/* Center value */}
            <span className="text-2xl font-bold text-gray-500">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteCard;
