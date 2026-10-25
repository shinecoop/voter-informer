import { pathToFileURL } from "node:url";
import { createFileRepository } from "./file";
import type { ResearchRepository } from "./types";

let repository: ResearchRepository | undefined;
export function getRepository(): ResearchRepository {
  // Project-root path also works when Next bundles this server-side module.
  return repository ??= createFileRepository(pathToFileURL(`${process.cwd()}/data/research.json`));
}
export type { ResearchRepository } from "./types";
