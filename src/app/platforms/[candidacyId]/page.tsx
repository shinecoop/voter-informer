import { notFound } from "next/navigation";
import { PlatformPage } from "../../../components/platform-page";
import { getCandidatePlatform, getRepository } from "../../../repositories";

export const dynamicParams = false;
export const metadata = { title: "Candidate Platform | Voter Informer" };

export async function generateStaticParams() {
  const repository = getRepository();
  const [candidacies, races] = await Promise.all([repository.list("candidacies"), repository.list("races")]);
  const houseRaces = new Set(races.filter((race) => race.office === "house").map((race) => race.id));
  return candidacies.filter((candidacy) => houseRaces.has(candidacy.raceId)).map(({ id }) => ({ candidacyId: id }));
}

export default async function Platform({ params }: { params: Promise<{ candidacyId: string }> }) {
  const { candidacyId } = await params;
  const platform = await getCandidatePlatform(getRepository(), candidacyId);
  if (!platform) notFound();
  return PlatformPage({ platform });
}
