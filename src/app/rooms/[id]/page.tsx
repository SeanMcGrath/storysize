import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import RoomPage from "~/app/_components/RoomPage";

export default async function Room({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(
      "/api/auth/signin?callbackUrl=" +
        encodeURIComponent(`/rooms/${params.id}`),
    );
  }

  return <RoomPage id={params.id} />;
}
