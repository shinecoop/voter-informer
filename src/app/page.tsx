import { UsMap } from "../components/us-map";
import { RaceBrowser } from "../components/race-browser";
import { getNavigationCoverage } from "../repositories/navigation";
import { getRepository } from "../repositories";

export default async function Home() {
  const coverage = await getNavigationCoverage(getRepository());
  return <main className="landing"><RaceBrowser coverage={coverage} /><UsMap /></main>;
}
