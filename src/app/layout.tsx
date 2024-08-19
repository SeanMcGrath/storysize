import "~/styles/globals.css";
import { Inter } from "next/font/google";
import Providers from "~/app/_components/Providers";
import Navbar from "~/app/_components/Navbar";
import { Toaster } from "~/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Scrum Poker",
  description: "A Scrum Poker app for agile teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
