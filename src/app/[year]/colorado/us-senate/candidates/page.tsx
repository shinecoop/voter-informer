import { notFound } from "next/navigation";
import { CandidateListPage } from "../../../../../components/candidate-list-page";
import { COLORADO_ELECTION_YEAR } from "../../../../../domain/elections";
import { getRepository } from "../../../../../repositories";
import { getSenateCandidateList } from "../../../../../repositories/candidates";

export const dynamicParams = false;
export const metadata = { title: "Colorado U.S. Senate Candidates | Voter Informer" };

export function generateStaticParams() {
  return [{ year: String(COLORADO_ELECTION_YEAR) }];
}

export default async function Candidates({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const result = await getSenateCandidateList(getRepository(), year);
  if (!result) notFound();
  return CandidateListPage({ result, officeLabel: "U.S. Senate", listLabel: "Colorado U.S. Senate candidates", rosterCheckedAt: "October 30, 2026" });
}
