"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/" className="flex flex-shrink-0 items-center">
              Scrum Poker
            </Link>
          </div>
          <div className="flex items-center">
            {session ? (
              <>
                <span className="mr-4 text-gray-700">{session.user.name}</span>
                <Button
                  variant={"secondary"}
                  onClick={() =>
                    signOut({
                      callbackUrl: "/",
                    })
                  }
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button onClick={() => signIn()} variant={"secondary"}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
