interface VoteCardProps {
    value: string | null;
    isRevealed: boolean;
  }
  
  const VoteCard: React.FC<VoteCardProps> = ({ value, isRevealed }) => {
    if (value === null) {
      return (
        <div className="h-24 w-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-xs">No vote</span>
        </div>
      );
    }
  
    return (
      <div className="h-24 w-16 perspective-1000">
        <div
          className={`relative h-full w-full transition-transform duration-600 ${
            isRevealed ? "[transform:rotateY(180deg)]" : ""
          } preserve-3d`}
        >
          {/* Card back */}
          <div className="absolute h-full w-full rounded-lg bg-white p-0.5 shadow-md backface-hidden">
            <div className="h-full w-full rounded-md bg-gray-500 flex items-center justify-center">
              <div className="h-20 w-12 border-4 border-white rounded-md bg-gray-600">
                <div className="h-full w-full bg-gray-500 bg-opacity-50 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Card front */}
          <div className="absolute h-full w-full rounded-lg bg-white p-0.5 shadow-md [transform:rotateY(180deg)] backface-hidden">
            <div className="h-full w-full rounded-md bg-white border border-gray-200 flex items-center justify-center relative">
              {/* Top-left corner */}
              <div className="absolute top-1 left-1 text-xs font-bold text-gray-500">
                {value}
              </div>
              {/* Bottom-right corner */}
              <div className="absolute bottom-1 right-1 text-xs font-bold text-gray-500 rotate-180">
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