import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { datasetSchema } from "../domain/schema";
import { getCandidatePlatform } from "./platform";
import { RepositoryError, type ResearchRepository } from "./types";

/** Separate development-only read path; never changes publication or approval metadata. */
export async function getCandidatePlatformPreview(repository: ResearchRepository, candidacyId: string) {
  if (process.env.NODE_ENV !== "development") return null;
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
  const sourceIds = new Set([
    ...platform.sources.map((source) => source.id),
    ...issues.flatMap((issue) => issue.record?.sourceIds ?? []),
  ]);
  return { ...platform, issues, sources: data.sources.filter((source) => sourceIds.has(source.id)) };
}
