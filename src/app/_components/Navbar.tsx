"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";
import CardStackIcon from "~/app/_components/CardStackIcon";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="fixed left-0 right-0 top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link
              href="/"
              className="flex flex-shrink-0 items-center text-black"
            >
              <CardStackIcon className="mr-2" />
              Storysize
            </Link>
          </div>
          <div className="flex items-center">
            {session ? (
              <>
                <Button variant="ghost" asChild className="mr-4">
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {session.user.name}
                  </Link>
                </Button>
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
