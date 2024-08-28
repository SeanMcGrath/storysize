"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import { PusherProvider } from "../contexts/PusherContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <PusherProvider>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </PusherProvider>
    </SessionProvider>
  );
};

export default Providers;
