import { readFile } from "node:fs/promises";
import { datasetSchema } from "../src/domain/schema";

const raw: unknown = JSON.parse(await readFile(new URL("../data/research.json", import.meta.url), "utf8"));
datasetSchema.parse(raw);
console.log("Research schema, references, and publication gates passed.");
