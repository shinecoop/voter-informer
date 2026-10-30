import { CandidateListPage } from "../../../../../../components/candidate-list-page";
import { notFound } from "next/navigation";
import { candidatePath, COLORADO_ELECTION_YEAR } from "../../../../../../domain/elections";
import { getDistrictCandidateList, getRepository } from "../../../../../../repositories";

export const dynamicParams = false;
export const metadata = { title: "Congressional Candidates | Voter Informer" };

export function generateStaticParams() {
  return Array.from({ length: 8 }, (_, index) => ({ year: String(COLORADO_ELECTION_YEAR), district: `district-${index + 1}` }));
}

export default async function Candidates({ params }: { params: Promise<{ year: string; district: string }> }) {
  const { year, district } = await params;
  const result = await getDistrictCandidateList(getRepository(), year, district.replace(/^district-/, "district"));
  if (!result) notFound();
  return CandidateListPage({ result, officeLabel: "U.S. House", listLabel: `Colorado district ${result.districtNumber} candidates`, rosterCheckedAt: "October 24, 2026", platformBasePath: candidatePath(result.districtNumber, Number(year)) });
}
