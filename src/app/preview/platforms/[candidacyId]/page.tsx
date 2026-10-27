import { notFound } from "next/navigation";
import { PlatformPage } from "../../../../components/platform-page";
import { getRepository } from "../../../../repositories";
import { getCandidatePlatformPreview } from "../../../../repositories/platform-preview";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Draft Platform Preview | Voter Informer",
  robots: { index: false, follow: false },
};

export default async function Preview({ params }: { params: Promise<{ candidacyId: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { candidacyId } = await params;
  const platform = await getCandidatePlatformPreview(getRepository(), candidacyId);
  if (!platform) notFound();
  return PlatformPage({ platform, preview: true });
}
