import { PlayerProfile } from "@/features/profile/PlayerProfile";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  return <PlayerProfile handle={handle} />;
}
