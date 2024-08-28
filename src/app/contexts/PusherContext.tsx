import React, { createContext, useContext, useEffect, useState } from "react";
import PusherClient from "pusher-js";

type PusherContextType = {
  pusherClient: PusherClient | null;
};

const PusherContext = createContext<PusherContextType>({ pusherClient: null });

export const usePusher = () => useContext(PusherContext);

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const [pusherClient, setPusherClient] = useState<PusherClient | null>(null);

  useEffect(() => {
    const client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    setPusherClient(client);

    return () => {
      client.disconnect();
    };
  }, []);

  return (
    <PusherContext.Provider value={{ pusherClient }}>
      {children}
    </PusherContext.Provider>
  );
}
