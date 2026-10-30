import { notFound } from "next/navigation";
import { PlatformPage } from "../../../../../../../components/platform-page";
import { getCandidatePlatform, getRepository } from "../../../../../../../repositories";

export const dynamicParams = false;
export const metadata = { title: "Candidate Platform | Voter Informer" };

type Params = { year: string; district: string; candidacyId: string };

export async function generateStaticParams(): Promise<Params[]> {
  const repository = getRepository();
  const candidacies = await repository.list("candidacies");
  const params: Params[] = [];
  for (const candidacy of candidacies) {
    const platform = await getCandidatePlatform(repository, candidacy.id);
    if (!platform || platform.geography.stateId !== "co") continue;
    const district = platform.geography.id.match(/district-?([1-8])$/)?.[1];
    if (district) params.push({ year: String(platform.election.cycle), district: `district-${district}`, candidacyId: candidacy.id });
  }
  return params;
}

export default async function Platform({ params }: { params: Promise<Params> }) {
  const { year, district, candidacyId } = await params;
  const platform = await getCandidatePlatform(getRepository(), candidacyId);
  const districtNumber = platform?.geography.id.match(/district-?([1-8])$/)?.[1];
  if (!platform || platform.geography.stateId !== "co" || !districtNumber ||
      year !== String(platform.election.cycle) || district !== `district-${districtNumber}`) notFound();
  return PlatformPage({ platform });
}
