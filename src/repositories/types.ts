import type { Collection, Entity } from "../domain/schema";

/** Empty reads return []; absent records return null. Load/validation errors reject.
 * Question lookups require the version; list order is storage order, not ranking.
 * Implementations return detached snapshots so callers cannot mutate the store.
 */
export interface ResearchRepository {
  list<K extends Collection>(collection: K): Promise<Entity<K>[]>;
  get<K extends Collection>(collection: K, id: string, version?: number): Promise<Entity<K> | null>;
}

export class RepositoryError extends Error {
  constructor(message: string) { super(message); this.name = "RepositoryError"; }
}
