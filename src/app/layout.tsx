import "~/styles/globals.css";
import { Inter } from "next/font/google";
import Providers from "~/app/_components/Providers";
import Navbar from "~/app/_components/Navbar";
import { Toaster } from "~/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import AdSenseScript from "./_components/AdSenseScript";
import LayoutFix from "./_components/LayoutFix";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://storysize.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    images: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <Providers>
          <div
            id="main-wrapper"
            className="flex min-h-screen flex-col items-center pt-16"
          >
            <Navbar />
            <main className="flex w-full max-w-7xl flex-1 justify-center py-6 sm:px-6 lg:px-8">
              {children}
              <Analytics />
            </main>
          </div>
        </Providers>
        <Toaster />
        <AdSenseScript />
        <LayoutFix />
      </body>
    </html>
  );
}
