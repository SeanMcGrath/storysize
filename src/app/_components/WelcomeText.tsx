"use client";

import { useSession } from "next-auth/react";

export default function WelcomeText() {
  const { data: session } = useSession();

  if (session) {
    return null;
  }

  return (
    <>
      <h1 className="text-center text-4xl font-bold">Welcome to Storysize</h1>
      <p className="text-center text-xl">Your Free Online Scrum Poker Tool</p>
      <p className="text-center">
        Streamline your agile estimation process with our easy-to-use planning
        poker app.
      </p>
    </>
  );
}
