import { CyberLounge } from "@/features/lounge/CyberLounge";

export default async function LoungePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <CyberLounge roomId={roomId} />;
}
