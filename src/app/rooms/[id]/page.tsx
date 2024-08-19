import RoomPage from "~/app/_components/RoomPage";

export default function Room({ params }: { params: { id: string } }) {
  return <RoomPage id={params.id} />;
}
