import { Metadata } from "next";
import HomePage from "~/app/_components/HomePage";
import WelcomeText from "./_components/WelcomeText";

export const metadata: Metadata = {
  title: "Storysize: Free Online Scrum Poker for Agile Teams",
  description:
    "Streamline your agile estimation process with Storysize, a free and easy-to-use online Scrum Poker tool. Perfect for remote teams and sprint planning sessions.",
  keywords:
    "scrum poker, planning poker, agile estimation, story points, sprint planning, remote teams, free scrum tool",
  openGraph: {
    title: "Storysize: Free Online Scrum Poker",
    description:
      "Streamline your agile estimation process with our easy-to-use planning poker app.",
    images: [
      {
        url: "https://storysize.co/og-image.png",
        width: 1200,
        height: 630,
        alt: "Storysize - Online Scrum Poker Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Storysize: Free Online Scrum Poker",
    description:
      "Streamline your agile estimation process with our easy-to-use planning poker app.",
    images: ["https://storysize.co/og-image.png"],
  },
};

export default function Home() {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center space-y-8">
      <WelcomeText />
      <HomePage />
      {/* Hidden content for SEO */}
      <div className="sr-only">
        <h2>Why Choose Storysize for Scrum Poker?</h2>
        <ul>
          <li>Free and easy to use</li>
          <li>Perfect for remote agile teams</li>
          <li>Real-time collaboration</li>
          <li>Secure and private rooms</li>
        </ul>
      </div>
    </div>
  );
}
