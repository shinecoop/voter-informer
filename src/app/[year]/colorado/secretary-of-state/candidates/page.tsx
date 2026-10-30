import { notFound } from "next/navigation";
import { CandidateListPage } from "../../../../../components/candidate-list-page";
import { COLORADO_ELECTION_YEAR } from "../../../../../domain/elections";
import { getRepository } from "../../../../../repositories";
import { getStatewideCandidateList } from "../../../../../repositories/candidates";

export const dynamicParams = false;
export const metadata = { title: "Colorado Secretary of State Candidates | Voter Informer" };

export function generateStaticParams() {
  return [{ year: String(COLORADO_ELECTION_YEAR) }];
}

export default async function Candidates({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const result = await getStatewideCandidateList(getRepository(), year, "secretary-of-state");
  if (!result) notFound();
  return CandidateListPage({ result, officeLabel: "Secretary of State", listLabel: "Colorado Secretary of State candidates", rosterCheckedAt: "October 30, 2026" });
}
