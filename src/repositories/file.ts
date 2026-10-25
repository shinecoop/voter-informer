import { readFile } from "node:fs/promises";
import { datasetSchema, type Dataset } from "../domain/schema";
import type { ResearchRepository } from "./types";
import { RepositoryError } from "./types";

/** Load and validate a snapshot once. No partial data is returned after failure. */
export function createFileRepository(file: URL): ResearchRepository {
  let snapshot: Promise<Dataset> | undefined;
  const load = () => snapshot ??= readFile(file, "utf8")
    .then((raw) => datasetSchema.parse(JSON.parse(raw)))
    .catch(() => { throw new RepositoryError("Research data could not be loaded or validated"); });

  return {
    async list(collection) {
      const data = await load();
      // Draft editorial records never cross the public data boundary.
      const records = data[collection].filter((record) => !("publication" in record) || record.publication === "published");
      return structuredClone(records);
    },
    async get(collection, id, version) {
      const records = await this.list(collection);
      return records.find((record) => record.id === id && (!("version" in record) || record.version === version)) ?? null;
    },
  };
}
