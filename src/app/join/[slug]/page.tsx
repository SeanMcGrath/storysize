import JoinPage from "~/app/_components/JoinPage";

export default function Room({ params }: { params: { slug: string } }) {
  return <JoinPage roomSlug={params.slug} />;
}
