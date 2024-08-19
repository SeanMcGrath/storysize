import React from "react";

interface SpinnerProps {
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ color }) => {
  const borderColor = color === "white" ? "border-white" : "border-primary";
  return (
    <div className="flex items-center justify-center">
      <div
        className={`h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 ${borderColor}`}
      ></div>
    </div>
  );
};

export default Spinner;
