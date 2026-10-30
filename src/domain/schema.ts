import { z } from "zod";
import { PLATFORM_ISSUES } from "./platform";

const id = z.string().regex(/^[a-z0-9][a-z0-9._-]*$/);
const text = z.string().trim().min(1);
const date = z.iso.date();
const refs = z.array(id).min(1);
const websiteUrl = z.url().refine((value) => /^https?:\/\//.test(value), "Website URL must use HTTP(S)");
const birthDate = z.union([date, z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)]);
const portrait = z.object({
  src: z.string().regex(/^\/portraits\/[a-z0-9-]+\.jpg$/),
  sourceId: id,
  credit: text,
  licenseUrl: z.enum(["https://creativecommons.org/licenses/by-sa/4.0/", "https://creativecommons.org/publicdomain/zero/1.0/"]).optional(),
}).strict();
const review = z.object({
  state: z.enum(["draft", "reviewed"]),
  reviewer: text.nullable(),
  reviewedAt: date.nullable(),
}).strict().refine((r) => r.state !== "reviewed" || (r.reviewer !== null && r.reviewedAt !== null), {
  message: "Reviewed records require a reviewer and review date",
});
const publication = { publication: z.enum(["draft", "published"]), review };
const sourced = { sourceIds: refs };
const questionRef = z.object({ questionId: id, questionVersion: z.number().int().positive() }).strict();

export const entitySchemas = {
  geographies: z.object({ id, name: text, type: z.enum(["state", "district", "county"]), stateId: id.nullable(), boundaryVintage: text, boundarySourceIds: refs, geometryRef: text, overlappingCountyIds: z.array(id) }).strict(),
  elections: z.object({ id, cycle: z.number().int().min(1788).max(2200), stage: z.enum(["primary", "general", "runoff", "special"]), date: date.nullable(), status: z.enum(["scheduled", "completed", "unknown"]), ...sourced }).strict(),
  races: z.object({ id, office: z.enum(["house", "senate", "governor", "secretary-of-state", "treasurer"]), electionId: id, geographyId: id, ...sourced }).strict(),
  candidates: z.object({ id, givenName: text, familyName: text, biography: text.nullable(), birthDate: birthDate.nullable().optional(), birthDateSourceId: id.optional(), portrait: portrait.nullable().optional(), ...sourced }).strict(),
  candidacies: z.object({ id, candidateId: id, runningMateCandidateId: id.optional(), raceId: id, party: text, campaignWebsite: z.object({ url: websiteUrl, sourceId: id }).strict().optional(), ballotQualified: z.boolean(), status: z.enum(["qualified", "withdrawn", "defeated", "elected", "unknown", "certified-write-in"]), statusDate: date, ...sourced }).strict(),
  questions: z.object({ id, version: z.number().int().positive(), wording: text, topic: text, raceIds: refs }).strict(),
  localSelections: z.object({ id, raceId: id, questions: z.array(questionRef).min(1), rationale: text, ...sourced, ...publication }).strict(),
  positions: z.object({ id, candidacyId: id, ...questionRef.shape, kind: z.enum(["quotation", "platform-summary"]), statement: text, label: z.enum(["supports", "opposes", "conditional-mixed", "no-explicit-position-found"]).nullable(), evidenceDate: date.nullable(), researchedAt: date, researchScope: text, ...sourced, ...publication }).strict(),
  platformIssues: z.object({
    id, candidacyId: id, issueId: z.enum(PLATFORM_ISSUES.map((issue) => issue.id)),
    version: z.number().int().positive(),
    status: z.enum(["position-found", "no-position-found"]),
    proposals: z.array(z.object({
      id, summary: text,
      evidence: z.array(z.object({ sourceId: id, excerpt: text, locator: text }).strict()).min(1),
    }).strict()),
    ...sourced, researchedAt: date, researchScope: text, ...publication,
    approval: z.object({ humanReviewer: text, approvedAt: date }).strict().nullable(),
  }).strict().superRefine((record, ctx) => {
    const fail = (path: string[], message: string) => ctx.addIssue({ code: "custom", path, message });
    if (record.status === "position-found" && record.proposals.length === 0) fail(["proposals"], "Found positions require proposals");
    if (record.status === "no-position-found" && record.proposals.length !== 0) fail(["proposals"], "No-position findings cannot contain proposals");
    if (record.publication === "published" && record.approval === null) fail(["approval"], "Published platform revisions require explicit human approval");
    if (record.publication === "draft" && record.approval !== null) fail(["approval"], "Draft platform revisions cannot carry approval");
  }),
  records: z.object({ id, candidateId: id, kind: z.enum(["vote", "action", "outcome"]), jurisdiction: text, eventDate: date, description: text, ...sourced, ...publication }).strict(),
  sources: z.object({ id, url: z.url().refine((v) => /^https?:\/\//.test(v), "Source URL must use HTTP(S)"), title: text, type: z.enum(["campaign", "official", "independent"]), publisher: text, publishedAt: date.nullable(), eventDate: date.nullable(), retrievedAt: date, locator: text }).strict(),
  freshness: z.object({ id, subjectType: z.enum(["candidacies", "positions", "records"]), subjectId: id, category: z.enum(["ballot", "position", "record", "finance", "polling"]), checkedAt: date.nullable(), intervalDays: z.number().int().positive(), nextReviewAt: date.nullable(), review }).strict(),
  coverage: z.object({ id, geographyIds: z.array(id), raceIds: z.array(id), completeness: z.enum(["unavailable", "incomplete", "complete"]), limitations: text, verifiedAt: date.nullable(), sourceIds: z.array(id), ...publication }).strict(),
  historicalResults: z.object({ id, year: z.number().int().min(1788).max(2200), geographyId: id, boundaryVintage: text, measure: z.literal("presidential-vote-share"), values: z.array(z.object({ party: text, share: z.number().min(0).max(1) }).strict()).min(1), comparability: z.enum(["verified", "not-comparable", "unknown"]), ...sourced, ...publication }).strict(),
};

const datasetObject = z.object({
  geographies: z.array(entitySchemas.geographies), elections: z.array(entitySchemas.elections),
  races: z.array(entitySchemas.races), candidates: z.array(entitySchemas.candidates),
  candidacies: z.array(entitySchemas.candidacies), questions: z.array(entitySchemas.questions),
  localSelections: z.array(entitySchemas.localSelections), positions: z.array(entitySchemas.positions),
  records: z.array(entitySchemas.records), sources: z.array(entitySchemas.sources),
  freshness: z.array(entitySchemas.freshness), coverage: z.array(entitySchemas.coverage),
  historicalResults: z.array(entitySchemas.historicalResults),
  platformIssues: z.array(entitySchemas.platformIssues).default([]),
}).strict();

export type Dataset = z.infer<typeof datasetObject>;
export type Collection = keyof Dataset;
export type Entity<K extends Collection> = Dataset[K][number];

export const datasetSchema = datasetObject.superRefine((data, ctx) => {
  const fail = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
  const exists = (collection: Collection, value: string) => data[collection].some((item) => item.id === value);
  for (const collection of Object.keys(data) as Collection[]) {
    const seen = new Set<string>();
    data[collection].forEach((item, index) => {
      const key = collection !== "platformIssues" && "version" in item ? `${item.id}@${item.version}` : item.id;
      if (seen.has(key)) fail([collection, index, "id"], "Duplicate ID/version");
      seen.add(key);
      if ("sourceIds" in item) for (const sourceId of item.sourceIds) {
        if (!exists("sources", sourceId)) fail([collection, index, "sourceIds"], `Missing source: ${sourceId}`);
      }
      if ("publication" in item && item.publication === "published" && item.review.state !== "reviewed") {
        fail([collection, index, "publication"], "Published editorial records require human review");
      }
    });
  }
  const link = (collection: Collection, index: number, field: string, target: Collection, value: string) => {
    if (!exists(target, value)) fail([collection, index, field], `Missing ${target}: ${value}`);
  };
  data.geographies.forEach((g, i) => {
    if (g.type === "state" && g.stateId !== null) fail(["geographies", i, "stateId"], "States cannot have a parent state");
    if (g.type !== "state" && !data.geographies.some((s) => s.id === g.stateId && s.type === "state")) fail(["geographies", i, "stateId"], "Districts/counties require a state");
    for (const source of g.boundarySourceIds) link("geographies", i, "boundarySourceIds", "sources", source);
    for (const county of g.overlappingCountyIds) if (!data.geographies.some((c) => c.id === county && c.type === "county" && c.stateId === g.stateId)) fail(["geographies", i, "overlappingCountyIds"], "County must belong to the same state");
  });
  data.races.forEach((r, i) => {
    link("races", i, "electionId", "elections", r.electionId);
    const g = data.geographies.find((g) => g.id === r.geographyId);
    if (!g || g.type !== (r.office === "house" ? "district" : "state")) fail(["races", i, "geographyId"], "House requires district; statewide offices require state");
  });
  data.candidacies.forEach((c, i) => {
    link("candidacies", i, "candidateId", "candidates", c.candidateId);
    link("candidacies", i, "raceId", "races", c.raceId);
    if (c.runningMateCandidateId) {
      link("candidacies", i, "runningMateCandidateId", "candidates", c.runningMateCandidateId);
      if (c.runningMateCandidateId === c.candidateId || !data.races.some((race) => race.id === c.raceId && race.office === "governor")) {
        fail(["candidacies", i, "runningMateCandidateId"], "Only governor tickets may have a distinct running mate");
      }
    }
        if (c.campaignWebsite) link("candidacies", i, "campaignWebsite", "sources", c.campaignWebsite.sourceId);
    if (c.status === "certified-write-in" && c.ballotQualified) fail(["candidacies", i, "ballotQualified"], "Certified write-ins are not printed ballot candidates");
    if (c.status === "qualified" && !c.ballotQualified) fail(["candidacies", i, "ballotQualified"], "Qualified status requires ballot qualification");
  });
  data.questions.forEach((q, i) => q.raceIds.forEach((race) => link("questions", i, "raceIds", "races", race)));
  const questionForRace = (ref: z.infer<typeof questionRef>, raceId: string | undefined) => data.questions.some((q) => q.id === ref.questionId && q.version === ref.questionVersion && raceId !== undefined && q.raceIds.includes(raceId));
  data.localSelections.forEach((s, i) => {
    link("localSelections", i, "raceId", "races", s.raceId);
    const seen = new Set<string>();
    for (const q of s.questions) {
      if (!questionForRace(q, s.raceId)) fail(["localSelections", i, "questions"], "Question/version must apply to selection race");
      const key = `${q.questionId}@${q.questionVersion}`;
      if (seen.has(key)) fail(["localSelections", i, "questions"], "Duplicate question selection");
      seen.add(key);
    }
  });
  data.positions.forEach((p, i) => {
    link("positions", i, "candidacyId", "candidacies", p.candidacyId);
    const candidacy = data.candidacies.find((c) => c.id === p.candidacyId);
    if (!questionForRace(p, candidacy?.raceId)) fail(["positions", i, "questionId"], "Question/version must apply to candidacy race");
    if (p.label !== null && p.review.state !== "reviewed") fail(["positions", i, "label"], "Policy classifications require human review");
  });
  const platformVersions = new Set<string>();
  data.platformIssues.forEach((record, i) => {
    link("platformIssues", i, "candidacyId", "candidacies", record.candidacyId);
    const candidacy = data.candidacies.find((c) => c.id === record.candidacyId);
    if (!data.races.some((race) => race.id === candidacy?.raceId && race.office === "house")) {
      fail(["platformIssues", i, "candidacyId"], "Platform revisions require a House candidacy");
    }
    const key = `${record.candidacyId}@${record.issueId}@${record.version}`;
    if (platformVersions.has(key)) fail(["platformIssues", i, "version"], "Duplicate candidacy/issue/version");
    platformVersions.add(key);
    const proposalIds = new Set<string>();
    record.proposals.forEach((proposal, p) => {
      if (proposalIds.has(proposal.id)) fail(["platformIssues", i, "proposals", p, "id"], "Duplicate proposal ID");
      proposalIds.add(proposal.id);
      proposal.evidence.forEach((evidence, e) => {
        const path = ["platformIssues", i, "proposals", p, "evidence", e, "sourceId"];
        if (!exists("sources", evidence.sourceId)) fail(path, `Missing source: ${evidence.sourceId}`);
        if (!record.sourceIds.includes(evidence.sourceId)) fail(path, "Evidence source must belong to revision sourceIds");
      });
    });
  });
  data.candidates.forEach((candidate, i) => {
    if (candidate.birthDate && !candidate.birthDateSourceId) fail(["candidates", i, "birthDateSourceId"], "Birth dates require a source");
    if (candidate.birthDateSourceId) link("candidates", i, "birthDateSourceId", "sources", candidate.birthDateSourceId);
    if (candidate.portrait) link("candidates", i, "portrait", "sources", candidate.portrait.sourceId);
  });
  data.records.forEach((r, i) => link("records", i, "candidateId", "candidates", r.candidateId));
  data.freshness.forEach((r, i) => {
    link("freshness", i, "subjectId", r.subjectType, r.subjectId);
    if (r.checkedAt && r.nextReviewAt && r.nextReviewAt < r.checkedAt) fail(["freshness", i, "nextReviewAt"], "Next review precedes last check");
  });
  data.coverage.forEach((c, i) => {
    c.geographyIds.forEach((g) => link("coverage", i, "geographyIds", "geographies", g));
    c.raceIds.forEach((r) => link("coverage", i, "raceIds", "races", r));
    if (c.completeness !== "unavailable" && (!c.verifiedAt || c.sourceIds.length === 0 || c.geographyIds.length === 0 || c.raceIds.length === 0)) fail(["coverage", i], "Available coverage requires scope and dated verification sources");
  });
  data.historicalResults.forEach((r, i) => {
    const g = data.geographies.find((g) => g.id === r.geographyId);
    if (!g) fail(["historicalResults", i, "geographyId"], "Missing geography");
    if (r.publication === "published" && (r.comparability !== "verified" || g?.boundaryVintage !== r.boundaryVintage)) fail(["historicalResults", i], "Published results require verified comparable boundaries");
    if (r.values.reduce((sum, v) => sum + v.share, 0) > 1.000001) fail(["historicalResults", i, "values"], "Vote shares exceed one");
  });
});
