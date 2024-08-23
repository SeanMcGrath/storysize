import React from "react";

interface CardStackIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const CardStackIcon: React.FC<CardStackIconProps> = ({
  className = "",
  width = 24,
  height = 24,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="5"
        y="3"
        width="11"
        height="15"
        rx="2"
        fill="#e0e0e0"
        stroke="#333333"
        strokeWidth="2"
      />
      <rect
        x="9"
        y="6"
        width="11"
        height="15"
        rx="2"
        fill="#f5f5f5"
        stroke="#333333"
        strokeWidth="2"
      />
    </svg>
  );
};

export default CardStackIcon;
