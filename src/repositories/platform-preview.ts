import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { datasetSchema } from "../domain/schema";
import { getCandidatePlatform } from "./platform";
import { RepositoryError, type ResearchRepository } from "./types";

/** Public user-testing research path; automated evidence checks do not invent human approval. */
export async function getCandidatePlatformForUserTesting(repository: ResearchRepository, candidacyId: string) {
  return getDraftPlatform(repository, candidacyId);
}

/** Separate development-only preview path. */
export async function getCandidatePlatformPreview(repository: ResearchRepository, candidacyId: string) {
  if (process.env.NODE_ENV !== "development") return null;
  return getDraftPlatform(repository, candidacyId);
}

async function getDraftPlatform(repository: ResearchRepository, candidacyId: string) {
  const platform = await getCandidatePlatform(repository, candidacyId);
  if (!platform) return null;
  const data = await readFile(pathToFileURL(`${process.cwd()}/data/research.json`), "utf8")
    .then((raw) => datasetSchema.parse(JSON.parse(raw)))
    .catch(() => { throw new RepositoryError("Draft research could not be loaded or validated"); });
  const records = data.platformIssues.filter((record) => record.candidacyId === candidacyId);
  const issues = platform.issues.map((issue) => ({
    ...issue,
    record: records.filter((record) => record.issueId === issue.id)
      .sort((a, b) => b.version - a.version)[0] ?? null,
  }));
  const research = data.platformResearch.find(record => record.candidacyId === candidacyId);
  const sourceIds = new Set([
    ...(research?.sourceIds ?? []),
    ...platform.sources.map((source) => source.id),
    ...issues.flatMap((issue) => issue.record?.sourceIds ?? []),
  ]);
  return { ...platform, issues, research, sources: data.sources.filter((source) => sourceIds.has(source.id)) };
}
