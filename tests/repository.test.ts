import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, expect, it } from "vitest";
import { createFileRepository } from "../src/repositories/file";
import { RepositoryError, type ResearchRepository } from "../src/repositories/types";
import { researchFixture } from "./fixtures/research";

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))); });
async function repository(raw: string): Promise<ResearchRepository> {
  const dir = await mkdtemp(join(tmpdir(), "voter-informer-test-")); directories.push(dir);
  const file = join(dir, "research.json"); await writeFile(file, raw);
  return createFileRepository(pathToFileURL(file));
}
it("reads through the async public contract with missing/empty semantics", async () => {
  const repo = await repository(JSON.stringify(researchFixture()));
  expect((await repo.list("geographies"))[0]?.id).toBe("state");
  expect((await repo.get("candidates", "person"))?.familyName).toBe("Candidate");
  expect(await repo.get("candidates", "absent")).toBeNull();
  expect(await repo.list("records")).toEqual([]);
  expect(await repo.get("questions", "question")).toBeNull();
  expect((await repo.get("questions", "question", 1))?.version).toBe(1);
});
it("filters drafts and protects the stored snapshot from mutation", async () => {
  const data = researchFixture(); data.positions[0]!.publication = "draft";
  const repo = await repository(JSON.stringify(data));
  expect(await repo.list("positions")).toEqual([]);
  expect(await repo.get("positions", "position")).toBeNull();
  const candidates = await repo.list("candidates"); candidates[0]!.familyName = "Changed";
  expect((await repo.get("candidates", "person"))?.familyName).toBe("Candidate");
});
it.each(["{broken", JSON.stringify({ sources: [] })])("fails closed on corrupt data", async (raw) => {
  const repo = await repository(raw);
  await expect(repo.list("candidates")).rejects.toBeInstanceOf(RepositoryError);
});
it("rejects missing storage with a safe error", async () => {
  const dir = await mkdtemp(join(tmpdir(), "voter-informer-test-")); directories.push(dir);
  const repo = createFileRepository(pathToFileURL(join(dir, "missing.json")));
  await expect(repo.list("races")).rejects.toThrow("Research data could not be loaded or validated");
});
