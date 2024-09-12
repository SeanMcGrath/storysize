interface VoteCardProps {
  value: string | null;
  isRevealed: boolean;
}

const colorMap: { [key: string]: string } = {
  "0.5": "bg-blue-100 border-blue-300",
  "1": "bg-green-100 border-green-300",
  "2": "bg-yellow-100 border-yellow-300",
  "3": "bg-orange-100 border-orange-300",
  "5": "bg-red-100 border-red-300",
  "8": "bg-purple-100 border-purple-300",
  "13": "bg-pink-100 border-pink-300",
  "?": "bg-gray-100 border-gray-300",
};

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
        className={`relative h-full w-full transition-transform duration-600 ${
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
          <div
            className={`relative flex h-full w-full items-center justify-center rounded-md border ${colorMap[value] || "border-gray-200 bg-white"}`}
          >
            {/* Top-left corner */}
            <div className="absolute left-1 top-1 text-xs font-bold text-gray-700">
              {value}
            </div>
            {/* Bottom-right corner */}
            <div className="absolute bottom-1 right-1 rotate-180 text-xs font-bold text-gray-700">
              {value}
            </div>
            {/* Center value */}
            <span className="text-2xl font-bold text-gray-700">{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteCard;
